/* Origami Notifications, https://github.com/hazymorning/origami_notifications */

const CARD = "origami-notifications";
const EDITOR = CARD + "-editor";
const REPO = "https://github.com/hazymorning/origami_notifications";
const VERSION = "0.4.1";

const DEFAULTS = {
  hide_when_empty: true,
  updates: true,
  repairs: true,
};

const KEY_ORDER = ["entities", "label", "updates", "repairs", "hide_when_empty", "audience", "css"];
const OPTION_KEYS = ["type", "attribute", "name", "icon", "image", "background", "tap_action"];
const ENTITY_KEY_ORDER = ["entity", ...OPTION_KEYS, "actions"];

const ICONS = {
  system: "mdi:bell",
  update: "mdi:rocket-launch",
  repair: "mdi:wrench",
  alarm: "mdi:shield-alert",
  alert: "mdi:alert",
  dwd: "mdi:flash",
  calendar: "mdi:calendar-month",
  attribute: "mdi:card-text-outline",
  picture: "mdi:image-outline",
  generic: "mdi:information-outline",
};

const typeIcon = (type) => ICONS[type] || ICONS.generic;

const langOf = (hass) => (hass && ((hass.locale && hass.locale.language) || hass.language)) || "en";

/* Other languages get English, plus what Home Assistant translates (HA_STRINGS). */
const STRINGS = {
  en: {
    idle_title: "All quiet",
    idle_msg: "No notifications",
    clear: "Clear all",
    dismiss: "Dismiss",
    install: "Install",
    installing: "Installing…",
    installing_pct: "Installing {p}%",
    just_now: "just now",
    soon: "in a moment",
    count_one: "1 notification",
    count_other: "{n} notifications",
    event: "Event",
    notification: "Notification",
    update: "Update",
    update_msg: "Update {v} available",
    update_msg_plain: "Update available",
    level: "Level {l}",
    breaks_in: "Stops working in {v}",
    day_at: "{d} at {t}",
    date_at: "on {d} at {t}",
    on_date: "on {d}",
  },
  de: {
    idle_title: "Alles ruhig",
    idle_msg: "Keine Benachrichtigungen",
    clear: "Alle löschen",
    dismiss: "Löschen",
    install: "Installieren",
    installing: "Wird installiert…",
    installing_pct: "Wird installiert ({p} %)",
    just_now: "gerade eben",
    soon: "gleich",
    count_one: "1 Benachrichtigung",
    count_other: "{n} Benachrichtigungen",
    event: "Termin",
    notification: "Benachrichtigung",
    update: "Update",
    update_msg: "Update {v} verfügbar",
    update_msg_plain: "Update verfügbar",
    level: "Stufe {l}",
    breaks_in: "Funktioniert ab {v} nicht mehr",
    day_at: "{d} um {t}",
    date_at: "am {d} um {t}",
    on_date: "am {d}",
  },
};

/* Home Assistant translates these into every language it supports. */
const HA_STRINGS = {
  idle_title: ["ui.notification_drawer.title"],
  idle_msg: ["ui.notification_drawer.empty"],
  clear: ["ui.notification_drawer.dismiss_all"],
  dismiss: ["ui.card.persistent_notification.dismiss"],
  install: ["ui.dialogs.more_info_control.update.install"],
  installing: ["ui.card.update.installing"],
  installing_pct: ["ui.card.update.installing_with_progress", { progress: "{p}" }],
  update: ["ui.dialogs.more_info_control.update.update"],
};

const borrowedStrings = (localize) => {
  const t = { ...STRINGS.en, just_now: null, soon: null, day_at: "{d}, {t}", date_at: "{d}, {t}", on_date: "{d}" };
  if (typeof localize === "function") {
    for (const [key, [id, vars]] of Object.entries(HA_STRINGS)) {
      const text = localize(id, vars);
      if (text) t[key] = text;
    }
    const title = localize("ui.notification_drawer.title");
    if (title) t.count_one = t.count_other = title + " ({n})";
  }
  return t;
};

/* Home Assistant's notice about a failed login is never shown. */
const MUTED_NOTIFICATIONS = new Set(["http-login"]);

const INACTIVE = new Set(["off", "unavailable", "unknown", "idle", "none", ""]);

const isInactive = (state) => {
  const s = String(state).trim().toLowerCase();
  return INACTIVE.has(s) || Number(s) === 0;
};

/* UpdateEntityFeature.INSTALL */
const UPDATE_INSTALL = 1;

const parseTs = (value, fallback) => {
  const t = value ? Date.parse(value) : NaN;
  return isNaN(t) ? fallback : t;
};

const badgeText = (n) => (n > 9 ? "9+" : String(n));

const REDUCED_MOTION = window.matchMedia
  ? window.matchMedia("(prefers-reduced-motion: reduce)")
  : null;

const motionOK = () => !(REDUCED_MOTION && REDUCED_MOTION.matches);

/* A leaving box fades, then closes its space. An arriving box opens its space, then fades in. */
const FADE_MS = 150;
const SIZE_MS = 250;

/* Material's standard, accelerate and decelerate curves. */
const EASE_STANDARD = "cubic-bezier(0.4, 0, 0.2, 1)";
const EASE_FADE_OUT = "cubic-bezier(0.4, 0, 1, 1)";
const EASE_FADE_IN = "cubic-bezier(0, 0, 0.2, 1)";

/* Home Assistant drops the gap after a hidden card in one jump. Closing ends at a speed of
 * about one gap per frame, so the jump looks like the last frame. In the view footer the gap
 * is the footer's padding, so it is measured. */
const FRAME_MS = 1000 / 60;

const gapPace = (host, height) => {
  const footer = host.classList.contains("docked") && host.getRootNode().host;
  const gap = footer
    ? Math.max(footer.getBoundingClientRect().height - host.getBoundingClientRect().height, 0) || 8
    : parseFloat(getComputedStyle(host).getPropertyValue("--row-gap")) || 8;
  return Math.min(4, (gap * SIZE_MS) / (FRAME_MS * Math.max(height || 0, 1)));
};

/* Closing ends and opening starts at a slope of pace. Above 2.5 the first form would overshoot. */
const easeClose = (pace) =>
  pace <= 2.5
    ? "cubic-bezier(0.4, 0, 0.6, " + (1 - 0.4 * pace).toFixed(3) + ")"
    : "cubic-bezier(0.4, 0, " + (1 - 1 / pace).toFixed(3) + ", 0)";
const easeOpen = (pace) =>
  pace <= 2.5
    ? "cubic-bezier(0.4, " + (0.4 * pace).toFixed(3) + ", 0.6, 1)"
    : "cubic-bezier(" + (1 / pace).toFixed(3) + ", 1, 0.6, 1)";

const FLOW = ["height", "paddingTop", "paddingBottom", "marginTop", "marginBottom", "borderTopWidth", "borderBottomWidth"];

const flowBox = (el) => {
  const cs = getComputedStyle(el);
  const box = {};
  for (const k of FLOW) box[k] = cs[k];
  if (!/px$/.test(box.height)) box.height = el.offsetHeight + "px";
  return box;
};

/* A row also gives back the list gap, with a negative margin towards a neighbour. */
const noBox = (gapSide, gap) => {
  const box = {};
  for (const k of FLOW) box[k] = "0px";
  if (gapSide) box[gapSide] = -gap + "px";
  return box;
};

const gapSide = (el) =>
  el.previousElementSibling ? "marginTop" : el.nextElementSibling ? "marginBottom" : null;

const stopMotion = (el) => {
  if (el._motion) {
    el._motion.onfinish = null;
    el._motion.cancel();
    el._motion = null;
  }
  el.classList.remove("moving", "leaving");
};

/* Borders snap to whole pixels, so they go while the box is invisible, not while it shrinks. */
const NO_BORDER = { borderTopWidth: "0px", borderBottomWidth: "0px" };

/* Holds the closed state until the caller removes the box. */
const playLeave = (el, gap, slide) => {
  const full = flowBox(el);
  const opacity = getComputedStyle(el).opacity;
  stopMotion(el);
  const out = slide ? "translateX(" + slide + "px)" : "none";
  el.classList.add("moving", "leaving");
  el._motion = el.animate(
    [
      { ...full, opacity, transform: "none", easing: EASE_FADE_OUT },
      { ...full, ...NO_BORDER, opacity: 0, transform: out, offset: FADE_MS / (FADE_MS + SIZE_MS), easing: EASE_STANDARD },
      { ...noBox(gap ? gapSide(el) : null, gap), opacity: 0, transform: out },
    ],
    { duration: FADE_MS + SIZE_MS, fill: "forwards" }
  );
  return el._motion;
};

const playEnter = (el, gap) => {
  stopMotion(el);
  const full = flowBox(el);
  el.classList.add("moving");
  el._motion = el.animate(
    [
      { ...noBox(gap ? gapSide(el) : null, gap), opacity: 0, easing: EASE_STANDARD },
      { ...full, ...NO_BORDER, opacity: 0, offset: SIZE_MS / (SIZE_MS + FADE_MS), easing: EASE_FADE_IN },
      { ...full, opacity: 1 },
    ],
    { duration: SIZE_MS + FADE_MS }
  );
  el._motion.onfinish = () => stopMotion(el);
  return el._motion;
};

/* A dismissed item comes back if Home Assistant refuses, or still has it after this long. */
const PENDING_MS = 10000;

const sevClass = (sev) => (sev ? " " + sev : "");

const fill = (template, vars) =>
  template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : ""));

const attrPath = (attrs, path) =>
  path.split(".").reduce((v, k) => (v == null ? v : v[k]), attrs);

const labelled = (hass, label) => {
  const reg = hass && hass.entities;
  if (!label || !reg) return [];
  return Object.keys(reg).filter((id) => ((reg[id] && reg[id].labels) || []).includes(label));
};

/* Building a date format takes far longer than using one, and a countdown asks every second. */
const FORMATS = new Map();

const dateFormat = (lang, opts) => {
  const key = lang + JSON.stringify(opts);
  if (!FORMATS.has(key)) FORMATS.set(key, new Intl.DateTimeFormat(lang, opts));
  return FORMATS.get(key);
};

const serverZone = (hass) => (hass && hass.config && hass.config.time_zone) || undefined;

/* The date and time of ts in timeZone, or in the browser's zone. */
const zonedParts = (ts, timeZone) => {
  const opts = { hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" };
  let parts;
  try {
    parts = dateFormat("en-US", { ...opts, timeZone }).formatToParts(ts);
  } catch (e) {
    parts = dateFormat("en-US", opts).formatToParts(ts);
  }
  const p = {};
  for (const { type, value } of parts) p[type] = Number(value);
  return p;
};

/* Calendars give start_time as the server's wall clock time, without an offset. */
const fromServerTime = (text, timeZone) => {
  const m = /^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d):(\d\d)(?::(\d\d))?)?$/.exec(String(text));
  if (!m) return Date.parse(text);
  const wall = Date.UTC(m[1], m[2] - 1, m[3], m[4] || 0, m[5] || 0, m[6] || 0);
  const offset = (ts) => {
    const p = zonedParts(ts, timeZone);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - ts;
  };
  return wall - offset(wall - offset(wall));
};

/* The first of keys that holds a text or a number. */
const textOf = (obj, keys) => {
  for (const k of keys) {
    const v = obj[k];
    if ((typeof v === "string" && v) || typeof v === "number") return String(v);
  }
  return "";
};

