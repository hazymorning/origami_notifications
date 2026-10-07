import { html, LitElement, nothing } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { keyed } from "lit/directives/keyed.js";
import { CARD, parseConfig } from "./config.js";
import { warningDetails } from "./details.js";
import { canDismiss, Dismissals } from "./dismissals.js";
import { Clock, fill, MINUTE } from "./format.js";
import { HeadGestures } from "./gestures.js";
import { infoText } from "./infos.js";
import { buildModel, finishEntries, formatters, isAhead, nextWake } from "./model.js";
import { duration, EASE, ListMotion, SPRING } from "./motion.js";
import { entryColor, focusRow, iconTemplate, imageUrl, opener, rowsTemplate } from "./rows.js";
import { cardTexts, languageOf } from "./strings.js";
import { adoptCss, cardStyles, iconStyles, rowStyles, variables } from "./styles.js";
import { Subscriptions } from "./subs.js";
import { windowIds } from "./weather.js";

export const DIALOG = CARD + "-dialog";

const NARROW_PX = 300;
const NEWS_MS = 2 * MINUTE;

const HASS_PARTS = ["connection", "user", "locale", "config", "localize", "entities", "devices", "areas", "services", "themes", "formatEntityState", "formatEntityName", "formatEntityAttributeValue"];

export const fire = (node, type, detail) => node.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));

export class OrigamiNotificationsCard extends LitElement {
  static styles = [variables, iconStyles, rowStyles, cardStyles];

  static properties = { preview: { type: Boolean, reflect: true } };

  constructor() {
    super();
    // Without it, Home Assistant detaches a hidden card and ends the subscriptions that bring it back.
    this.connectedWhileHidden = true;
    this.preview = false;
    this._data = { notifications: new Map(), repairs: [], todos: new Map(), forecasts: new Map(), conditions: new Map() };
    this._seq = 0;
    this._subs = new Subscriptions();
    this._dismissals = new Dismissals(() => this._refresh());
    this._onDetails = () => this._refresh();
    this._motion = new ListMotion(() => this.requestUpdate());
    this._entries = [];
    this._slides = [];
    this._turnable = [];
    this._watched = [];
    this._wakes = [];
    this._opened = new Set();
    this._things = new Map();
    this._media = new Map();
    this._backdrops = [{}, {}];
    this._open = false;
    this._visible = true;
    // A new key restarts the ring, since a CSS animation restarts only on a new element.
    this._cycleKey = 0;
    this._now = Date.now();
    for (const tag of ["ha-state-icon", "state-display", "ha-ripple"]) {
      if (!customElements.get(tag)) customElements.whenDefined(tag).then(() => this.requestUpdate());
    }
  }

  static getConfigElement() {
    return document.createElement(CARD + "-editor");
  }

  static getStubConfig() {
    return {};
  }

  setConfig(config) {
    this._config = parseConfig(config);
    this.classList.toggle("vertical", this._config.vertical);
    this.classList.toggle("bounded", typeof config.grid_options?.rows === "number");
    this._derived = null;
    this._refresh();
    this._cycle();
  }