const isEmpty = (v) =>
  v == null || v === "" || v === false || (Array.isArray(v) && v.length === 0) ||
  (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

/* Common on template and REST sensors. Unlike entity_picture, only URLs count. */
const PICTURE_ATTRS = ["image", "image_url", "picture", "thumbnail"];
const URL_LIKE = /^(https?:\/\/|\/|data:image\/)/i;

const findPicture = (attrs) => {
  if (typeof attrs.entity_picture === "string" && attrs.entity_picture) return attrs.entity_picture;
  for (const k of PICTURE_ATTRS) {
    if (typeof attrs[k] === "string" && URL_LIKE.test(attrs[k])) return attrs[k];
  }
  return null;
};

/* Persistent notifications are Markdown. The card shows them as plain text, and a tap follows
 * the first link. */
const plainText = (md) =>
  String(md == null ? "" : md)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/(\*\*|__|~~|`)(.+?)\1/g, "$2")
    .replace(/^ {0,3}(#{1,6} +|> ?|[-*+] +)/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const SAFE_LINK = /^(https?:\/\/|\/(?!\/))/i;

const firstLink = (md) => {
  const text = String(md || "").replace(/!\[[^\]]*\]\([^)]*\)/g, "");
  const m = /\[[^\]]*\]\(([^)\s]+)[^)]*\)/.exec(text);
  return m && SAFE_LINK.test(m[1]) ? m[1] : null;
};

const prettySlug = (slug) => {
  const s = String(slug).replace(/[_-]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const ruleMode = (rule) => (!rule ? "everyone" : "only" in rule ? "only" : "except");

const visibleTo = (rule, viewer) => {
  const mode = ruleMode(rule);
  if (mode === "everyone") return true;
  const listed = rule[mode].includes(viewer);
  return mode === "only" ? listed : !listed;
};

const checkAudience = (audience) => {
  if (audience == null) return {};
  if (typeof audience !== "object" || Array.isArray(audience)) {
    throw new Error(CARD + ": audience must map sources to only or except");
  }
  for (const [key, rule] of Object.entries(audience)) {
    const modes = rule && typeof rule === "object" ? ["only", "except"].filter((m) => m in rule) : [];
    if (modes.length !== 1) {
      throw new Error(CARD + ": audience." + key + " needs either only or except");
    }
    const people = rule[modes[0]];
    if (!Array.isArray(people) || !people.every((id) => typeof id === "string" && id.startsWith("person."))) {
      throw new Error(CARD + ": audience." + key + "." + modes[0] + " must list person entities, e.g. person.anna");
    }
  }
  return audience;
};

/* Text states can mean anything, so detected entities need on, active or a number above 0. */
const isUnambiguouslyActive = (state) => {
  const s = String(state).toLowerCase();
  if (s === "on" || s === "active") return true;
  const n = Number(state);
  return !isNaN(n) && n > 0;
};

/* dwd_weather_warnings levels go from 0 to 4. Level 3 and up is severe weather. Home Assistant
 * renumbers the warnings when one ends, so the key is the warning, not its number. */
const renderDwd = (id, st, items, ctx) => {
  if (!(Number(st.state) > 0)) return;
  const a = st.attributes;
  const count = Number(a.warning_count) || 0;
  const keys = new Set();
  for (let i = 1; i <= count; i++) {
    const w = (field) => a["warning_" + i + "_" + field];
    const title = w("headline") || w("name");
    if (!title) continue;
    const level = Number(w("level")) || 0;
    const text = w("description") || "";
    const start = parseTs(w("start"), NaN);
    let key = "w:" + id + ":" + (w("name") || title) + ":" + (w("start") || "");
    while (keys.has(key)) key += "+";
    keys.add(key);
    items.push({
      key,
      oldKey: "w:" + id + ":" + i,
      kind: "dwd",
      sev: level >= 3 ? "crit" : "warn",
      entity: id,
      title,
      message: text || fill(ctx.t.level, { l: level }),
      ts: isNaN(start) ? parseTs(st.last_changed, ctx.now) : start,
      past: isNaN(start),
      ack: [title, level, text].join("\u0000"),
    });
  }
};

/* An attribute object that describes one thing, like a dish or a parcel. */
const THING_TEXT = ["description", "summary"];

const isThing = (v) => v != null && typeof v === "object" && !Array.isArray(v) && textOf(v, ["name", "title"]) !== "";

/* recipe was the only such attribute up to 0.2. Others need a text or picture besides the name. */
const findThing = (attrs) => {
  if (isThing(attrs.recipe)) return "recipe";
  return Object.keys(attrs).find(
    (k) => isThing(attrs[k]) && [...THING_TEXT, ...PICTURE_ATTRS].some((f) => !isEmpty(attrs[k][f]))
  );
};

/* `type: attribute` shows the thing, or a plain value as the title. `type: picture` shows the
 * state as the title, for sensors like the dish of the day. */
const renderThing = (id, st, items, ctx) => {
  const a = st.attributes;
  const ts = parseTs(st.last_changed, ctx.now);
  /* `type: picture` reads only the attribute it is given, or a recipe as in 0.2. */
  const path = ctx.attribute || (ctx.kind === "picture" ? isThing(a.recipe) && "recipe" : findThing(a));
  const value = path ? attrPath(a, path) : undefined;
  const item = { key: "r:" + id, kind: ctx.kind, entity: id, ts, past: true };
  if (isThing(value)) {
    const title = textOf(value, ["name", "title"]);
    const text = textOf(value, THING_TEXT);
    const image = textOf(value, PICTURE_ATTRS);
    items.push({ ...item, title, message: text || ctx.name(st), image, ack: title + "\u0000" + text });
    return;
  }
  if (ctx.kind === "attribute") {
    if (!ctx.attribute || ctx.objectOnly || isEmpty(value) || typeof value === "object") return;
    const title = ctx.formatAttribute(st, path, value);
    items.push({ ...item, title, titles: [title, String(value)], message: ctx.name(st), ack: String(value) });
    return;
  }
  if (isInactive(st.state)) return;
  items.push({ ...item, title: ctx.format(st), message: ctx.name(st), ack: String(st.state) });
};

const renderCalendar = (id, st, items, ctx) => {
  if (st.state !== "on" || !st.attributes.message) return;
  items.push({
    key: "c:" + id,
    kind: "calendar",
    entity: id,
    title: st.attributes.message,
    message: ctx.calWhen(st.attributes.start_time, st.attributes.all_day),
    ts: parseTs(st.last_changed, ctx.now),
    past: true,
    ack: st.attributes.message + "\u0000" + st.attributes.start_time,
  });
};

/* Installing and skipping need an admin, and Home Assistant refuses to skip an update with
 * auto_update on. Everything else is dismissed locally. */
const renderUpdate = (id, st, items, ctx) => {
  if (st.state !== "on") return;
  const a = st.attributes;
  const t = ctx.t;
  const name = ctx.named ? ctx.name(st) : a.title || ctx.name(st).replace(/\s*update\s*$/i, "").trim();
  const version = a.latest_version;
  const busy = Boolean(a.in_progress);
  const pct = busy && typeof a.update_percentage === "number" ? a.update_percentage : null;
  const canInstall = ctx.admin && (Number(a.supported_features) & UPDATE_INSTALL) === UPDATE_INSTALL;
  items.push({
    key: "u:" + id,
    kind: "update",
    entity: id,
    title: name || t.update,
    message: version ? fill(t.update_msg, { v: version }) : t.update_msg_plain,
    ts: parseTs(st.last_changed, ctx.now),
    past: true,
    dismiss: a.auto_update || !ctx.admin ? undefined : () => ctx.hass.callService("update", "skip", { entity_id: id }),
    actions: busy
      ? [{ label: pct === null ? t.installing : fill(t.installing_pct, { p: Math.round(pct) }), disabled: true }]
      : canInstall
        ? [{ label: t.install, run: () => ctx.hass.callService("update", "install", { entity_id: id }) }]
        : [],
    ack: String(version),
  });
};

/* Alarms can't be dismissed. They stay until the panel moves on. */
const ALARM_SEV = { triggered: "crit", pending: "warn", arming: "warn" };

const renderAlarm = (id, st, items, ctx) => {
  const sev = ALARM_SEV[st.state];
  if (!sev) return;
  items.push({
    key: "a:" + id,
    kind: "alarm",
    sev,
    sticky: true,
    entity: id,
    title: ctx.name(st),
    message: ctx.format(st),
    ts: parseTs(st.last_changed, ctx.now),
    past: true,
  });
};

/* Dismissed locally, because alert.turn_off would silence the alert for everyone. */
const renderAlert = (id, st, items, ctx) => {
  if (st.state !== "on") return;
  items.push({
    key: "al:" + id,
    kind: "alert",
    sev: "warn",
    entity: id,
    title: ctx.name(st),
    message: "",
    ts: parseTs(st.last_changed, ctx.now),
    past: true,
    ack: "",
  });
};

const renderGeneric = (id, st, items, ctx) => {
  const active = ctx.forced ? !isInactive(st.state) : isUnambiguouslyActive(st.state);
  if (!active) return;
  items.push({
    key: "g:" + id,
    kind: "generic",
    entity: id,
    title: ctx.name(st),
    message: ctx.format(st),
    ts: parseTs(st.last_changed, ctx.now),
    past: true,
    ack: String(st.state),
  });
};

/* A recipe attribute claims the entity even while it is empty, as up to 0.2. */
const detectType = (id, st) => {
  const a = st.attributes;
  if (a.warning_count !== undefined) return "dwd";
  if (id.startsWith("calendar.")) return "calendar";
  if (id.startsWith("update.")) return "update";
  if (id.startsWith("alarm_control_panel.")) return "alarm";
  if (id.startsWith("alert.")) return "alert";
  if (findThing(a) || "recipe" in a) return "attribute";
  return "generic";
};

/* The kind an entity shows as. checkConfig has already turned `type: recipe` into an attribute. */
const kindOf = (src, st) => {
  if (src.type && src.type !== "auto") return src.type;
  if (src.attribute) return "attribute";
  return st ? detectType(st.entity_id, st) : "generic";
};

/* In the order the editor offers them. */
const RENDERERS = {
  calendar: renderCalendar,
  update: renderUpdate,
  alarm: renderAlarm,
  alert: renderAlert,
  dwd: renderDwd,
  attribute: renderThing,
  picture: renderThing,
  generic: renderGeneric,
};

/* Titles come from the integration translations, which _refreshRepairs loads. */
const REPAIR_SEV = { critical: "crit", error: "crit", warning: "warn" };

const renderRepair = (issue, items, ctx) => {
  const h = ctx.hass;
  const slug = issue.translation_key || issue.issue_id;
  const key = "component." + issue.domain + ".issues." + slug + ".title";
  const vars = issue.translation_placeholders || {};
  const title =
    (ctx.issueLocalize && ctx.issueLocalize(key, vars)) ||
    (h.localize && h.localize(key, vars)) ||
    prettySlug(slug);
  items.push({
    key: "i:" + issue.domain + "/" + issue.issue_id,
    kind: "repair",
    sev: REPAIR_SEV[issue.severity] || "warn",
    title,
    message: issue.breaks_in_ha_version ? fill(ctx.t.breaks_in, { v: issue.breaks_in_ha_version }) : "",
    ts: parseTs(issue.created, ctx.now),
    past: true,
    dismiss: () =>
      h.callWS({
        type: "repairs/ignore_issue",
        domain: issue.domain,
        issue_id: issue.issue_id,
        ignore: true,
      }),
    open: () => fireAction(ctx.host, { tap_action: { action: "navigate", navigation_path: "/config/repairs" } }),
  });
};

const fire = (node, type, detail) =>
  node.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));

const fireMoreInfo = (host, entityId) => fire(host, "hass-more-info", { entityId });

/* Home Assistant runs the action as for its own cards, with confirmation, haptics and so on. */
const fireAction = (host, config) => fire(host, "hass-action", { config, action: "tap" });

const buildTapAction = (tap, host, entity) =>
  tap && tap.action && tap.action !== "none" ? () => fireAction(host, { entity, tap_action: tap }) : null;

const linkAction = (host, url) => () =>
  fireAction(host, {
    tap_action: url.startsWith("/")
      ? { action: "navigate", navigation_path: url }
      : { action: "url", url_path: url },
  });

/* A renderer that throws only loses its own entity. Overrides apply to every item it made. */
const renderEntity = (id, st, items, ctx, src) => {
  if (!st) return;
  const forced = Boolean(src.type && src.type !== "auto");
  const attribute = src.attribute || null;
  const objectOnly = Boolean(src.objectOnly);
  const kind = kindOf(src, st);
  const renderer = RENDERERS[kind];
  if (!renderer) return;
  const named = Boolean(src.name);
  const name = named ? (s) => ctx.name(s, src.name) : ctx.name;
  const before = items.length;
  try {
    renderer(id, st, items, { ...ctx, forced, kind, attribute, objectOnly, named, name });
  } catch (e) {
    console.warn(CARD + ": renderer failed for " + id, e);
    items.length = before;
    return;
  }
  const ref = src.image;
  const configured = ref && (ref.includes("/") ? ref : attrPath(st.attributes, ref));
  const backdrop = Boolean(src.background);
  for (let i = before; i < items.length; i++) {
    items[i].image = ctx.url(ref ? configured : items[i].image || findPicture(st.attributes));
    items[i].backdrop = backdrop && Boolean(items[i].image);
    /* Up to 0.3 the name replaced the title of every row. */
    if (named) items[i].titles = [...(items[i].titles || [items[i].title]), name(st)];
  }
  if (src.tap_action) {
    const openFn = buildTapAction(src.tap_action, ctx.host, id);
    for (let i = before; i < items.length; i++) {
      items[i].open = openFn;
      if (!openFn) items[i].inert = true;
    }
  }
  const extra = (src.actions || [])
    .map((ac) => ({ label: ac.label, run: buildTapAction(ac.tap_action, ctx.host, id) }))
    .filter((ac) => ac.label && ac.run);
  for (let i = before; i < items.length; i++) {
    if (src.icon) items[i].icon = src.icon;
    if (extra.length) items[i].actions = [...(items[i].actions || []), ...extra];
  }
};

/* A time that says when something happened lies behind, even when Home Assistant's clock runs ahead
 * of the browser's. */
const isAhead = (it, now) => !it.past && it.ts > now;

/* Critical first, then what lies closest to now, ahead or behind. What happened keeps the newest
 * first, even from a clock that runs ahead. Then the latest arrival, and the key keeps the order
 * stable. */
const sortItems = (items, now) => {
  const near = (it) => (!Number.isFinite(it.ts) ? Infinity : it.past ? now - it.ts : Math.abs(it.ts - now));
  return items.sort((a, b) => {
    const ra = a.sev === "crit" ? 0 : 1;
    const rb = b.sev === "crit" ? 0 : 1;
    if (ra !== rb) return ra - rb;
    const da = near(a);
    const db = near(b);
    if (da !== db) return da < db ? -1 : 1;
    if ((a.seq || 0) !== (b.seq || 0)) return (b.seq || 0) - (a.seq || 0);
    return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
  });
};

/* Only moments ahead count. One that has passed would wake the card again and again. */
const waker = (times, now) => (ts) => {
  if (ts > now) times.push(ts);
};

/* An entry goes at its expiry without a change in Home Assistant. The card wakes for that, and for
 * the end of a countdown. */
const dropExpired = (items, now, wake) =>
  items.filter((it) => {
    if (it.expires != null && it.expires <= now) return false;
    if (it.expires != null) wake(it.expires);
    if (it.live) wake(it.ts);
    return true;
  });

/* The order changes on its own once an entry ahead comes as close to now as the one before it.
 * Neighbours always swap first, so the earliest of their swaps is the next change. */
const nextReorder = (items, now) => {
  let next = null;
  for (let i = 1; i < items.length; i++) {
    const a = items[i - 1];
    const b = items[i];
    if ((a.sev === "crit") !== (b.sev === "crit") || !isAhead(b, now) || !(b.ts > a.ts)) continue;
    const at = Math.max((a.ts + b.ts) / 2, now + 1);
    if (next === null || at < next) next = at;
  }
  return next;
};

const DAY_MS = 86400000;

/* One wait for the earliest of times, at most a day. The extra 50 ms make sure the moment has passed. */
const wakeDelay = (times, now) => {
  if (!times.length) return null;
  const next = times.reduce((a, b) => Math.min(a, b), Infinity);
  return Math.min(Math.max(next - now, 0), DAY_MS) + 50;
};

/* A countdown rounds up, so it reads 0:00 only once it has ended. */
const clockText = (ms) => {
  const total = ms > 0 ? Math.ceil(ms / 1000) : 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h ? h + ":" + String(m).padStart(2, "0") + ":" + s : m + ":" + s;
};

/* A running countdown knows its length, so its progress follows the clock. */
const progressAt = (it, now) => {
  const p = it.live && it.duration > 0 ? 1 - (it.ts - now) / it.duration : it.progress;
  return typeof p === "number" && !isNaN(p) ? Math.min(Math.max(p, 0), 1) : null;
};

/* Milliseconds until the times on show change, or 0. A countdown in view changes by the second, in
 * step with its end. Other times change by the minute, while the list is open or an entry lies
 * ahead or has progress. */
const nextTick = (items, head, open, now) => {
  const clock = (open ? items : head ? [head] : []).find((it) => it.clock && it.ts > now);
  if (clock) return (clock.ts - now) % 1000 || 1000;
  if (open || items.some((it) => isAhead(it, now) || it.progress != null)) return 60000 - (now % 60000);
  return 0;
};

/* A row is built again only when something it shows has changed. Times change in place. */
const rowSig = (it) =>
  [
    it.kind,
    it.icon || "",
    it.sev || "",
    it.title,
    it.message,
    Boolean(it.dismiss),
    Boolean(it.open || it.entity) && !it.inert,
    (it.actions || []).map((a) => a.label + (a.disabled ? "!" : "")).join("|"),
  ].join("\u0000");

/* Writing the same text again would make a screen reader announce it again. */
const setText = (el, text) => {
  if (el.textContent !== text) el.textContent = text;
};

const setImage = (tile, url) => {
  let img = tile.querySelector("img");
  if (!url) {
    if (img) img.remove();
    return;
  }
  if (!img) {
    img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    img.draggable = false;
    img.referrerPolicy = "no-referrer";
    img.addEventListener("load", () => img.classList.add("ready"));
    img.addEventListener("error", () => img.classList.remove("ready"));
    tile.prepend(img);
  }
  if (img.getAttribute("src") !== url) img.src = url;
};

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  :host {
    --origami-pad: var(--card-padding, 12px);
    --origami-gap: var(--ha-space-3, 12px);
    --origami-gap-s: var(--ha-space-2, 8px);
    --origami-radius: var(--radius-inner, var(--ha-border-radius-lg, 12px));
    --origami-radius-s: var(--radius-small, var(--ha-border-radius-md, 8px));
    --origami-tile: var(--control-height-icon, 40px);
    --origami-tile-s: var(--control-height-mini, 32px);
    --origami-muted: var(--opacity-muted, 0.6);
    --origami-quiet: var(--opacity-quiet, 0.45);
    --origami-ease: var(--ease-standard, cubic-bezier(0.22, 1, 0.36, 1));
    --origami-time: var(--duration-normal, var(--ha-animation-duration-normal, 250ms));
    --origami-icon: var(--icon-size-s, 20px);
    --origami-focus: var(--fill-strong, var(--ha-color-focus, var(--primary-color)));
    --origami-card-bg: var(--ha-card-background, var(--card-background-color, #fff));
    --origami-row-bg: var(--card-item-background, var(--secondary-background-color));
    --origami-hover: color-mix(in srgb, currentColor 7%, transparent);
    --origami-bg-auto: 0.22;
    display: grid;
    grid-template-rows: 1fr;
    -webkit-tap-highlight-color: transparent;
  }
  :host(.dark) { --origami-bg-auto: 0.32; }
  /* :host sets display, which would beat [hidden]. */
  :host([hidden]) { display: none !important; }
  :host(.leaving) { pointer-events: none; }
  :host(.no-anim), :host(.no-anim) * {
    transition: none !important;
    animation: none !important;
  }
  ha-card {
    background: var(--origami-card-bg);
    display: flex;
    flex-direction: column;
    min-height: 0;
    max-height: var(--origami-max-height, none);
    overflow: hidden;
    isolation: isolate;
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    touch-action: manipulation;
    transition: transform 400ms var(--origami-ease);
  }
  /* In the sections view footer the list scrolls within a quarter of the screen. */
  :host(.docked) ha-card { max-height: var(--origami-max-height, 25dvh); }
  /* With a fixed height from the layout tab the card fills its cell, the header centers and the list
   * scrolls. ha-card is stretched rather than sized, so a margin from css stays inside the cell. */
  :host(.bounded) { height: 100%; }
  :host(.bounded) ha-card:not(.open) .hwrap { flex: 1 1 auto; }
  ha-card.has-items:not(.open):active { transform: scale(0.98); transition-duration: 120ms; }

  .backdrop {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    border-radius: inherit;
    pointer-events: none;
  }
  .backdrop img {
    position: absolute;
    top: calc(var(--origami-bg-blur, 24px) * -2);
    left: calc(var(--origami-bg-blur, 24px) * -2);
    width: calc(100% + var(--origami-bg-blur, 24px) * 4);
    height: calc(100% + var(--origami-bg-blur, 24px) * 4);
    max-width: none;
    object-fit: cover;
    filter: blur(var(--origami-bg-blur, 24px)) saturate(1.3);
    opacity: 0;
    transition: opacity 700ms var(--origami-ease);
  }
  .backdrop img.on { opacity: var(--origami-bg-opacity, var(--origami-bg-auto)); }

  .head {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas: "htl hti hsd" "htl hsub hsd";
    align-content: center;
    column-gap: var(--origami-gap);
    padding: var(--origami-pad);
    outline: none;
  }
  ha-card.has-items .head, .ebar { cursor: pointer; }

  .tile {
    grid-area: htl;
    align-self: center;
    position: relative;
    width: var(--origami-tile);
    height: var(--origami-tile);
    display: flex; align-items: center; justify-content: center;
    background: var(--fill-active, var(--primary-text-color));
    color: var(--text-color-active, var(--origami-card-bg));
    border-radius: var(--origami-radius);
  }
  .tile.warn { background: var(--warning-color); color: var(--text-color-active, var(--primary-background-color)); }
  .tile.crit { background: var(--error-color); color: var(--text-color-active, var(--primary-background-color)); }
  .tile.idle {
    background: var(--origami-row-bg);
    color: var(--primary-text-color);
    opacity: var(--origami-muted);
  }
  .tile ha-icon { --mdc-icon-size: var(--origami-icon); }

  .badge {
    position: absolute;
    top: calc(var(--ha-space-1, 4px) * -1);
    inset-inline-end: calc(var(--ha-space-1, 4px) * -1);
    min-width: 20px; height: 20px;
    padding: 0 4px;
    display: flex; align-items: center; justify-content: center;
    background: var(--origami-card-bg);
    color: var(--primary-text-color);
    border-radius: var(--origami-radius-s);
    box-shadow: var(--ha-card-box-shadow, none);
    font-size: var(--font-size-compact, 11px);
    font-weight: var(--ha-font-weight-bold, 700);
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .badge[hidden] { display: none; }

  .head .title {
    grid-area: hti;
    align-self: end;
    min-width: 0;
    color: var(--primary-text-color);
    font-size: var(--ha-font-size-l, 16px);
    font-weight: var(--ha-font-weight-bold, 700);
    line-height: var(--ha-line-height-condensed, 1.2);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .head.single .title { grid-row: 1 / 3; align-self: center; }
  .head.single .msg { display: none; }
  /* Header and drawer swap through their grid rows, nothing is measured. */
  .hwrap, .drawer {
    display: grid;
    transition: grid-template-rows 280ms var(--origami-ease);
  }
  .hwrap { flex: none; grid-template-rows: 1fr; }
  .drawer { flex: 0 1 auto; min-height: 0; grid-template-rows: 0fr; }
  ha-card.open .hwrap { grid-template-rows: 0fr; }
  ha-card.open .drawer { grid-template-rows: 1fr; }
  .inner { min-height: 0; }
  .head, .inner {
    overflow: hidden;
    transition: opacity 200ms var(--origami-ease), padding 280ms var(--origami-ease), visibility 0s 280ms;
  }
  .inner {
    display: flex; flex-direction: column;
    padding-bottom: 0; opacity: 0; visibility: hidden;
  }
  ha-card.open .head { padding-block: 0; opacity: 0; visibility: hidden; }
  ha-card.open .inner {
    padding-bottom: var(--origami-pad);
    opacity: 1;
    visibility: visible;
    transition: opacity 200ms 80ms var(--origami-ease), padding 280ms var(--origami-ease), visibility 0s;
  }
  ha-card:not(.open) .head {
    transition: opacity 200ms 80ms var(--origami-ease), padding 280ms var(--origami-ease), visibility 0s;
  }
  .ebar {
    flex: none;
    display: flex; align-items: center;
    gap: var(--origami-gap-s);
    padding: var(--origami-pad);
    outline: none;
  }
  .head:focus-visible, .ebar:focus-visible {
    outline: 2px solid var(--origami-focus);
    outline-offset: -2px;
    border-radius: var(--origami-radius);
  }
  .count {
    flex: 1 1 auto;
    color: var(--primary-text-color);
    opacity: var(--origami-muted);
    font-size: var(--ha-font-size-s, 12px);
    font-weight: var(--ha-font-weight-medium, 500);
    font-variant-numeric: tabular-nums;
  }
  .list {
    position: relative;
    flex: 0 1 auto;
    min-height: 0;
    display: flex; flex-direction: column;
    gap: var(--origami-pad);
    padding: 0 var(--origami-pad);
  }
  :host(.docked) .list,
  :host(.bounded) .list,
  :host(.capped) .list {
    overflow: hidden;
    overscroll-behavior: contain;
    scrollbar-width: thin;
  }
  :host(.docked) ha-card.settled .list,
  :host(.bounded) ha-card.settled .list,
  :host(.capped) ha-card.settled .list { overflow-y: auto; }
  /* An animating row hides its overflow, so in a scrolling list it would shrink without flex none. */
  .row {
    flex: none;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas: "rtile rtitle rmeta" "rtile rbody rbody";
    align-items: center;
    column-gap: var(--origami-gap);
    row-gap: 2px;
    padding: var(--origami-pad);
    background: var(--origami-row-bg);
    border-radius: var(--origami-radius);
    transition: box-shadow 150ms ease, background-color var(--origami-time) var(--origami-ease);
  }
  .row.link, .row.expandable, .row.open { cursor: pointer; }
  .row.moving, .foot.moving { overflow: hidden; }
  .row.leaving, .foot.leaving { pointer-events: none; }
  :host(.has-bg) .row { background: color-mix(in srgb, var(--origami-row-bg) 72%, transparent); }
  .rtile {
    grid-area: rtile;
    align-self: start;
    position: relative;
    width: var(--origami-tile-s);
    height: var(--origami-tile-s);
    display: flex; align-items: center; justify-content: center;
    background: var(--fill-active, var(--primary-text-color));
    color: var(--text-color-active, var(--origami-card-bg));
    border-radius: var(--origami-radius-s);
    outline: none;
  }
  .rtile[role="button"] { cursor: pointer; }
  .rtile ha-icon { --mdc-icon-size: var(--icon-size-xs, 18px); display: flex; }
  .rtile.warn { background: var(--warning-color); color: var(--text-color-active, var(--primary-background-color)); }
  .rtile.crit { background: var(--error-color); color: var(--text-color-active, var(--primary-background-color)); }
  .tile img, .rtile img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    border-radius: inherit;
    opacity: 0;
    transition: opacity var(--origami-time) var(--origami-ease);
  }
  img { -webkit-user-drag: none; }
  img.ready { opacity: 1; }
  img.ready ~ ha-icon { visibility: hidden; }
  .row .title {
    grid-area: rtitle;
    min-width: 0;
    color: var(--primary-text-color);
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-bold, 700);
    line-height: var(--ha-line-height-normal, 1.6);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  /* Only a pointer can open a row, so keyboard focus on its buttons shows all of the text. */
  .row:is(.open, :has(:focus-visible)) .title { white-space: normal; overflow-wrap: anywhere; text-wrap: pretty; }
  .meta {
    grid-area: rmeta;
    align-self: start;
    justify-self: end;
    min-height: calc(var(--ha-font-size-m, 14px) * var(--ha-line-height-normal, 1.6));
    display: flex; align-items: center;
    gap: var(--origami-gap-s);
  }
  .when {
    color: var(--primary-text-color);
    opacity: var(--origami-quiet);
    font-size: var(--font-size-compact, 11px);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    white-space: nowrap;
  }
  button {
    -webkit-appearance: none;
    appearance: none;
    font: inherit;
    touch-action: manipulation;
  }
  .x {
    position: relative;
    width: 28px; height: 28px;
    margin: calc((var(--icon-size-xs, 18px) - 28px) / 2);
    display: flex; align-items: center; justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--primary-text-color);
    opacity: var(--origami-quiet);
    border-radius: var(--origami-radius-s);
    cursor: pointer;
    transition: opacity 150ms ease, background-color 150ms ease, transform 150ms ease;
  }
  /* A bigger touch target. */
  .x::before { content: ""; position: absolute; inset: -8px -4px; }
  .x ha-icon { --mdc-icon-size: var(--icon-size-xs, 18px); display: flex; }
  .row .body {
    grid-area: rbody;
    color: var(--primary-text-color);
    opacity: var(--origami-muted);
    font-size: var(--ha-font-size-s, 12px);
    line-height: var(--ha-line-height-normal, 1.6);
    overflow-wrap: anywhere;
    text-wrap: pretty;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    max-height: calc(2 * var(--ha-line-height-normal, 1.6) * 1em);
    overflow: hidden;
  }
  /* An opened message can be selected and copied. */
  .row:is(.open, :has(:focus-visible)) .body {
    display: block;
    -webkit-line-clamp: unset;
    line-clamp: none;
    max-height: none;
    white-space: pre-line;
    -webkit-user-select: text;
    user-select: text;
    cursor: text;
  }
  .actions {
    grid-row: 3;
    grid-column: 2 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: var(--origami-gap-s);
    margin-top: var(--origami-gap-s);
  }
  .act {
    border: none; cursor: pointer;
    height: 28px;
    padding: 0 var(--origami-gap);
    background: var(--fill-strong, color-mix(in srgb, currentColor 10%, transparent));
    color: var(--primary-text-color);
    border-radius: var(--origami-radius-s);
    font-size: var(--font-size-compact, 11px);
    font-weight: var(--ha-font-weight-medium, 500);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    transition: box-shadow 150ms ease, transform 150ms ease;
  }
  .act[disabled] {
    opacity: var(--opacity-disabled, 0.3);
    pointer-events: none;
  }
  .msg {
    grid-area: hsub;
    align-self: start;
    margin-top: 2px;
    overflow: hidden;
    color: var(--primary-text-color);
    opacity: var(--origami-muted);
    font-size: var(--ha-font-size-s, 12px);
    line-height: var(--ha-line-height-normal, 1.6);
    white-space: nowrap;
  }
  .msg.fade { mask-image: linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%); }
  .eta {
    grid-area: hsub;
    align-self: start;
    min-width: 0;
    margin-top: 2px;
    color: var(--primary-text-color);
    opacity: var(--origami-muted);
    font-size: var(--ha-font-size-s, 12px);
    font-variant-numeric: tabular-nums;
    line-height: var(--ha-line-height-normal, 1.6);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .msg[hidden], .eta[hidden] { display: none; }
  .track { display: inline-flex; max-width: 100%; }
  .track .t { flex: 0 0 auto; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .track .dup { display: none; }
  .track.scroll { max-width: none; animation: marquee var(--scroll-s, 12s) linear infinite; }
  .track.scroll:dir(rtl) { animation-name: marquee-rtl; }
  .track.scroll .t { overflow: visible; max-width: none; padding-inline-end: var(--origami-gap); }
  .track.scroll .t::after {
    content: "\\2022";
    padding-inline-start: var(--origami-gap);
    opacity: var(--origami-quiet);
  }
  .track.scroll .dup { display: inline; }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes marquee-rtl { from { transform: translateX(0); } to { transform: translateX(50%); } }

  .head .chev {
    grid-area: hsd;
    align-self: center;
    justify-self: end;
    margin-inline-end: var(--origami-gap-s);
  }
  .chev {
    flex: 0 0 auto;
    color: var(--primary-text-color);
    opacity: var(--origami-muted);
    --mdc-icon-size: var(--icon-size-m, 24px);
    transition: opacity 150ms ease;
  }
  .chev[hidden] { display: none; }

  .foot {
    flex: none;
    margin: var(--origami-pad) var(--origami-pad) 0;
    border-top: var(--separator, 2px solid var(--divider-color, color-mix(in srgb, currentColor 10%, transparent)));
    padding-top: var(--origami-gap-s);
    text-align: end;
  }
  .foot[hidden] { display: none; }
  .clear {
    border: none; cursor: pointer;
    height: var(--origami-tile-s);
    padding: 0 var(--origami-gap);
    background: transparent;
    color: var(--primary-text-color);
    opacity: var(--origami-muted);
    border-radius: var(--origami-radius);
    font-size: var(--ha-font-size-s, 12px);
    font-weight: var(--ha-font-weight-medium, 500);
    transition: opacity 150ms ease, background-color 150ms ease, transform 150ms ease;
  }
  .x:focus-visible, .act:focus-visible, .clear:focus-visible, .rtile:focus-visible {
    outline: 2px solid var(--origami-focus);
    outline-offset: 2px;
  }
  .x:active, .clear:active { transform: scale(0.92); }
  .act:active { transform: scale(0.96); }

  @media (hover: hover) {
    .msg:hover .track.scroll { animation-play-state: paused; }
    .head:hover .chev, .ebar:hover .chev { opacity: 1; }
    .row.link:hover, .row.expandable:hover, .row.open:hover { box-shadow: inset 0 0 0 100vmax var(--origami-hover); }
    .x:hover, .clear:hover { opacity: 1; background-color: var(--origami-hover); }
    .act:hover { box-shadow: inset 0 0 0 100vmax var(--origami-hover); }
  }

  /* The background picture is decoration, so it goes for less transparency or more contrast. */
  @media (prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active) {
    .backdrop { display: none; }
    :host(.has-bg) .row { background: var(--origami-row-bg); }
  }

  @media (prefers-reduced-motion: reduce) {
    :host, :host * {
      transition: none !important;
      animation: none !important;
    }
  }
`;

const TEMPLATE = `
  <style>${STYLES}</style>
  <ha-card>
    <div class="backdrop" aria-hidden="true"><img alt="" draggable="false"><img alt="" draggable="false"></div>
    <div class="hwrap">
      <div class="head" role="button" tabindex="0" aria-expanded="false" aria-live="polite">
        <div class="tile"><ha-icon></ha-icon><div class="badge"></div></div>
        <div class="title"></div>
        <div class="msg"><div class="track"><span class="t"></span><span class="t dup" aria-hidden="true"></span></div></div>
        <div class="eta" aria-live="off" hidden></div>
        <ha-icon class="chev" icon="mdi:chevron-down"></ha-icon>
      </div>
    </div>
    <div class="drawer"><div class="inner">
      <div class="ebar" role="button" tabindex="0" aria-expanded="true">
        <span class="count"></span>
        <ha-icon class="chev" icon="mdi:chevron-up"></ha-icon>
      </div>
      <div class="list" role="list"></div>
      <div class="foot"><button class="clear" type="button"></button></div>
    </div></div>
  </ha-card>
`;

const isObject = (v) => v != null && typeof v === "object" && !Array.isArray(v);

/* Checks a config and returns its sources. The editor uses it too, so Home Assistant keeps a
 * broken config in the YAML editor instead of letting the visual editor drop parts of it. */
const checkConfig = (config) => {
  const fail = (message) => {
    throw new Error(CARD + ": " + message);
  };
  if (config.entities != null && !Array.isArray(config.entities)) fail("entities must be a list");
  const sources = [];
  for (const entry of config.entities || []) {
    const src =
      typeof entry === "string"
        ? { entity: entry, type: "auto" }
        : {
            entity: entry && entry.entity,
            type: (entry && entry.type) || "auto",
            attribute: entry ? entry.attribute : null,
            icon: entry ? entry.icon : null,
            name: entry ? entry.name : null,
            image: entry ? entry.image : null,
            background: entry ? entry.background : null,
            actions: entry ? entry.actions : null,
            tap_action: entry ? entry.tap_action : null,
          };
    if (typeof src.entity !== "string" || !src.entity.includes(".")) {
      fail("entities must contain entity ids, got " + JSON.stringify(entry));
    }
    /* `type: recipe` from 0.2, which showed objects only. */
    if (src.type === "recipe") {
      src.type = "attribute";
      src.attribute = src.attribute || "recipe";
      src.objectOnly = true;
    }
    if (src.type !== "auto" && !RENDERERS[src.type]) fail("unknown source type '" + src.type + "'");
    if (src.attribute != null && typeof src.attribute !== "string") fail("attribute must be the name of an attribute");
    if (src.image != null && typeof src.image !== "string") fail("image must be an attribute path or URL");
    if (src.background != null && typeof src.background !== "boolean") fail("background must be true or false");
    if (typeof src.tap_action === "string") src.tap_action = { action: src.tap_action };
    src.actions = Array.isArray(src.actions) ? src.actions.filter(isObject) : null;
    if (!sources.some((s) => s.entity === src.entity)) sources.push(src);
  }
  if (config.css != null && typeof config.css !== "string") fail("css must be a string");
  return { sources, audience: checkAudience(config.audience) };
};

/* Local dismissals, shared by every card in this browser. Where storage is blocked, the copy
 * in memory keeps them for this page. */
const ACK_STORE = "origami-notifications-ack";
const ACK_MARK = "#";
const CARDS = new Set();
const memory = { acks: null };

/* Acks up to 0.3 held the shown text, with the time except for attribute rows. They carry over
 * while the time, or the title of an attribute row, still matches. */
const isOldAck = (ack, it, once) => {
  if (typeof ack !== "string" || ack.startsWith(ACK_MARK)) return false;
  if (once) return (it.titles || [it.title]).includes(ack.split("\u0000")[0]);
  return ack.endsWith("\u0000" + it.ts) || ack === it.title + "\u0000" + it.message;
};

const loadAcks = () => {
  if (!memory.acks) {
    try {
      const acks = JSON.parse(localStorage.getItem(ACK_STORE) || "{}");
      memory.acks = isObject(acks) ? acks : {};
    } catch (e) {
      memory.acks = {};
    }
  }
  return memory.acks;
};

/* At most 64. Those no card shows go first, then the oldest. */
const saveAcks = (present) => {
  const acks = loadAcks();
  const shown = new Set([...present, ...[...CARDS].flatMap((card) => [...card._present])]);
  const keys = Object.keys(acks);
  const order = [...keys.filter((k) => !shown.has(k)), ...keys.filter((k) => shown.has(k))];
  for (const k of order.slice(0, keys.length - 64)) delete acks[k];
  try {
    localStorage.setItem(ACK_STORE, JSON.stringify(acks));
  } catch (e) {
    /* storage blocked */
  }
};

window.addEventListener("storage", (e) => {
  if (e.key !== ACK_STORE) return;
  memory.acks = null;
  for (const card of CARDS) card._recompute();
});

class OrigamiNotificationsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    /* Without this, Home Assistant detaches a hidden card and ends the subscriptions that bring it back. */
    this.connectedWhileHidden = true;
    this._persistent = new Map();
    this._items = [];
    this._updateIds = [];
    this._labelIds = [];
    this._repairs = [];
    this._watched = [];
    this._allSources = [];
    this._audience = {};
    this._people = [];
    this._viewer = null;
    this._rowCache = new Map();
    this._entitiesRef = null;
    this._expanded = false;
    this._editMode = false;
    this._unsub = null;
    this._unsubRepairs = null;
    this._clock = null;
    this._boundaryTimer = null;
    this._wakes = [];
    this._visible = true;
    this._onVisibility = () => {
      if (!document.hidden) this._refreshTimes();
      this._tick();
    };
    this._lastMsg = null;
    this._bgUrl = null;
    this._hostAnim = null;
    this._enterFrom = null;
    this._shownOpen = false;
    this._pending = new Map();
    this._present = new Set();
    this._thingIds = new Set();
    this._epoch = 0;
    this._painted = false;
    this._seq = 0;
    this._setLang("en");
  }

  setConfig(config) {
    const { sources, audience } = checkConfig(config);
    this._config = { ...DEFAULTS, ...config };
    /* Home Assistant reads layout_options only when grid_options is missing. */
    const rows = config.grid_options
      ? config.grid_options.rows
      : config.layout_options && config.layout_options.grid_rows;
    this.classList.toggle("bounded", typeof rows === "number");
    this._sources = sources;
    this._audience = audience;
    this._people = [...new Set(Object.values(audience).flatMap((rule) => rule[ruleMode(rule)]))];
    this._epoch++;
    this._applyCustomStyles();
    /* Outside the editor preview, Home Assistant changes the config of a live card without a new hass. */
    if (!this._hass) return;
    this._viewer = this._viewerOf(this._hass);
    const subscribed = Boolean(this._unsubRepairs);
    if (this.isConnected) this._subscribe();
    if (subscribed) this._refreshRepairs();
    this._refreshSources();
    this._recompute();
  }

  _applyCustomStyles() {
    if (this._dom) this._dom.userCss.textContent = this._config.css || "";
  }

  static getConfigElement() {
    return document.createElement(EDITOR);
  }

  static getStubConfig() {
    return {};
  }

  _setLang(lang, localize) {
    this._lang = lang;
    const base = String(lang).split("-")[0];
    this._curated = Boolean(STRINGS[base]);
    this._t = STRINGS[base] || borrowedStrings(localize);
    this._localizeRef = localize || null;
    try {
      this._rel = new Intl.RelativeTimeFormat(lang, { numeric: "auto", style: "short" });
    } catch (e) {
      this._rel = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" });
    }
    this._abs = null;
    this._epoch++;
    if (this._dom) this._dom.clear.textContent = this._t.clear;
  }

  /* 12 or 24 hours and the time zone from the user's profile. */
  _clockOpts() {
    const h = this._hass;
    const l = (h && h.locale) || {};
    const o = {};
    if (l.time_format === "12") o.hour12 = true;
    else if (l.time_format === "24") o.hour12 = false;
    else if (l.time_format === "system") {
      const sys = dateFormat(undefined, { hour: "numeric" }).resolvedOptions().hour12;
      if (sys !== undefined) o.hour12 = sys;
    }
    if (l.time_zone === "server" && h.config && h.config.time_zone) o.timeZone = h.config.time_zone;
    return o;
  }

  _relTime(ts, now = Date.now()) {
    const s = Math.round((ts - now) / 1000);
    const m = Math.round(s / 60);
    const h = Math.round(s / 3600);
    if (Math.abs(s) < 60) return (s > 0 ? this._t.soon : this._t.just_now) || this._rel.format(0, "second");
    if (Math.abs(m) < 60) return this._rel.format(m, "minute");
    if (Math.abs(h) < 24) return this._rel.format(h, "hour");
    return this._rel.format(Math.round(s / 86400), "day");
  }

  /* The one text for the time of an entry. A countdown counts the seconds, a day has no time of day. */
  _timeText(it, now = Date.now()) {
    if (!Number.isFinite(it.ts)) return "";
    if (it.clock) return clockText(it.ts - now);
    if (!it.day) return this._relTime(it.past ? Math.min(it.ts, now) : it.ts, now);
    const { near, date } = this._dayOf(it.ts, serverZone(this._hass), now);
    return near ? date : fill(this._t.on_date, { d: date });
  }

  _absTime(ts) {
    if (!this._abs) {
      try {
        this._abs = new Intl.DateTimeFormat(this._lang, { dateStyle: "medium", timeStyle: "short", ...this._clockOpts() });
      } catch (e) {
        this._abs = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
      }
    }
    return this._abs.format(ts);
  }

  _absDate(ts, zone) {
    try {
      return dateFormat(this._lang, { dateStyle: "medium", timeZone: zone }).format(ts);
    } catch (e) {
      return dateFormat(undefined, { dateStyle: "medium" }).format(ts);
    }
  }

  /* Yesterday, today or tomorrow, else the date of ts in zone. Today is the day in the zone of the profile. */
  _dayOf(ts, zone, now) {
    const dayOf = (when, timeZone) => {
      const p = zonedParts(when, timeZone);
      return Date.UTC(p.year, p.month - 1, p.day) / 86400000;
    };
    const diff = dayOf(ts, zone) - dayOf(now, this._clockOpts().timeZone);
    if (Math.abs(diff) <= 1) return { near: true, date: this._rel.format(diff, "day") };
    try {
      return { near: false, date: dateFormat(this._lang, { day: "2-digit", month: "2-digit", timeZone: zone }).format(ts) };
    } catch (e) {
      return { near: false, date: dateFormat(undefined, { day: "2-digit", month: "2-digit" }).format(ts) };
    }
  }

  _calWhen(start, allDay, now = Date.now()) {
    const t = this._t;
    const server = serverZone(this._hass);
    const ts = start ? fromServerTime(start, server) : NaN;
    if (isNaN(ts)) return t.event;
    /* An all-day event is a date on the server. Times show in the zone of the profile. */
    const zone = allDay ? server : this._clockOpts().timeZone;
    const { near, date } = this._dayOf(ts, zone, now);
    if (allDay) return near ? date : fill(t.on_date, { d: date });
    const d = new Date(ts);
    let time;
    try {
      time = d.toLocaleTimeString(this._lang, { hour: "numeric", minute: "2-digit", ...this._clockOpts() });
    } catch (e) {
      time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    }
    return fill(near ? t.day_at : t.date_at, { d: date, t: time });
  }

  /* Changed parts of hass get new references, so comparing references is enough. */

  set hass(hass) {
    const old = this._hass;
    this._hass = hass;
    if (!this._dom) this._build();
    const fetched = this.isConnected && this._subscribe();
    this.classList.toggle("dark", Boolean(hass.themes && hass.themes.darkMode));
    const lang = langOf(hass);
    const langSwitched = lang !== this._lang;
    /* Borrowed strings are read again whenever Home Assistant loads more of them. */
    const langChanged =
      langSwitched || (!this._curated && hass.localize && hass.localize !== this._localizeRef);
    if (langChanged) this._setLang(lang, hass.localize);
    const localeChanged = !old || hass.locale !== old.locale || hass.config !== old.config;
    if (localeChanged) {
      this._abs = null;
      this._epoch++;
    }
    /* Home Assistant swaps in new formatters once translations or settings have loaded. */
    const formatChanged =
      !old || hass.formatEntityState !== old.formatEntityState || hass.formatEntityName !== old.formatEntityName;
    const userChanged = !old || hass.user !== old.user;
    const registryChanged = hass.entities !== this._entitiesRef;
    const viewer = this._viewerOf(hass);
    const viewerChanged = viewer !== this._viewer;
    this._viewer = viewer;
    if (!old || registryChanged || langChanged || viewerChanged || userChanged) {
      this._entitiesRef = hass.entities;
      if (old && (langSwitched || userChanged) && !fetched) this._refreshRepairs();
      this._refreshSources();
      this._recompute();
      return;
    }
    if (localeChanged || formatChanged) {
      this._recompute();
      return;
    }
    for (const id of this._watched) {
      if (old.states[id] !== hass.states[id]) {
        this._recompute();
        return;
      }
    }
  }

  get hass() {
    return this._hass;
  }

  set preview(v) {
    this._setEditMode(v);
  }

  get preview() {
    return this._editMode;
  }

  _setEditMode(v) {
    const on = Boolean(v);
    if (on === this._editMode && this._painted) return;
    this._editMode = on;
    if (on) this.classList.add("no-anim");
    else if (!this._settling) this.classList.remove("no-anim");
    this._recompute();
  }

  connectedCallback() {
    if (this._detachReset) {
      clearTimeout(this._detachReset);
      this._detachReset = null;
    }
    this._visible = true;
    const root = this.getRootNode();
    this.classList.toggle("docked", Boolean(root && root.host && root.host.localName === "hui-view-footer"));
    /* The card picker sets no preview flag. An empty card stays visible there. */
    const picker = Boolean(root && root.host && root.host.localName === "hui-card-picker");
    if (picker !== Boolean(this._inPicker)) {
      this._inPicker = picker;
      this._recompute();
    }
    CARDS.add(this);
    if (this._hass) this._subscribe();
    if (this._hostAnim) this._hostAnim.finish();
    document.addEventListener("visibilitychange", this._onVisibility);
    this._scheduleDay();
    this._scheduleBoundary();
    if (this._dom) {
      this._ro.observe(this._dom.msg);
      if (this._io) this._io.observe(this);
      this._suppressAnim();
      this._refreshTimes();
      this._tick();
    }
  }

  disconnectedCallback() {
    for (const key of ["_unsub", "_unsubRepairs"]) {
      if (this[key]) {
        this[key].then((u) => u()).catch(() => {});
        this[key] = null;
      }
    }
    CARDS.delete(this);
    clearTimeout(this._repairsTimer);
    clearTimeout(this._dayTimer);
    clearTimeout(this._boundaryTimer);
    this._boundaryTimer = null;
    if (this._ro) this._ro.disconnect();
    if (this._io) this._io.disconnect();
    document.removeEventListener("visibilitychange", this._onVisibility);
    this._stopClock();
    /* Collapse only if the card stays detached. The dashboard editor re-parents it all the time. */
    this._detachReset = setTimeout(() => this._collapse(), 150);
  }

  _isAdmin() {
    const u = this._hass && this._hass.user;
    return Boolean(u && u.is_admin);
  }

  /* Returns true when it started listening to repairs, which also fetches them. */
  _subscribe() {
    const conn = this._hass && this._hass.connection;
    if (!conn) return false;
    if (!this._unsub) {
      this._unsub = conn.subscribeMessage((msg) => this._onNotifications(msg), {
        type: "persistent_notification/subscribe",
      });
      this._unsub.catch(() => {
        this._unsub = null;
      });
    }
    /* Like the repairs page in Home Assistant's settings, repairs are for admins only. A new
     * subscription also fetches the list, which may have changed while the card was away. */
    if (!this._unsubRepairs && conn.subscribeEvents && this._config && this._config.repairs && this._isAdmin()) {
      this._unsubRepairs = conn.subscribeEvents(
        () => {
          clearTimeout(this._repairsTimer);
          this._repairsTimer = setTimeout(() => this._refreshRepairs(), 500);
        },
        "repairs_issue_registry_updated"
      );
      this._unsubRepairs.catch(() => {
        this._unsubRepairs = null;
      });
      this._refreshRepairs();
      return true;
    }
    return false;
  }

  _onNotifications(msg) {
    const entries = Object.entries(msg.notifications || {});
    if (msg.type === "removed") {
      for (const [id] of entries) this._persistent.delete(id);
    } else {
      if (msg.type === "current") this._persistent = new Map();
      for (const [id, n] of entries) {
        n.__seq = ++this._seq;
        this._persistent.set(id, n);
      }
    }
    this._recompute();
  }

  _refreshSources() {
    this._refreshUpdateIds();
    this._refreshLabelIds();
    this._refreshWatched();
  }

  /* From the registry as well, so an update whose state arrives later is already watched. */
  _refreshUpdateIds() {
    const h = this._hass;
    if (!this._config || !this._config.updates || !h) {
      this._updateIds = [];
      return;
    }
    const ids = [...Object.keys(h.states), ...Object.keys(h.entities || {})];
    this._updateIds = [...new Set(ids.filter((id) => id.startsWith("update.")))];
  }

  _refreshRepairs() {
    const h = this._hass;
    if (!h || !h.callWS || !this._config || !this._config.repairs || !this._isAdmin()) {
      this._repairs = [];
      return;
    }
    h.callWS({ type: "repairs/list_issues" })
      .then((res) => {
        this._repairs = ((res && res.issues) || []).filter((i) => !i.ignored);
        this._recompute();
        const domains = [...new Set(this._repairs.map((i) => i.domain))];
        if (domains.length && typeof h.loadBackendTranslation === "function") {
          return h.loadBackendTranslation("issues", domains).then((localize) => {
            this._issueLocalize = localize;
            this._recompute();
          });
        }
      })
      .catch(() => {});
  }

  _refreshLabelIds() {
    this._labelIds = labelled(this._hass, this._config && this._config.label);
  }

  _viewerOf(hass) {
    const uid = hass.user && hass.user.id;
    const person =
      uid && this._people.find((id) => hass.states[id] && hass.states[id].attributes.user_id === uid);
    return person || "";
  }

  _refreshWatched() {
    const list = [...(this._sources || [])];
    for (const id of this._labelIds) {
      if (!list.some((s) => s.entity === id)) list.push({ entity: id, type: "auto" });
    }
    this._allSources = list;
    this._watched = [
      ...new Set([...this._updateIds, ...list.map((s) => s.entity)]),
    ];
  }

  _recompute() {
    const h = this._hass;
    const c = this._config || {};
    const now = Date.now();
    const wakes = [];
    let items = [];
    const allowed = (source) => this._editMode || visibleTo(this._audience[source], this._viewer);
    const name = (st, override) => {
      if (typeof override === "string" && override) return override;
      if (h && h.formatEntityName) {
        try {
          const text = (override && h.formatEntityName(st, override)) || h.formatEntityName(st);
          if (text) return text;
        } catch (e) {
          /* use the plain name */
        }
      }
      return st.attributes.friendly_name || st.entity_id;
    };
    const ctx = {
      hass: h,
      host: this,
      t: this._t,
      admin: this._isAdmin(),
      issueLocalize: this._issueLocalize,
      now,
      /* A renderer names a moment when its entries change on their own, like a reminder that opens. */
      wake: waker(wakes, now),
      calWhen: (s, allDay) => this._calWhen(s, allDay, now),
      name,
      format: (st) => (h && h.formatEntityState ? h.formatEntityState(st) : String(st.state)),
      formatAttribute: (st, path, value) => {
        if (h && h.formatEntityAttributeValue && !path.includes(".")) {
          try {
            return h.formatEntityAttributeValue(st, path, value) || String(value);
          } catch (e) {
            /* use the raw value */
          }
        }
        return String(value);
      },
      /* If Home Assistant can't parse a URL, only the picture is lost. */
      url: (path) => {
        if (typeof path !== "string" || !path) return null;
        try {
          return h.hassUrl(path);
        } catch (e) {
          return null;
        }
      },
    };

    if (allowed("system")) {
      for (const [id, n] of this._persistent) {
        const message = n.message || "";
        if (MUTED_NOTIFICATIONS.has(id)) continue;
        const link = firstLink(message);
        items.push({
          key: "s:" + id,
          kind: "system",
          title: plainText(n.title) || this._t.notification,
          message: plainText(message),
          ts: parseTs(n.created_at, now),
          past: true,
          seq: n.__seq || 0,
          open: link ? linkAction(this, link) : null,
          dismiss: () =>
            h.callService("persistent_notification", "dismiss", {
              notification_id: id,
            }),
        });
      }
    }

    if (h && c.repairs && allowed("repairs")) {
      for (const issue of this._repairs) renderRepair(issue, items, ctx);
    }

    const available = new Set();
    if (h) {
      /* The updates rule covers every update entity, listed or found. */
      const allowedEntity = (id) => allowed(id) && (!id.startsWith("update.") || allowed("updates"));
      const listed = new Set(this._allSources.map((src) => src.entity));
      const found = this._updateIds.filter((id) => !listed.has(id)).map((id) => ({ entity: id }));
      for (const src of [...this._allSources, ...found]) {
        if (!allowedEntity(src.entity)) continue;
        const st = h.states[src.entity];
        if (st && st.state !== "unavailable" && st.state !== "unknown") available.add(src.entity);
        renderEntity(src.entity, st, items, ctx, src);
      }
    }

    /* Dismissed, but Home Assistant has not removed them yet. */
    if (this._pending.size) {
      const present = new Set(items.map((it) => it.key));
      for (const [key, until] of this._pending) {
        if (!present.has(key) || until <= now) this._pending.delete(key);
      }
      for (let i = items.length - 1; i >= 0; i--) {
        if (this._pending.has(items[i].key)) items.splice(i, 1);
      }
      clearTimeout(this._pendingTimer);
      const next = Math.min(...this._pending.values());
      if (next !== Infinity) this._pendingTimer = setTimeout(() => this._recompute(), next - now + 50);
    }
    items = dropExpired(items, now, ctx.wake);

    /* Without a dismiss in Home Assistant, items are hidden in this browser until they change.
     * An ack stays while its item is gone, so a reload can't bring it back. The signature
     * comes from the source data, so a new language or formatter doesn't count as a change. */
    const acks = loadAcks();
    const present = new Set(items.map((it) => it.key));
    this._present = present;
    let acksDirty = false;
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      if (it.dismiss || it.sticky) continue;
      const once = it.kind === "attribute" || it.kind === "picture";
      const sig = ACK_MARK + (once ? it.ack : it.ack + "\u0000" + it.ts);
      const oldKey = acks[it.key] === undefined && it.oldKey ? it.oldKey : it.key;
      if (isOldAck(acks[oldKey], it, once)) {
        delete acks[oldKey];
        acks[it.key] = sig;
        acksDirty = true;
      }
      if (acks[it.key] === sig) {
        items.splice(i, 1);
      } else {
        if (acks[it.key] !== undefined) {
          delete acks[it.key];
          acksDirty = true;
        }
        it.ackSig = sig;
        it.dismiss = () => this._dismiss([it]);
        it.localDismiss = true;
      }
    }
    /* An attribute row has no time. Once its attribute has been empty, it counts as new. Only a card
     * that showed the row decides that, since another card may show the entity another way. */
    for (const key of present) if (key.startsWith("r:")) this._thingIds.add(key.slice(2));
    for (const id of this._thingIds) {
      if (available.has(id) && !present.has("r:" + id) && acks["r:" + id] !== undefined) {
        delete acks["r:" + id];
        acksDirty = true;
      }
    }
    if (acksDirty) saveAcks(present);
    this._items = sortItems(items, now);
    const reorder = nextReorder(this._items, now);
    if (reorder !== null) ctx.wake(reorder);
    this._render(now);
    this._scheduleDay();
    this._scheduleBoundary(wakes, now);
  }

  /* Calendar rows and entries for a day say today or tomorrow, so they are built again after midnight. */
  _scheduleDay() {
    clearTimeout(this._dayTimer);
    if (!this.isConnected || !this._items.some((it) => it.kind === "calendar" || it.day)) return;
    const p = zonedParts(Date.now(), this._clockOpts().timeZone);
    const ms = ((23 - p.hour) * 3600 + (59 - p.minute) * 60 + (60 - p.second)) * 1000;
    this._dayTimer = setTimeout(() => this._recompute(), ms + 1000);
  }

  /* One timer for the earliest moment the stack changes on its own. A card that was away catches up
   * when it comes back. */
  _scheduleBoundary(wakes = this._wakes, now = Date.now()) {
    clearTimeout(this._boundaryTimer);
    this._boundaryTimer = null;
    this._wakes = wakes;
    if (!this.isConnected) return;
    const ms = wakeDelay(wakes, now);
    if (ms !== null) this._boundaryTimer = setTimeout(() => this._recompute(), ms);
  }

  _build() {
    this.shadowRoot.innerHTML = TEMPLATE;
    const q = (s) => this.shadowRoot.querySelector(s);
    const userCss = document.createElement("style");
    this.shadowRoot.appendChild(userCss);
    this._dom = {
      card: q("ha-card"),
      head: q(".head"),
      tile: q(".head .tile"),
      icon: q(".head .tile ha-icon"),
      title: q(".head .title"),
      msg: q(".msg"),
      eta: q(".head .eta"),
      track: q(".track"),
      t1: q(".track .t:not(.dup)"),
      t2: q(".track .dup"),
      badge: q(".badge"),
      chev: q(".chev"),
      list: q(".list"),
      foot: q(".foot"),
      clear: q(".clear"),
      ebar: q(".ebar"),
      count: q(".count"),
      bgs: [...this.shadowRoot.querySelectorAll(".backdrop img")],
      userCss,
    };
    for (const img of this._dom.bgs) img.referrerPolicy = "no-referrer";
    this._dom.clear.textContent = this._t.clear;
    this._applyCustomStyles();
    for (const el of [this._dom.head, this._dom.ebar]) {
      el.addEventListener("click", () => this._toggle());
      el.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        this._toggle();
      });
    }
    this._dom.card.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !this._expanded) return;
      e.stopPropagation();
      this._toggle();
      this._dom.head.focus({ preventScroll: true });
    });
    this._dom.clear.addEventListener("click", (e) => {
      this._clearAll();
      if (e.detail === 0) this._focusAfter(0);
    });
    this._ro = new ResizeObserver(() => {
      const t = this._lastMsg;
      this._lastMsg = null;
      if (t !== null) this._setMessage(t);
    });
    this._ro.observe(this._dom.msg);
    if (window.IntersectionObserver) {
      this._io = new IntersectionObserver((entries) => this._onView(entries), { threshold: 0.01 });
      if (this.isConnected) this._io.observe(this);
    }
    this._suppressAnim();
  }

  /* Off screen nothing ticks. Back in view, the times are brought up to date at once. */
  _onView(entries) {
    const entry = entries[entries.length - 1];
    const visible = Boolean(entry && entry.isIntersecting);
    if (visible === this._visible) return;
    this._visible = visible;
    if (visible) this._refreshTimes();
    this._tick();
  }

  /* No transitions on the first paint after attaching, and none in the dashboard editor. */
  _suppressAnim() {
    this.classList.add("no-anim");
    this._settling = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._settling = false;
        if (!this._editMode) this.classList.remove("no-anim");
      });
    });
  }

  /* Focus follows the toggle, which hides itself as it opens or closes. */
  _toggle() {
    if (!this._items.length) return;
    const d = this._dom;
    const active = this.shadowRoot.activeElement;
    const refocus = active === d.head || active === d.ebar;
    this._expanded = !this._expanded;
    d.head.setAttribute("aria-expanded", String(this._expanded));
    if (this._expanded) {
      const cap = getComputedStyle(d.card).getPropertyValue("--origami-max-height").trim();
      this.classList.toggle("capped", cap !== "");
    }
    this._render();
    if (refocus) (this._expanded ? d.ebar : d.head).focus({ preventScroll: true });
  }

  /* One clock per card, and only while a time on show can change. */
  _tick() {
    this._stopClock();
    if (!this._dom || !this.isConnected || !this._visible || document.hidden) return;
    const ms = nextTick(this._items, this._items[0], this._expanded, Date.now());
    if (!ms) return;
    this._clock = setTimeout(() => {
      this._clock = null;
      this._refreshTimes();
      this._tick();
    }, ms);
  }

  _stopClock() {
    clearTimeout(this._clock);
    this._clock = null;
  }

  _refreshTimes(now = Date.now()) {
    if (!this._dom) return;
    const top = this._items[0];
    if (top && top.live) setText(this._dom.eta, this._timeText(top, now));
    if (top) this._setProgress(this._dom.tile, top, now);
    for (const it of this._items) {
      const entry = this._rowCache.get(it.key);
      if (entry) this._setTime(entry.el, it, now);
    }
  }

  /* Rows keep their element while the time changes. The full date is written only for a new time.
   * An entry for a day has a date on the server and no time of day. */
  _setTime(row, it, now) {
    const when = row.querySelector(".when");
    const stamp = (it.day ? "day " : "") + it.ts;
    if (when._stamp !== stamp) {
      when._stamp = stamp;
      if (!Number.isFinite(it.ts)) {
        when.removeAttribute("datetime");
        when.removeAttribute("title");
      } else if (it.day) {
        const zone = serverZone(this._hass);
        const p = zonedParts(it.ts, zone);
        when.dateTime = [p.year, p.month, p.day].map((n) => String(n).padStart(2, "0")).join("-");
        when.title = this._absDate(it.ts, zone);
      } else {
        when.dateTime = new Date(it.ts).toISOString();
        when.title = this._absTime(it.ts);
      }
    }
    setText(when, this._timeText(it, now));
    this._setProgress(row.querySelector(".rtile"), it, now);
  }

  _setProgress(tile, it, now) {
    const p = progressAt(it, now);
    if (p === null) tile.style.removeProperty("--origami-progress");
    else tile.style.setProperty("--origami-progress", p.toFixed(3));
  }

  /* Rows go at once. PENDING_MS covers Home Assistant refusing. */
  _dismiss(items) {
    const acks = loadAcks();
    let acked = false;
    for (const it of items) {
      if (it.localDismiss) {
        acks[it.key] = it.ackSig;
        acked = true;
        continue;
      }
      if (!it.dismiss) continue;
      const key = it.key;
      this._pending.set(key, Infinity);
      new Promise((resolve) => resolve(it.dismiss())).then(
        () => {
          if (this._pending.get(key) !== Infinity) return;
          this._pending.set(key, Date.now() + PENDING_MS);
          this._recompute();
        },
        (e) => {
          console.warn(CARD + ": could not dismiss " + key, e);
          if (this._pending.delete(key)) this._recompute();
        }
      );
    }
    if (acked) {
      saveAcks(this._present);
      for (const card of CARDS) if (card !== this) card._recompute();
    }
    this._recompute();
  }

  _clearAll() {
    if (this._hass) this._dismiss(this._items.filter((it) => it.dismiss));
  }

  _hiding() {
    return this.hidden || Boolean(this._hostAnim && !this._hostAnim.showing);
  }

  /* After a dismissal by keyboard, focus the row that took its place. */
  _focusAfter(index) {
    if (this._hiding()) return;
    const it = this._items[Math.min(Math.max(index, 0), this._items.length - 1)];
    const entry = it && this._rowCache.get(it.key);
    const target =
      (entry && (entry.el.querySelector(".x") || entry.el.querySelector(".rtile[role=button]"))) ||
      (this._expanded ? this._dom.ebar : this._dom.head);
    target.focus({ preventScroll: true });
  }

  /* The hidden attribute plus card-visibility-changed make Home Assistant drop the slot. A slot
   * with a fixed height can't shrink, so then the card only fades and the slot goes at once. */
  _setShown(show) {
    if (show !== this._hiding()) return;
    const running = this._hostAnim;
    const now = getComputedStyle(this);
    const from = { height: now.height, opacity: now.opacity };
    if (running) {
      running.onfinish = null;
      running.cancel();
      this._hostAnim = null;
    }
    this.classList.remove("leaving");
    this._enterFrom = null;
    if (show) {
      if (this.hidden) {
        this.hidden = false;
        fire(this, "card-visibility-changed", { value: true });
        from.height = "0px";
        from.opacity = "0";
      }
      /* Played at the end of _render, once the content can be measured. */
      if (this._animOK()) this._enterFrom = from;
      return;
    }
    const fade = Number(from.opacity) > 0;
    const size = !this.classList.contains("bounded");
    if (!this._animOK() || !(fade || size)) {
      this._gone();
      return;
    }
    const frames = [];
    if (fade) frames.push({ height: from.height, opacity: from.opacity, easing: EASE_FADE_OUT });
    if (size) {
      frames.push({ height: from.height, opacity: 0, easing: easeClose(gapPace(this, parseFloat(from.height))) });
      if (fade) frames[1].offset = FADE_MS / (FADE_MS + SIZE_MS);
    }
    frames.push({ height: size ? "0px" : from.height, opacity: 0 });
    this.classList.add("leaving");
    const duration = (fade ? FADE_MS : 0) + (size ? SIZE_MS : 0);
    const anim = this.animate(frames, { duration, fill: "forwards" });
    anim.showing = false;
    this._hostAnim = anim;
    /* Hide one frame after the card shows closed. The gap Home Assistant then drops is the last step. */
    let closed = false;
    const watch = () => {
      if (this._hostAnim !== anim) return;
      if (!closed) {
        closed = anim.playState === "finished" || anim.currentTime >= duration - 4;
        requestAnimationFrame(watch);
        return;
      }
      this._hostAnim = null;
      this._gone();
      anim.cancel();
    };
    requestAnimationFrame(watch);
  }

  _playEnter() {
    const from = this._enterFrom;
    this._enterFrom = null;
    if (!from || !this._animOK()) return;
    const to = getComputedStyle(this).height;
    const size = !this.classList.contains("bounded") && from.height !== to;
    const frames = size
      ? [
          { height: from.height, opacity: from.opacity, easing: easeOpen(gapPace(this, parseFloat(to) - parseFloat(from.height))) },
          { height: to, opacity: from.opacity, offset: SIZE_MS / (SIZE_MS + FADE_MS), easing: EASE_FADE_IN },
          { height: to, opacity: 1 },
        ]
      : [{ opacity: from.opacity, easing: EASE_FADE_IN }, { opacity: 1 }];
    const anim = this.animate(frames, { duration: (size ? SIZE_MS : 0) + FADE_MS });
    anim.showing = true;
    this._hostAnim = anim;
    anim.onfinish = () => {
      if (this._hostAnim === anim) this._hostAnim = null;
    };
  }

  _collapse() {
    this._expanded = false;
    this._shownOpen = false;
    clearTimeout(this._settleTimer);
    if (!this._dom) return;
    this._dom.card.classList.remove("open", "settled");
    this._dom.head.setAttribute("aria-expanded", "false");
  }

  /* A hidden card comes back closed, with a fresh list. */
  _gone() {
    const d = this._dom;
    this.classList.remove("leaving");
    this.hidden = true;
    fire(this, "card-visibility-changed", { value: false });
    this._collapse();
    this._stopClock();
    this._lastMsg = null;
    clearTimeout(this._listTimer);
    this._listTimer = null;
    if (!d) return;
    for (const el of d.list.children) stopMotion(el);
    stopMotion(d.foot);
    d.list.replaceChildren();
    this._rowCache = new Map();
    this._setBackdrop(null);
  }

  /* Two layers, so one picture fades into the next once it has loaded. */
  _setBackdrop(url) {
    if (url === this._bgUrl) return;
    this._bgUrl = url;
    const layers = this._dom.bgs;
    const shown = layers.find((l) => l.classList.contains("on")) || null;
    if (!url) {
      if (shown) shown.classList.remove("on");
      this.classList.remove("has-bg");
      return;
    }
    const next = shown === layers[0] ? layers[1] : layers[0];
    const reveal = () => {
      if (this._bgUrl !== url) return;
      next.classList.add("on");
      if (shown && shown !== next) shown.classList.remove("on");
      this.classList.add("has-bg");
    };
    next.onload = reveal;
    next.onerror = () => {
      if (this._bgUrl !== url) return;
      if (shown) shown.classList.remove("on");
      this.classList.remove("has-bg");
    };
    if (next.getAttribute("src") === url && next.complete && next.naturalWidth) reveal();
    else next.src = url;
  }

  _render(now = Date.now()) {
    if (!this._dom || !this._config) return;
    const d = this._dom;
    const items = this._items;
    const empty = items.length === 0;

    /* The card keeps showing what it showed while it fades away. */
    if (empty && this._config.hide_when_empty && !this._editMode && !this._inPicker) {
      this._setShown(false);
      this._painted = true;
      this._stopClock();
      return;
    }
    this._setShown(true);

    if (empty) {
      this._expanded = false;
      d.head.setAttribute("aria-expanded", "false");
    }
    const wasOpen = this._shownOpen;
    this._shownOpen = this._expanded;
    d.card.classList.toggle("open", this._expanded);
    /* A list that scrolls while the drawer still moves would flash a scrollbar. */
    if (this._expanded !== wasOpen) {
      clearTimeout(this._settleTimer);
      d.card.classList.remove("settled");
      if (this._expanded && !this._animOK()) d.card.classList.add("settled");
      else if (this._expanded) this._settleTimer = setTimeout(() => d.card.classList.add("settled"), 300);
    }
    d.card.classList.toggle("has-items", !empty);
    d.head.setAttribute("aria-disabled", String(empty));

    if (empty) {
      d.icon.setAttribute("icon", "mdi:bell-outline");
      d.tile.className = "tile idle";
      setText(d.title, this._t.idle_title);
      this._setMessage(this._t.idle_msg);
      d.badge.hidden = true;
      d.chev.hidden = true;
    } else {
      const top = items[0];
      d.icon.setAttribute("icon", top.icon || ICONS[top.kind]);
      d.tile.className = "tile" + sevClass(top.sev);
      setText(d.title, top.title);
      this._setMessage(top.message || "");
      d.badge.hidden = false;
      setText(d.badge, badgeText(items.length));
      d.chev.hidden = false;
    }
    /* A running time takes the place of the message, without the marquee. */
    const live = !empty && Boolean(items[0].live);
    d.msg.hidden = live;
    d.eta.hidden = !live;
    setText(d.eta, live ? this._timeText(items[0], now) : "");
    this._setProgress(d.tile, empty ? {} : items[0], now);
    d.head.classList.toggle("single", !empty && !items[0].message && !live);

    setImage(d.tile, empty ? null : items[0].image);
    this._setBackdrop(!empty && items[0].backdrop ? items[0].image : null);

    /* The list animates only while open. A closing drawer keeps its rows until it is shut. */
    if (!this._expanded && (wasOpen || this._listTimer)) {
      this._listTimer =
        this._listTimer ||
        setTimeout(() => {
          this._listTimer = null;
          if (!this._expanded) this._renderDrawer(false);
        }, 400);
    } else {
      clearTimeout(this._listTimer);
      this._listTimer = null;
      this._renderDrawer(wasOpen && this._expanded, now);
    }
    this._painted = true;
    if (this._enterFrom) this._playEnter();
    this._tick();
  }

  _renderDrawer(animate, now = Date.now()) {
    const d = this._dom;
    const items = this._items;
    animate = animate && this._animOK();
    if (items.length) {
      setText(d.count, fill(items.length === 1 ? this._t.count_one : this._t.count_other, { n: items.length }));
    }
    this._renderList(items, animate, now);
    this._setFoot(items.length > 1 && items.some((it) => it.dismiss), animate);
  }

  _setFoot(show, animate) {
    const foot = this._dom.foot;
    const leaving = foot.classList.contains("leaving");
    if (show === (!foot.hidden && !leaving)) return;
    /* Shown again while leaving, so play the way out backwards. */
    if (show && leaving && animate && foot._motion) {
      const anim = foot._motion;
      foot.classList.remove("leaving");
      anim.onfinish = () => stopMotion(foot);
      anim.reverse();
      return;
    }
    stopMotion(foot);
    foot.hidden = false;
    if (!animate) {
      foot.hidden = !show;
      return;
    }
    const anim = show ? playEnter(foot, 0) : playLeave(foot, 0, 0);
    if (!show) {
      anim.onfinish = () => {
        foot.hidden = true;
        stopMotion(foot);
      };
    }
  }

  /* No animation without a layout, like while a visibility condition hides the card. */
  _animOK() {
    return (
      this._painted &&
      !this._editMode &&
      this.isConnected &&
      this.getClientRects().length > 0 &&
      !this.classList.contains("no-anim") &&
      motionOK()
    );
  }

  /* Rows are keyed and reused while their content stays the same. With animate, rows
   * leave and arrive as in playLeave and playEnter, and moved rows slide. */
  _renderList(items, animate, now) {
    const list = this._dom.list;
    const cache = this._rowCache;
    const active = this.shadowRoot.activeElement;
    let refocus = null;
    const before = new Map();
    if (animate) {
      for (const [key, entry] of cache) before.set(key, entry.el.offsetTop);
    }
    const old = [...list.children];
    const replaced = new Map();
    const next = new Map();
    const els = [];
    for (const it of items) {
      const sig = rowSig(it) + "\u0000" + this._epoch;
      const hit = cache.get(it.key);
      let el;
      if (hit && hit.sig === sig) {
        el = hit.el;
        this._setTime(el, it, now);
        setImage(el.querySelector(".rtile"), it.image);
      } else {
        el = this._row(it, now);
        if (hit) {
          replaced.set(hit.el, el);
          if (hit.el.classList.contains("open")) el.classList.add("open");
          /* Keep keyboard focus on the same control of the rebuilt row. */
          if (active && hit.el.contains(active)) {
            const cls = "." + active.classList[0];
            refocus = [el, cls, [...hit.el.querySelectorAll(cls)].indexOf(active)];
          }
        }
      }
      next.set(it.key, { sig, el });
      els.push(el);
    }
    this._rowCache = next;
    const kept = new Set(els);
    const gone = new Set(old.filter((el) => !kept.has(el) && !replaced.has(el)));
    const focus = () => {
      const target = refocus && refocus[0].querySelectorAll(refocus[1])[refocus[2]];
      if (target) target.focus({ preventScroll: true });
    };
    if (!animate) {
      for (const el of old) stopMotion(el);
      list.replaceChildren(...els);
      focus();
      return;
    }

    /* Rows on their way out stay where they were, after the row above them. */
    const after = new Map();
    let anchor = null;
    for (const el of old) {
      if (gone.has(el)) {
        if (!after.has(anchor)) after.set(anchor, []);
        after.get(anchor).push(el);
      } else {
        anchor = replaced.get(el) || el;
      }
    }
    const order = [...(after.get(null) || [])];
    for (const el of els) order.push(el, ...(after.get(el) || []));
    let cursor = list.firstChild;
    for (const el of order) {
      if (el === cursor) cursor = cursor.nextSibling;
      else list.insertBefore(el, cursor);
    }
    while (cursor) {
      const n = cursor.nextSibling;
      cursor.remove();
      cursor = n;
    }
    focus();

    const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
    const slide = getComputedStyle(this).direction === "rtl" ? -16 : 16;
    for (const el of gone) {
      if (el.classList.contains("leaving")) continue;
      playLeave(el, gap, slide).onfinish = () => {
        stopMotion(el);
        el.remove();
      };
    }
    for (const [key, entry] of next) {
      if (!before.has(key)) playEnter(entry.el, gap);
    }
    for (const [key, entry] of next) {
      const dy = before.has(key) ? before.get(key) - entry.el.offsetTop : 0;
      if (Math.abs(dy) > 1) {
        entry.el.animate([{ transform: "translateY(" + dy + "px)" }, { transform: "none" }], {
          duration: SIZE_MS,
          easing: EASE_STANDARD,
        });
      }
    }
  }

  _row(it, now) {
    const row = document.createElement("div");
    row.className = "row" + sevClass(it.sev);
    row.dataset.kind = it.kind;
    row.setAttribute("role", "listitem");
    const tile = document.createElement("div");
    tile.className = "rtile" + sevClass(it.sev);
    const ic = document.createElement("ha-icon");
    ic.setAttribute("icon", it.icon || ICONS[it.kind]);
    tile.append(ic);
    setImage(tile, it.image);
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = it.title;
    const meta = document.createElement("div");
    meta.className = "meta";
    const when = document.createElement("time");
    when.className = "when";
    meta.append(when);
    if (it.dismiss) {
      const x = document.createElement("button");
      x.className = "x";
      x.type = "button";
      x.setAttribute("aria-label", this._t.dismiss);
      x.setAttribute("title", this._t.dismiss);
      const xi = document.createElement("ha-icon");
      xi.setAttribute("icon", "mdi:close");
      x.append(xi);
      x.addEventListener("click", (e) => {
        e.stopPropagation();
        /* The row may be older than the item, so dismiss the current one. */
        const index = this._items.findIndex((i) => i.key === it.key);
        this._dismiss([index < 0 ? it : this._items[index]]);
        if (e.detail === 0) this._focusAfter(index);
      });
      meta.append(x);
    }
    const body = document.createElement("div");
    body.className = "body";
    body.textContent = it.message;
    row.append(tile, title, meta, body);
    this._setTime(row, it, now);
    if (it.actions && it.actions.length) {
      const actions = document.createElement("div");
      actions.className = "actions";
      for (const a of it.actions) {
        const btn = document.createElement("button");
        btn.className = "act";
        btn.type = "button";
        btn.textContent = a.label;
        if (a.disabled) btn.disabled = true;
        else
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            a.run();
          });
        actions.append(btn);
      }
      row.append(actions);
    }
    const clamped = () =>
      body.scrollHeight > body.clientHeight + 1 || title.scrollWidth > title.clientWidth + 1;
    const selecting = () => {
      const sel = (this.shadowRoot.getSelection && this.shadowRoot.getSelection()) || document.getSelection();
      return Boolean(sel && !sel.isCollapsed && String(sel).trim());
    };
    const go = it.inert ? null : it.open || (it.entity ? () => fireMoreInfo(this, it.entity) : null);
    /* The pointer shows a hand only where a tap does something. */
    row.addEventListener("pointerenter", () => row.classList.toggle("expandable", clamped()));
    /* A tap expands cut-off text, otherwise it opens the target. The icon always opens it. */
    row.addEventListener("click", () => {
      if (selecting()) return;
      if (row.classList.contains("open") || clamped()) {
        row.classList.toggle("open");
      } else if (go) {
        go();
      }
    });
    if (go) {
      row.classList.add("link");
      tile.setAttribute("role", "button");
      tile.tabIndex = 0;
      tile.setAttribute("aria-label", it.title);
      tile.addEventListener("click", (e) => {
        e.stopPropagation();
        go();
      });
      tile.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        e.stopPropagation();
        go();
      });
    }
    return row;
  }

  _setMessage(text) {
    const d = this._dom;
    if (this._expanded) {
      this._lastMsg = null;
      setText(d.t1, text);
      setText(d.t2, text);
      return;
    }
    if (text === this._lastMsg) return;
    this._lastMsg = text;
    setText(d.t1, text);
    setText(d.t2, text);
    d.track.classList.remove("scroll");
    d.msg.classList.remove("fade");
    d.track.style.removeProperty("--scroll-s");
    requestAnimationFrame(() => {
      if (this._lastMsg !== text) return;
      const w = d.t1.scrollWidth;
      if (motionOK() && w > d.msg.clientWidth + 2) {
        d.track.style.setProperty(
          "--scroll-s",
          Math.max(6, Math.round(w / 30)) + "s"
        );
        d.track.classList.add("scroll");
        d.msg.classList.add("fade");
      }
    });
  }

  getCardSize() {
    return this._expanded ? 1 + this._items.length : 1;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }
}

/* Languages the card doesn't ship get these labels from Home Assistant. */
const HA_EDITOR = {
  entities: "ui.panel.lovelace.editor.card.generic.entities",
  name: "ui.panel.lovelace.editor.card.generic.name",
  icon: "ui.panel.lovelace.editor.card.generic.icon",
  attribute: "ui.panel.lovelace.editor.card.generic.attribute",
  tap_action: "ui.panel.lovelace.editor.card.generic.tap_action",
};

const EDITOR_STRINGS = {
  en: {
    entities: "Entities",
    label: "Include entities by label",
    updates: "Pending updates",
    repairs: "Repairs",
    hide_when_empty: "Hide when there is nothing to show",
    options: "Entity options",
    type: "Kind",
    attribute: "Attribute",
    name: "Name",
    icon: "Icon",
    image: "Picture",
    background: "Picture as card background",
    tap_action: "Tap behavior",
    audience: "Who sees what",
    visible: "Visible to",
    people: "People",
    system: "System notifications",
    everyone: "Everyone",
    only: "Only these people",
    except: "Everyone except these people",
    nobody: "Nobody",
    only_x: "Only {x}",
    except_x: "Everyone except {x}",
    type_auto: "Detect automatically",
    type_calendar: "Calendar event",
    type_update: "Update",
    type_alarm: "Alarm panel",
    type_alert: "Alert",
    type_dwd: "DWD weather warnings",
    type_attribute: "Details from an attribute",
    type_picture: "State as title",
    type_generic: "Plain entity",
  },
  de: {
    entities: "Entitäten",
    label: "Entitäten mit diesem Label einbeziehen",
    updates: "Ausstehende Updates",
    repairs: "Reparaturen",
    hide_when_empty: "Ausblenden, wenn nichts anliegt",
    options: "Optionen je Entität",
    type: "Art",
    attribute: "Attribut",
    name: "Name",
    icon: "Symbol",
    image: "Bild",
    background: "Bild als Kartenhintergrund",
    tap_action: "Verhalten beim Tippen",
    audience: "Wer sieht was",
    visible: "Sichtbar für",
    people: "Personen",
    system: "Systembenachrichtigungen",
    everyone: "Alle",
    only: "Nur diese Personen",
    except: "Alle außer diesen Personen",
    nobody: "Niemand",
    only_x: "Nur {x}",
    except_x: "Alle außer {x}",
    type_auto: "Automatisch erkennen",
    type_calendar: "Kalendertermin",
    type_update: "Update",
    type_alarm: "Alarmanlage",
    type_alert: "Alarm (alert)",
    type_dwd: "DWD-Unwetterwarnungen",
    type_attribute: "Details aus einem Attribut",
    type_picture: "Zustand als Titel",
    type_generic: "Einfache Entität",
  },
};