  set hass(hass) {
    const old = this._hass;
    this._hass = hass;
    if (!old || HASS_PARTS.some((k) => old[k] !== hass[k]) || this._watched.some((id) => old.states[id] !== hass.states[id])) this._refresh();
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    return this._open ? 1 + this.listed().length : this._config?.vertical ? 2 : 1;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: this._config?.vertical ? 3 : 6 };
  }

  connectedCallback() {
    super.connectedCallback();
    clearTimeout(this._collapseTimer);
    const host = this.getRootNode().host?.localName;
    this.classList.toggle("docked", host === "hui-view-footer");
    this._inPicker = host === "hui-card-picker";
    this._dismissals.connect();
    this._onVisibility ||= () => this._onView(this._visible);
    document.addEventListener("visibilitychange", this._onVisibility);
    this._resize ||= new ResizeObserver(([entry]) => this._onResize(entry.contentRect.width));
    // The observer can report several changes at once, and only the last one holds.
    this._view ||= window.IntersectionObserver && new IntersectionObserver((changes) => this._onView(changes.at(-1).isIntersecting), { threshold: 0.01 });
    this._view?.observe(this);
    const card = this.renderRoot?.querySelector("ha-card");
    if (card) this._resize.observe(card);
    this._painted = false;
    this._intro = true;
    this._refresh();
    this._cycle();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._subs.clear();
    this._dismissals.disconnect();
    this._gestures?.reset();
    for (const query of this._media.values()) query.onchange = null;
    this._media.clear();
    document.removeEventListener("visibilitychange", this._onVisibility);
    this._resize?.disconnect();
    this._view?.disconnect();
    [this._wakeTimer, this._clock, this._turnTimer, this._repairsTimer].forEach(clearTimeout);
    // The dashboard editor detaches and attaches cards while it moves them.
    this._collapseTimer = setTimeout(() => this._setOpen(false), 150);
  }

  _derive() {
    const hass = this._hass;
    const config = this._config;
    const key = [config, hass.entities, hass.devices, hass.locale, hass.localize, hass.config, hass.user];
    if (this._derived?.key.every((part, i) => part === key[i])) return this._derived;
    const lang = languageOf(hass);
    const texts = cardTexts(lang, hass.localize);
    const reg = hass.entities || {};
    const listed = new Set(config.entities.map((e) => e.entity));
    const labelled = config.label ? Object.keys(reg).filter((id) => !listed.has(id) && reg[id]?.labels?.includes(config.label)) : [];
    const people = [...new Set(Object.values(config.audience).flatMap((rule) => rule.only || rule.except))];
    const byDevice = new Map();
    for (const [id, entry] of Object.entries(reg)) {
      if (entry?.device_id && /^(image|camera)\./.test(id)) byDevice.set(entry.device_id, [...(byDevice.get(entry.device_id) || []), id].sort().reverse());
    }
    this._derived = {
      key,
      lang,
      texts,
      clock: new Clock(hass, lang, texts),
      sources: [...config.entities, ...labelled.map((entity) => ({ entity }))],
      people,
      viewer: people.find((id) => hass.states[id]?.attributes.user_id === hass.user?.id) || "",
      updates: config.updates ? [...new Set([...Object.keys(hass.states), ...Object.keys(reg)])].filter((id) => id.startsWith("update.")) : [],
      windows: config.weather ? windowIds(hass.states) : [],
      pictures: (id) => byDevice.get(reg[id]?.device_id) || [],
    };
    return this._derived;
  }

  _refresh() {
    const hass = this._hass;
    if (!hass || !this._config) return;
    const d = this._derive();
    const data = this._data;
    const now = Date.now();
    const need = { todos: new Set(), forecasts: new Map(), conditions: new Map() };
    const model = buildModel({
      hass,
      config: this._config,
      now,
      texts: d.texts,
      clock: d.clock,
      admin: Boolean(hass.user?.is_admin),
      viewer: d.viewer,
      preview: this.preview,
      sources: d.sources,
      updates: d.updates,
      windows: d.windows,
      devicePictures: d.pictures,
      details: (st) => warningDetails(hass, st, this._onDetails),
      todos: (id) => {
        need.todos.add(id);
        return data.todos.get(id);
      },
      media: (query) => this._matches(query),
      serverCondition: (condition) => {
        const key = JSON.stringify(condition);
        need.conditions.set(key, condition);
        return data.conditions.get(key) || { result: false, failed: false };
      },
      data: {
        notifications: data.notifications,
        repairs: data.repairs,
        forecast: (id, type) => {
          need.forecasts.set(`${id}|${type}`, [id, type]);
          return data.forecasts.get(`${id}|${type}`);
        },
      },
    });
    this._sync(need);
    for (const e of model.entries) if (e.kind === "attribute" || e.kind === "picture") this._things.set(e.key, e.entity);
    const known = new Set([...model.known, ...[...this._things].filter(([, id]) => model.available.has(id)).map(([k]) => k)]);
    const entries = finishEntries(this._dismissals.apply(model.entries, known, now, model.ctx.wake), model.ctx);
    const news = this._seen && entries.find((e) => !this._seen.has(e.key) && Math.abs(now - e.ts) < NEWS_MS);
    if (news) this._say = [news.title, news.message].filter(Boolean).join(". ");
    this._seen = new Set(entries.map((e) => e.key));
    this._entries = entries;
    this._slides = model.slides;
    this._watched = [...model.watched, ...d.people];
    this._wakes = model.wakes;
    this._now = now;
    this._pick(news);
    clearTimeout(this._wakeTimer);
    const wake = this.isConnected ? nextWake(this._wakes, now) : null;
    if (wake !== null) this._wakeTimer = setTimeout(() => this._refresh(), wake);
    this._tick();
    this.requestUpdate();
    this._dialog?.requestUpdate();
  }

  _sync(need) {
    const hass = this._hass;
    const conn = hass.connection;
    const wanted = new Map();
    const subscribe = (key, message, then, retryOn) => wanted.set(key, { retryOn, start: () => conn.subscribeMessage(then, message) });
    if (conn && this.isConnected) {
      subscribe("notifications", { type: "persistent_notification/subscribe" }, (msg) => this._onNotifications(msg));
      if (this._config.repairs && hass.user?.is_admin) {
        wanted.set("repairs", {
          start: () => {
            this._fetchRepairs();
            return conn.subscribeEvents(() => {
              clearTimeout(this._repairsTimer);
              this._repairsTimer = setTimeout(() => this._fetchRepairs(), 500);
            }, "repairs_issue_registry_updated");
          },
        });
      }
      for (const id of need.todos) {
        subscribe("todo|" + id, { type: "todo/item/subscribe", entity_id: id }, (msg) => this._store("todos", id, msg.items || []), hass.states[id]);
      }
      for (const [key, [id, type]] of need.forecasts) {
        subscribe("forecast|" + key, { type: "weather/subscribe_forecast", entity_id: id, forecast_type: type }, (msg) => this._store("forecasts", key, msg.forecast || []), hass.states[id]);
      }
      for (const [key, condition] of need.conditions) {
        subscribe("condition|" + key, { type: "subscribe_condition", condition }, (msg) => this._store("conditions", key, { result: msg.result === true, failed: Boolean(msg.error) }));
      }
    }
    this._subs.sync(wanted);
  }

  _store(kind, key, value) {
    this._data[kind].set(key, value);
    this._refresh();
  }

  _onNotifications({ type, notifications = {} }) {
    if (type === "current") this._data.notifications = new Map();
    for (const [id, n] of Object.entries(notifications)) {
      if (type === "removed") this._data.notifications.delete(id);
      else this._data.notifications.set(id, { ...n, seq: ++this._seq });
    }
    this._refresh();
  }

  // Loading translations updates hass.localize, which brings the titles.
  async _fetchRepairs() {
    const hass = this._hass;
    try {
      const { issues = [] } = await hass.callWS({ type: "repairs/list_issues" });
      this._data.repairs = issues.filter((issue) => !issue.ignored);
      this._refresh();
      if (!this._data.repairs.length) return;
      await hass.loadBackendTranslation?.("issues", [...new Set(this._data.repairs.map((i) => i.domain))]);
      await hass.loadBackendTranslation?.("title", [...new Set(this._data.repairs.map((i) => i.issue_domain || i.domain))]);
    } catch {}
  }

  _matches(query) {
    if (!this._media.has(query)) {
      const list = window.matchMedia(query);
      list.onchange = () => this._refresh();
      this._media.set(query, list);
    }
    return this._media.get(query).matches;
  }

  listed() {
    const infos = new Map();
    for (const slide of this._slides) if (!infos.has(slide.row)) infos.set(slide.row, slide);
    return [...this._entries, ...[...infos.values()].map((slide) => this._infoRow(slide))];
  }

  _formatters() {
    return { ...formatters(this._hass), clock: this._derive().clock, now: this._now };
  }

  _infoRow(slide) {
    const st = this._hass.states[slide.entity];
    const tap = this._infoAction(slide, "tap");
    return {
      key: slide.row,
      kind: "info",
      title: slide.name,
      message: infoText(st, slide.info.state_content, slide.name, this._formatters()),
      icon: slide.icon,
      image: slide.image,
      stateObj: st,
      color: slide.color,
      ts: NaN,
      tap,
      inert: !tap,
      actions: [],
    };
  }

  _infoAction(slide, gesture) {
    const info = slide.info;
    const config = { entity: slide.entity, tap_action: info.tap_action || { action: "more-info" }, hold_action: info.hold_action, double_tap_action: info.double_tap_action };
    const action = config[gesture + "_action"];
    return action && action.action !== "none" ? { ...config, gesture } : null;
  }

  _run({ gesture = "tap", ...config }) {
    fire(this, "hass-action", { config, action: gesture });
  }

  dismiss(entries) {
    const hass = this._hass;
    this._dismissals.dismiss(entries, (d) => (d.service ? hass.callService(...d.service) : hass.callWS(d.ws)));
  }

  _pick(news) {
    const crit = this._entries.filter((e) => e.sev === "crit");
    const slides = crit.length ? crit : [...this._entries, ...this._slides];
    const top = slides[0] || null;
    const topMoved = Boolean(top && top.kind !== "info" && top.key !== this._topKey);
    this._topKey = top?.key;
    this._turnable = slides;
    let target = slides.find((s) => s.key === this._shown?.key);
    const fresh = news && this._config.rotate ? slides.find((s) => s.key === news.key) : null;
    if (fresh) {
      target = fresh;
      this._byHand = false;
    } else if (!target || topMoved || !this._turned || !(this._config.rotate || this._byHand)) {
      target = top;
    }
    this._show(target, 1, this._config.slide === "side");
  }

  _show(target, dir, side) {
    const from = this._shown;
    this._shown = target;
    if (target?.key === from?.key) return;
    this._cycle();
    const slide = this.renderRoot?.querySelector(".slide:not(.leaving)");
    if (from && slide && this._animate() && !this._open) this._turn(from, slide, dir, side);
    else if (slide) slide.style.transform = slide.style.opacity = "";
  }

  // The leaving slide is drawn again from its entry, so the old and the new one move at the same time.
  async _turn(from, slide, dir, side) {
    const now = getComputedStyle(slide);
    const start = { transform: now.transform, opacity: now.opacity, filter: now.filter };
    const shift = [...slide.querySelectorAll(":scope > div > span")].map((span) => getComputedStyle(span).transform);
    slide.style.transform = slide.style.opacity = "";
    this._turnAnims?.forEach((a) => a.cancel());
    const sign = dir * (side && this._rtl() ? -1 : 1);
    const leaving = (this._leaving = { entry: from, side, shift });
    await this.updateComplete;
    const away = { duration: duration(this, "slow") * 0.8, easing: EASE.out, fill: "forwards" };
    const [axis, px] = side ? ["X", 24] : ["Y", 12];
    this._turnAnims = [
      this.renderRoot.querySelector(".slide.leaving").animate([start, { transform: `translate${axis}(${-sign * px}px)`, opacity: 0, filter: "blur(4px)" }], away),
      this.renderRoot.querySelector(".head .glyph.leaving").animate([{ opacity: 1 }, { opacity: 0, transform: "scale(0.8)", filter: "blur(2px)" }], away),
      ...this._enter(sign, side, duration(this, "slow") * 0.35),
    ];
    await Promise.all(this._turnAnims.map((a) => a.finished)).catch(() => {});
    if (this._leaving !== leaving) return;
    this._leaving = null;
    this.requestUpdate();
  }

  _enter(sign, side, delay = 0) {
    const [axis, px] = side ? ["X", 24] : ["Y", 12];
    const timing = { duration: duration(this, "slow") * 2, delay, easing: SPRING, fill: "backwards" };
    return [
      this.renderRoot.querySelector(".slide:not(.leaving)").animate([{ transform: `translate${axis}(${sign * px}px)`, opacity: 0, filter: "blur(4px)" }, { transform: "none", opacity: 1, filter: "none" }], timing),
      this.renderRoot.querySelector(".head .glyph:not(.leaving)").animate([{ opacity: 0, transform: "scale(0.8)", filter: "blur(2px)" }, { opacity: 1, transform: "none", filter: "none" }], timing),
    ];
  }

  _step(dir, how) {
    const slides = this._turnable;
    if (slides.length < 2) return;
    this._turned = true;
    if (how !== "auto") this._byHand = true;
    const i = Math.max(0, slides.findIndex((s) => s.key === this._shown?.key));
    this._show(slides[(i + dir + slides.length) % slides.length], dir, how === "swipe" || this._config.slide === "side");
    this._tick();
  }

  _cycle() {
    clearTimeout(this._turnTimer);
    this._cycleKey++;
    if (this._config?.rotate > 0 && this.isConnected) this._turnTimer = setTimeout(() => this._autoTurn(), this._config.rotate * 1000);
    this.requestUpdate();
  }

  _autoTurn() {
    const shown = this._shown;
    if (this._visible && !document.hidden && !this._open && !this._dialog && !this._gestures?.press) this._step(1, "auto");
    if (this._shown === shown) this._cycle();
  }

  _tick() {
    clearTimeout(this._clock);
    if (!this.isConnected || !this._visible || document.hidden) return;
    const now = Date.now();
    const listOpen = this._open || Boolean(this._dialog);
    const head = this._shown?.kind !== "info" ? this._shown : null;
    const countdown = (listOpen ? this._entries : head ? [head] : []).find((e) => e.clock && e.ts > now);
    let ms = 0;
    if (countdown) ms = (countdown.ts - now) % 1000 || 1000;
    else if (listOpen || this._entries.some((e) => isAhead(e, now)) || (head && this._headTime(head))) ms = MINUTE - (now % MINUTE);
    if (!ms) return;
    this._clock = setTimeout(() => {
      this._now = Date.now();
      this.requestUpdate();
      this._dialog?.requestUpdate();
      this._tick();
    }, ms);
  }

  _headTime(entry) {
    return Boolean(entry.live || (!entry.message && Number.isFinite(entry.ts)));
  }

  _onView(visible) {
    this._visible = visible;
    this._now = Date.now();
    this.requestUpdate();
    this._tick();
  }

  _onResize(width) {
    const narrow = width > 0 && width < NARROW_PX;
    if (narrow === this.classList.contains("narrow")) return;
    this.classList.toggle("narrow", narrow);
    this.requestUpdate();
  }

  _rtl() {
    return getComputedStyle(this).direction === "rtl";
  }

  _animate() {
    return Boolean(this._painted && !this.preview && this.isConnected && this.getClientRects().length);
  }

  _empty() {
    return !this._entries.length && !this._slides.length && this._config.hide_when_empty && !this.preview && !this._inPicker;
  }

  // A list that scrolls while the drawer still moves would flash a scrollbar.
  _setOpen(open) {
    if (open === this._open) return;
    this._open = open;
    this._settled = false;
    clearTimeout(this._settleTimer);
    if (open) {
      this.classList.toggle("capped", getComputedStyle(this).getPropertyValue("--origami-max-height").trim() !== "");
      this._settleTimer = setTimeout(() => {
        this._settled = true;
        this.requestUpdate();
      }, this._animate() ? duration(this, "normal") : 0);
    }
    if (!open) this._cycle();
    this.requestUpdate();
    this._tick();
  }

  _toggle() {
    if (!this.listed().length) return;
    if (!this._open && this.classList.contains("narrow") && !this.preview && customElements.get("ha-adaptive-dialog")) {
      fire(this, "show-dialog", { dialogTag: DIALOG, dialogImport: () => Promise.resolve(), dialogParams: { card: this } });
      return;
    }
    const refocus = Boolean(this.renderRoot.activeElement);
    this._setOpen(!this._open);
    if (refocus) this.updateComplete.then(() => this.renderRoot.querySelector(this._open ? ".bar" : ".head").focus({ preventScroll: true }));
  }

  _tap() {
    const listed = this.listed();
    const only = listed.length === 1 && opener(listed[0]);
    if (only) this._run(only);
    else this._toggle();
  }

  _tappable(listed) {
    const slide = this._shown;
    return listed.length > 1 || Boolean(listed[0] && opener(listed[0])) || (slide?.kind === "info" && ["hold", "double_tap"].some((g) => this._infoAction(slide, g)));
  }

  _gestureAction(gesture) {
    const action = this._shown?.kind === "info" && this._infoAction(this._shown, gesture);
    return action ? () => this._run(action) : null;
  }

  firstUpdated() {
    const head = this.renderRoot.querySelector(".head");
    this._resize.observe(this.renderRoot.querySelector("ha-card"));
    this._gestures = new HeadGestures(head, {
      canDrag: () => this._turnable.length > 1 && !this._open,
      drag: (dx) => {
        const slide = this.renderRoot.querySelector(".slide:not(.leaving)");
        slide.style.transform = `translateX(${dx * 0.6}px)`;
        slide.style.opacity = String(Math.max(0.2, 1 - Math.abs(dx) / 160));
      },
      dragEnd: (step) => {
        if (step) return this._step(step, "swipe");
        const slide = this.renderRoot.querySelector(".slide:not(.leaving)");
        const from = { transform: slide.style.transform || "none", opacity: slide.style.opacity || "1" };
        slide.style.transform = slide.style.opacity = "";
        slide.animate([from, { transform: "none", opacity: 1 }], { duration: duration(this, "normal"), easing: EASE.standard });
      },
      step: (dir) => this._step(dir, "key"),
      tap: () => this._tap(),
      holdAction: () => this._gestureAction("hold"),
      doubleTapAction: () => this._gestureAction("double_tap"),
      rtl: () => this._rtl(),
    });
  }

  willUpdate(changed) {
    if (changed.has("preview")) this._refresh();
    this._updateBackdrop(this._shown?.backdrop ? imageUrl(this._hass, this._shown.image) : null);
    this._listMotion = this._open && this._animate();
    if (this._listMotion) this._motion.measure(this.renderRoot.querySelector(".list"));
  }

  updated() {
    if (!this._config || !this._hass) return;
    this._motion.play(this.renderRoot.querySelector(".list"), this._listMotion);
    this._setHidden(this._empty());
    this.classList.toggle("dark", Boolean(this._hass.themes?.darkMode));
    this.classList.toggle("with-backdrop", this._backdrops.some((l) => l.on));
    if (this._css !== this._config.css) {
      this._css = this._config.css;
      adoptCss(this, this._css || "");
    }
    if (this._refocus != null) this._focusRow(this._refocus);
    if (this._intro) this._playIntro();
  }

  _playIntro() {
    this._intro = false;
    const side = this._config.slide === "side";
    if (this._turnable.length > 1 && !this.preview && this.getClientRects().length) this._enter(side && this._rtl() ? -1 : 1, side);
    requestAnimationFrame(() => (this._painted = true));
  }

  // The hidden attribute and card-visibility-changed make Home Assistant drop the card's slot.
  _setHidden(hide) {
    if (hide === Boolean(this._hiding || this.hidden)) return;
    this._hostAnim?.cancel();
    const height = getComputedStyle(this).height;
    const sized = !this.classList.contains("bounded");
    const [fast, normal] = [duration(this, "fast"), duration(this, "normal")];
    if (hide) {
      if (!this._animate()) return this._gone();
      this._hiding = true;
      this.classList.add("hiding");
      const frames = [{ opacity: 1, height, easing: EASE.out }, { opacity: 0, height, offset: fast / (fast + normal), easing: EASE.standard }, { opacity: 0, height: sized ? "0px" : height }];
      const anim = (this._hostAnim = this.animate(frames, { duration: fast + normal, fill: "forwards" }));
      anim.finished.then(() => this._hostAnim === anim && this._gone(), () => {});
      return;
    }
    this._hiding = false;
    this.classList.remove("hiding");
    if (!this.hidden) return;
    this.hidden = false;
    fire(this, "card-visibility-changed", { value: true });
    if (!this._animate()) return;
    const to = getComputedStyle(this).height;
    const frames = sized
      ? [{ height: "0px", opacity: 0, easing: EASE.standard }, { height: to, opacity: 0, offset: normal / (fast + normal), easing: EASE.in }, { height: to, opacity: 1 }]
      : [{ opacity: 0 }, { opacity: 1 }];
    this._hostAnim = this.animate(frames, { duration: fast + normal });
  }

  _gone() {
    this._hostAnim?.cancel();
    this._hostAnim = null;
    this._hiding = false;
    this.classList.remove("hiding");
    this.hidden = true;
    fire(this, "card-visibility-changed", { value: false });
    this._setOpen(false);
  }

  _focusRow(index) {
    this._refocus = null;
    focusRow(this.renderRoot, index, this.renderRoot.querySelector(this._open ? ".bar" : ".head"));
  }

  rowView(refocus) {
    const d = this._derive();
    return {
      hass: this._hass,
      texts: d.texts,
      clock: d.clock,
      now: this._now,
      opened: this._opened,
      run: (action) => this._run(action),
      toggle: (key) => {
        if (!this._opened.delete(key)) this._opened.add(key);
        this.requestUpdate();
        this._dialog?.requestUpdate();
      },
      dismiss: (entry, byKeyboard) => {
        const index = this.listed().findIndex((e) => e.key === entry.key);
        this.dismiss([entry]);
        if (byKeyboard) refocus(index);
      },
    };
  }

  setDialog(dialog) {
    this._dialog = dialog;
    this._tick();
    if (!dialog) this._cycle();
  }

  get gone() {
    return this.hidden || Boolean(this._hiding);
  }

  get css() {
    return this._config.css || "";
  }

  get texts() {
    return this._derive().texts;
  }

  dismissible() {
    return this._entries.length > 1 ? this._entries.filter(canDismiss) : [];
  }

  listTitle() {
    const n = this._entries.length;
    const t = this._derive().texts;
    return n ? fill(n === 1 ? t.count_one : t.count_other, { n }) : t.idle_title;
  }

  _secondary(slide, t) {
    if (!slide) return t.idle_msg;
    if (slide.kind !== "info") return this._headTime(slide) ? this._derive().clock.entryTime(slide, this._now) : slide.message;
    if (slide.text != null) return slide.text;
    if (!customElements.get("state-display")) return infoText(slide.stateObj, slide.info.state_content, slide.title, this._formatters());
    return html`<state-display .hass=${this._hass} .stateObj=${slide.stateObj} .content=${slide.info.state_content} .timeFormat=${slide.info.time_format} .name=${slide.title}></state-display>`;
  }

  _slideTemplate(slide, t, leaving) {
    const time = slide && slide.kind !== "info" && this._headTime(slide);
    const secondary = this._secondary(slide, t);
    const line = (text, i) => keyed(slide?.key, html`<span style=${leaving ? `transform: ${leaving.shift[i] || "none"}` : nothing}>${text}</span>`);
    return html`
      <div class="slide ${leaving ? "leaving" : ""}" aria-hidden=${leaving ? "true" : nothing}>
        <div class="title">${line(slide ? slide.title : t.idle_title, 0)}</div>
        ${secondary ? html`<div class="secondary ${time ? "time" : ""}" aria-live=${time && !leaving ? "off" : nothing}>${line(secondary, 1)}</div>` : nothing}
      </div>
    `;
  }

  render() {
    if (!this._config || !this._hass) return nothing;
    const t = this._derive().texts;
    const slide = this._shown;
    const listed = this.listed();
    const tappable = this._tappable(listed);
    const many = listed.length > 1;
    const narrow = this.classList.contains("narrow");
    const count = this._entries.length;
    const leaving = this._leaving;
    const clear = this.dismissible();
    return html`
      <ha-card
        class=${classMap({ open: this._open, crit: slide?.sev === "crit", tappable, settled: this._open && this._settled })}
        style="--tile-color: ${slide ? entryColor(slide) : "var(--state-inactive-color)"}; --origami-cycle: ${this._config.rotate || 8}s"
        @keydown=${(e) => e.key === "Escape" && this._open && (e.stopPropagation(), this._toggle())}
      >
        <div class="backdrop" aria-hidden="true">
          ${this._backdrops.map((l) => (l.url ? html`<img class=${l.on ? "on" : ""} src=${l.url} alt="" draggable="false" referrerpolicy="no-referrer" @load=${() => this._reveal(l)} />` : nothing))}
        </div>
        <div class="pulse"></div>
        <div class="head-wrap">
          <div
            class="head"
            role="button"
            tabindex="0"
            aria-disabled=${String(!tappable)}
            aria-expanded=${many && !narrow ? String(this._open) : nothing}
            aria-haspopup=${many && narrow ? "dialog" : nothing}
          >
            <ha-ripple></ha-ripple>
            <div class=${classMap({ icon: true, idle: !slide })}>
              ${this._config.rotate > 0 && this._turnable.length > 1 ? keyed(this._cycleKey, html`<div class="cycle"><i></i><i></i></div>`) : nothing}
              <div class="glyph">${iconTemplate(slide || { icon: "mdi:bell-outline" }, this._hass)}</div>
              ${leaving ? keyed(leaving, html`<div class="glyph leaving" style="color: ${entryColor(leaving.entry)}">${iconTemplate(leaving.entry, this._hass)}</div>`) : nothing}
              ${count > 1 ? html`<div class="badge">${count > 9 ? "9+" : count}</div>` : nothing}
            </div>
            <div class=${classMap({ texts: true, up: Boolean(leaving && !leaving.side) })}>
              ${this._slideTemplate(slide, t)}
              ${leaving ? keyed(leaving, this._slideTemplate(leaving.entry, t, leaving)) : nothing}
            </div>
            ${many ? html`<ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>` : nothing}
          </div>
        </div>
        <div class="drawer">
          <div class="inner">
            <div class="bar" role="button" tabindex="0" aria-expanded="true" @click=${() => this._toggle()} @keydown=${(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), this._toggle())}>
              <ha-ripple></ha-ripple>
              <span class="count">${this.listTitle()}</span>
              <ha-icon class="chevron" icon="mdi:chevron-up"></ha-icon>
            </div>
            <div class="list" role="list">${rowsTemplate(this._motion.withLeaving(listed, this._listMotion), this.rowView((i) => (this._refocus = i)))}</div>
            <div class=${classMap({ "foot-wrap": true, shown: clear.length > 0 })}>
              <div class="clip">
                <div class="foot">
                  <button class="clear" type="button" tabindex=${clear.length ? "0" : "-1"} @click=${(e) => (this.dismiss(clear), e.detail === 0 && (this._refocus = 0))}>${t.clear}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="say" aria-live="polite">${this._say || ""}</div>
      </ha-card>
    `;
  }

  _updateBackdrop(url) {
    if (url === this._backdropUrl) return;
    this._backdropUrl = url;
    const layers = this._backdrops;
    const shown = layers.find((l) => l.on);
    if (!url) layers.forEach((l) => (l.on = false));
    else if (shown?.url !== url) {
      const next = shown === layers[0] ? layers[1] : layers[0];
      next.url = url;
      if (next.loaded === url) this._reveal(next);
    }
  }

  _reveal(layer) {
    layer.loaded = layer.url;
    if (layer.url !== this._backdropUrl) return;
    this._backdrops.forEach((l) => (l.on = l === layer));
    this.requestUpdate();
  }
}