const EDITOR_HELPERS = {
  en: {
    label: "Every entity with this label is added and detected automatically.",
    visible: "Applies outside edit mode, like Home Assistant's own card visibility.",
    people: "Matches the user account linked to each person in Settings → People.",
    attribute: "An attribute that holds an object with a name or title, or a plain value. If empty, the card looks for an object with a description or a picture.",
    attribute_picture: "An attribute that holds an object with a name or title. The object is shown instead of the state.",
    image: "An attribute, a path into one like book.cover, or a URL. If empty, the card uses the picture of the shown object or of the entity.",
    background: "Blurred behind the card while this entity is on top.",
  },
  de: {
    label: "Jede Entität mit diesem Label kommt dazu und wird automatisch erkannt.",
    visible: "Gilt außerhalb des Bearbeitungsmodus, wie die Sichtbarkeit von Home Assistant selbst.",
    people: "Verglichen wird das Benutzerkonto, das unter Einstellungen → Personen verknüpft ist.",
    attribute: "Ein Attribut, das ein Objekt mit name oder title enthält, oder ein einfacher Wert. Bleibt es leer, sucht die Karte ein Objekt mit description oder Bild.",
    attribute_picture: "Ein Attribut, das ein Objekt mit name oder title enthält. Das Objekt erscheint statt des Zustands.",
    image: "Ein Attribut, ein Pfad darin wie book.cover, oder eine URL. Bleibt es leer, nimmt die Karte das Bild des gezeigten Objekts oder der Entität.",
    background: "Unscharf hinter der Karte, solange diese Entität oben steht.",
  },
};

const TYPES = ["auto", ...Object.keys(RENDERERS)];

/* The kinds that read an attribute, so only they show the field. */
const USES_ATTRIBUTE = ["auto", "attribute", "picture", "recipe"];

class OrigamiNotificationsEditor extends HTMLElement {
  setConfig(config) {
    checkConfig(config);
    this._config = { ...config };
    this._renderForm();
  }

  set hass(hass) {
    this._hass = hass;
    this._renderForm();
  }

  _lang() {
    return langOf(this._hass).split("-")[0];
  }

  _label(key) {
    const h = this._hass;
    const own = EDITOR_STRINGS[this._lang()] || {};
    if (own[key]) return own[key];
    const borrowed = HA_EDITOR[key] && h && h.localize ? h.localize(HA_EDITOR[key]) : "";
    return borrowed || EDITOR_STRINGS.en[key] || key;
  }

  _helper(schema) {
    return (EDITOR_HELPERS[this._lang()] || EDITOR_HELPERS.en)[schema.helper || schema.name];
  }

  _name(id) {
    const st = this._hass && this._hass.states[id];
    return (st && st.attributes.friendly_name) || id;
  }

  _title(entry) {
    return typeof entry.name === "string" && entry.name ? entry.name : this._name(entry.entity);
  }

  /* Like the card, the first entry of an entity counts. */
  _entries(c = this._config) {
    const seen = new Set();
    return (c.entities || [])
      .map((e) => (typeof e === "string" ? { entity: e } : e || {}))
      .filter((e) => typeof e.entity === "string" && !seen.has(e.entity) && seen.add(e.entity));
  }

  _sources(c = this._config || {}) {
    const sources = [{ key: "system", name: this._label("system"), icon: ICONS.system }];
    if (c.updates !== false) sources.push({ key: "updates", name: this._label("updates"), icon: ICONS.update });
    if (c.repairs !== false) sources.push({ key: "repairs", name: this._label("repairs"), icon: ICONS.repair });
    for (const src of [...this._entries(c), ...labelled(this._hass, c.label).map((entity) => ({ entity }))]) {
      if (sources.some((s) => s.key === src.entity)) continue;
      sources.push({
        key: src.entity,
        name: this._title(src),
        icon: src.icon || typeIcon(this._typeOf(src)),
      });
    }
    return sources;
  }

  _typeOf(src) {
    return src.type === "recipe" ? "attribute" : kindOf(src, this._hass && this._hass.states[src.entity]);
  }

  _summary(rule) {
    const mode = ruleMode(rule);
    if (mode === "everyone") return this._label("everyone");
    const names = rule[mode].map((id) => this._name(id)).join(", ");
    if (mode === "only") return names ? fill(this._label("only_x"), { x: names }) : this._label("nobody");
    return names ? fill(this._label("except_x"), { x: names }) : this._label("everyone");
  }

  _schema(sources) {
    const audience = this._config.audience || {};
    const options = ["everyone", "only", "except"].map((value) => ({ value, label: this._label(value) }));
    const entries = this._entries();
    return [
      { name: "entities", selector: { entity: { multiple: true } } },
      { name: "label", selector: { label: {} } },
      {
        name: "",
        type: "grid",
        schema: [
          { name: "updates", selector: { boolean: {} } },
          { name: "repairs", selector: { boolean: {} } },
        ],
      },
      { name: "hide_when_empty", selector: { boolean: {} } },
      ...(entries.length
        ? [
            {
              name: "options",
              type: "expandable",
              title: this._label("options"),
              icon: "mdi:tune-variant",
              schema: entries.map((e) => {
                const icon = typeIcon(this._typeOf(e));
                return {
                  name: e.entity,
                  type: "expandable",
                  title: this._title(e),
                  icon: e.icon || icon,
                  schema: [
                    {
                      name: "type",
                      selector: {
                        select: {
                          mode: "dropdown",
                          options: TYPES.map((value) => ({ value, label: this._label("type_" + value) })),
                        },
                      },
                    },
                    ...(USES_ATTRIBUTE.includes(e.type || "auto")
                      ? [
                          {
                            name: "attribute",
                            helper: e.type === "picture" ? "attribute_picture" : undefined,
                            selector: { attribute: { entity_id: e.entity } },
                          },
                        ]
                      : []),
                    {
                      name: "",
                      type: "grid",
                      schema: [
                        { name: "name", selector: { text: {} } },
                        { name: "icon", selector: { icon: { placeholder: icon } } },
                      ],
                    },
                    { name: "image", selector: { text: {} } },
                    { name: "background", selector: { boolean: {} } },
                    { name: "tap_action", selector: { ui_action: { default_action: "more-info" } } },
                  ],
                };
              }),
            },
          ]
        : []),
      {
        name: "audience",
        type: "expandable",
        title: this._label("audience"),
        icon: "mdi:account-eye-outline",
        schema: sources.map((s) => ({
          name: s.key,
          type: "expandable",
          title: s.name + " · " + this._summary(audience[s.key]),
          icon: s.icon,
          schema: [
            { name: "visible", selector: { select: { mode: "list", options } } },
            ...(ruleMode(audience[s.key]) === "everyone"
              ? []
              : [{ name: "people", selector: { entity: { multiple: true, filter: { domain: "person" } } } }]),
          ],
        })),
      },
    ];
  }

  _data(sources) {
    const audience = this._config.audience || {};
    const data = { ...DEFAULTS, ...this._config };
    data.entities = this._entries().map((e) => e.entity);
    data.options = Object.fromEntries(
      this._entries().map((e) => [
        e.entity,
        {
          type: e.type === "recipe" ? "attribute" : e.type || "auto",
          attribute: e.attribute || (e.type === "recipe" ? "recipe" : undefined),
          name: typeof e.name === "string" ? e.name : undefined,
          icon: e.icon,
          image: e.image,
          background: Boolean(e.background),
          tap_action: e.tap_action,
        },
      ])
    );
    data.audience = Object.fromEntries(
      sources.map((s) => {
        const mode = ruleMode(audience[s.key]);
        return [s.key, { visible: mode, people: mode === "everyone" ? [] : audience[s.key][mode] }];
      })
    );
    return data;
  }

  /* Picked entities keep what only YAML can set (actions, name parts). The entity picker swaps
   * an entity in place, and its options move along, as in Home Assistant's own row editors. */
  _mergeEntities(ids, options) {
    const entries = this._entries();
    const prev = new Map(entries.map((e) => [e.entity, e]));
    const changed = ids.map((id, i) => (entries[i] && id !== entries[i].entity ? i : -1)).filter((i) => i >= 0);
    const swap = ids.length === entries.length && changed.length === 1 && !prev.has(ids[changed[0]]) ? changed[0] : -1;
    this._swapped = swap < 0 ? null : [entries[swap].entity, ids[swap]];
    return ids.map((id, i) => {
      const base = prev.get(id) || (i === swap ? { ...entries[i], entity: id } : { entity: id });
      const opt = (options && options[id]) || {};
      const merged = { ...base, entity: id };
      for (const key of OPTION_KEYS) {
        if (!(key in opt)) continue;
        const v = opt[key];
        if (key === "name" && isEmpty(v) && base.name != null && typeof base.name !== "string") continue;
        if (isEmpty(v) || (key === "type" && v === "auto")) delete merged[key];
        else merged[key] = v;
      }
      if (!USES_ATTRIBUTE.includes(merged.type || "auto")) delete merged.attribute;
      /* `type: recipe` is shown as an attribute and written back as it was. */
      if (base.type === "recipe" && merged.type === "attribute" && merged.attribute === (base.attribute || "recipe")) {
        merged.type = "recipe";
        if (!base.attribute) delete merged.attribute;
      }
      const ordered = {};
      for (const key of [...ENTITY_KEY_ORDER, ...Object.keys(merged)]) {
        if (key in merged && !(key in ordered)) ordered[key] = merged[key];
      }
      return Object.keys(ordered).length === 1 ? id : ordered;
    });
  }

  _onChange(e) {
    e.stopPropagation();
    const value = { ...(e.detail.value || {}) };
    const before = this._sources().map((s) => s.key);
    this._swapped = null;
    if (Array.isArray(value.entities)) {
      value.entities = this._mergeEntities(value.entities, value.options);
    }
    delete value.options;
    const audience = { ...(this._config.audience || {}) };
    for (const [key, v] of Object.entries(value.audience || {})) {
      if (v && (v.visible === "only" || v.visible === "except")) {
        audience[key] = { [v.visible]: v.people || [] };
      } else {
        delete audience[key];
      }
    }
    if (this._swapped && audience[this._swapped[0]] && !audience[this._swapped[1]]) {
      audience[this._swapped[1]] = audience[this._swapped[0]];
    }
    /* A rule goes when its source leaves the list, since the editor could no longer show it.
     * Rules for updates stay, because the card applies them to the updates it finds as well. */
    const after = new Set(this._sources({ ...this._config, ...value }).map((s) => s.key));
    const kept = (key) => after.has(key) || key === "updates" || key.startsWith("update.");
    for (const key of before) if (!kept(key)) delete audience[key];
    value.audience = Object.keys(audience).length ? audience : null;
    /* Only what differs from the defaults is written, in a fixed order. */
    const merged = { ...this._config, ...value };
    const config = { type: "custom:" + CARD };
    for (const k of [...KEY_ORDER, ...Object.keys(merged)]) {
      if (k === "type" || k in config || !(k in merged)) continue;
      const v = merged[k];
      if (v === "" || v == null) continue;
      if (Array.isArray(v) && v.length === 0) continue;
      if (k in DEFAULTS && v === DEFAULTS[k]) continue;
      config[k] = v;
    }
    this._config = config;
    this._renderForm();
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ha-form gets a new schema or new data only when they change, so fields keep their focus. */
  _renderForm() {
    if (!this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (e) => this._onChange(e));
      this.appendChild(this._form);
    }
    const lang = this._lang();
    if (lang !== this._formLang || (this._hass && this._hass.localize !== this._formLocalize)) {
      this._formLang = lang;
      this._formLocalize = this._hass && this._hass.localize;
      this._form.computeLabel = (s) => this._label(s.name);
      this._form.computeHelper = (s) => this._helper(s);
      this._schemaKey = null;
    }
    const sources = this._sources();
    this._form.hass = this._hass;
    const schema = this._schema(sources);
    const schemaKey = JSON.stringify(schema);
    if (schemaKey !== this._schemaKey) {
      this._schemaKey = schemaKey;
      this._form.schema = schema;
    }
    const data = this._data(sources);
    const dataKey = JSON.stringify(data);
    if (dataKey !== this._dataKey) {
      this._dataKey = dataKey;
      this._form.data = data;
    }
  }
}

/* The file may be loaded twice, e.g. by HACS and a manual resource. */
if (!customElements.get(CARD)) {
  customElements.define(CARD, OrigamiNotificationsCard);
  console.info("%c Origami Notifications %c v" + VERSION + " ", "font-weight:bold", "opacity:0.7");
}
if (!customElements.get(EDITOR)) customElements.define(EDITOR, OrigamiNotificationsEditor);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === CARD)) {
  window.customCards.push({
    type: CARD,
    name: "Origami Notifications",
    description:
      "System notifications, repairs, updates, warnings and any entity you add.",
    preview: true,
    documentationURL: REPO,
  });
}

/* Tests reach the pure functions through this object, which only they create. */
if (window.__origamiTest) {
  Object.assign(window.__origamiTest, { sortItems, waker, dropExpired, nextReorder, wakeDelay, clockText, progressAt, nextTick });
}
