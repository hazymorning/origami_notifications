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
  timer: "mdi:timer-outline",
  countdown: "mdi:timer-sand",
  event: "mdi:eye-check",
  todo: "mdi:clipboard-check-outline",
  device: "mdi:devices",
  warning: "mdi:alert-circle",
  group: "mdi:google-circles-communities",
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
    paused_left: "Paused, {t} left",
    act_pause: "Pause",
    act_resume: "Resume",
    act_cancel: "Cancel",
    act_lock: "Lock",
    act_close: "Close",
    act_close_valve: "Close",
    act_dock: "Dock",
    act_dock_mower: "Dock",
    act_off: "Turn off",
    act_done: "Done",
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
    paused_left: "Pausiert, noch {t}",
    act_pause: "Pause",
    act_resume: "Fortsetzen",
    act_cancel: "Abbrechen",
    act_lock: "Abschließen",
    act_close: "Schließen",
    act_close_valve: "Schließen",
    act_dock: "Zur Station",
    act_dock_mower: "Zur Station",
    act_off: "Ausschalten",
    act_done: "Erledigt",
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
  act_pause: ["ui.card.timer.actions.pause"],
  act_resume: ["ui.card.timer.actions.start"],
  act_cancel: ["ui.card.timer.actions.cancel"],
  act_lock: ["ui.card.lock.lock"],
  act_close: ["ui.card.cover.close_cover"],
  act_close_valve: ["ui.card.valve.close_valve"],
  act_dock: ["ui.card.vacuum.actions.return_to_base"],
  act_dock_mower: ["ui.card.lawn_mower.actions.dock"],
  act_off: ["ui.card.common.turn_off"],
};

const borrowedStrings = (localize) => {
  const t = { ...STRINGS.en, just_now: null, soon: null, day_at: "{d}, {t}", date_at: "{d}, {t}", on_date: "{d}", paused_left: "{s}, {t}" };
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

/* How many binary sensors of one device class are on, in the languages the card ships. */
const ALIKE_TITLES = {
  en: {
    window: { one: "1 window open", other: "{n} windows open" },
    door: { other: "{n} doors open" },
    garage_door: { other: "{n} garage doors open" },
    opening: { other: "{n} sensors open" },
    battery: { other: "{n} batteries low" },
    moisture: { other: "{n} water alarms" },
    smoke: { other: "{n} smoke alarms" },
    gas: { other: "{n} gas alarms" },
    carbon_monoxide: { other: "{n} CO alarms" },
    heat: { other: "{n} heat alarms" },
    problem: { other: "{n} problems" },
    tamper: { other: "{n} tamper alerts" },
    safety: { other: "{n} safety alerts" },
    sound: { other: "{n} sounds detected" },
  },
  de: {
    window: { one: "1 Fenster offen", other: "{n} Fenster offen" },
    door: { other: "{n} Türen offen" },
    garage_door: { other: "{n} Garagentore offen" },
    opening: { other: "{n} Sensoren offen" },
    battery: { other: "{n} Batterien schwach" },
    moisture: { other: "{n} Wassermelder ausgelöst" },
    smoke: { other: "{n} Rauchmelder ausgelöst" },
    gas: { other: "{n} Gasmelder ausgelöst" },
    carbon_monoxide: { other: "{n} CO-Melder ausgelöst" },
    heat: { other: "{n} Hitzemelder ausgelöst" },
    problem: { other: "{n} Probleme" },
    tamper: { other: "{n} Sabotagealarme" },
    safety: { other: "{n} Sicherheitswarnungen" },
    sound: { other: "{n} Geräusche erkannt" },
  },
};

/* Home Assistant's notice about a failed login is never shown. */
const MUTED_NOTIFICATIONS = new Set(["http-login"]);

const INACTIVE = new Set(["off", "unavailable", "unknown", "idle", "none", ""]);

const isInactive = (state) => {
  const s = String(state).trim().toLowerCase();
  return INACTIVE.has(s) || Number(s) === 0;
};

/* Home Assistant's rule for an active state, from its frontend. A domain whose state is a time is
 * active while it is available, and an alert that was acknowledged is still on. */
const TIME_STATE_DOMAINS = new Set([
  "ai_task",
  "button",
  "conversation",
  "event",
  "image",
  "infrared",
  "input_button",
  "notify",
  "radio_frequency",
  "scene",
  "stt",
  "tag",
  "tts",
  "wake_word",
  "datetime",
]);
const IDLE_STATES = {
  alarm_control_panel: ["disarmed"],
  alert: ["idle"],
  cover: ["closed"],
  device_tracker: ["not_home"],
  lawn_mower: ["docked", "paused", "idle"],
  lock: ["locked"],
  media_player: ["standby"],
  person: ["not_home"],
  vacuum: ["idle", "docked", "paused"],
  valve: ["closed"],
};
const ACTIVE_STATES = {
  camera: ["streaming", "recording"],
  group: ["on", "home", "open", "locked", "problem"],
  plant: ["problem"],
  timer: ["active"],
};

const stateActive = (st) => {
  const domain = st.entity_id.split(".")[0];
  const s = st.state;
  if (TIME_STATE_DOMAINS.has(domain)) return s !== "unavailable";
  if (s === "unavailable" || s === "unknown" || (s === "off" && domain !== "alert")) return false;
  if (ACTIVE_STATES[domain]) return ACTIVE_STATES[domain].includes(s);
  return !(IDLE_STATES[domain] || []).includes(s);
};

/* UpdateEntityFeature.INSTALL */
const UPDATE_INSTALL = 1;

/* TodoListEntityFeature.UPDATE_TODO_ITEM */
const TODO_UPDATE_ITEM = 4;

/* CoverEntityFeature.CLOSE, ValveEntityFeature.CLOSE, VacuumEntityFeature.RETURN_HOME,
 * LawnMowerEntityFeature.DOCK and SirenEntityFeature.TURN_OFF */
const COVER_CLOSE = 2;
const VALVE_CLOSE = 2;
const VACUUM_RETURN_HOME = 16;
const MOWER_DOCK = 4;
const SIREN_TURN_OFF = 2;

/* What is urgent, and the one button with its label, its action, the feature it needs and the states it
 * shows in. Like Home Assistant's own controls, Lock and Close also show whenever a state is only assumed. */
const DEVICES = {
  lock: {
    sev: { jammed: "warn" },
    label: "act_lock",
    action: "lock.lock",
    when: ["unlocked", "open", "jammed"],
    assumed: true,
  },
  cover: {
    label: "act_close",
    action: "cover.close_cover",
    feature: COVER_CLOSE,
    when: ["open", "opening"],
    assumed: true,
    confirm: true,
  },
  valve: {
    label: "act_close_valve",
    action: "valve.close_valve",
    feature: VALVE_CLOSE,
    when: ["open", "opening"],
    assumed: true,
    confirm: true,
  },
  vacuum: {
    sev: { error: "warn" },
    label: "act_dock",
    action: "vacuum.return_to_base",
    feature: VACUUM_RETURN_HOME,
    when: ["cleaning", "error"],
  },
  lawn_mower: {
    sev: { error: "warn" },
    label: "act_dock_mower",
    action: "lawn_mower.dock",
    feature: MOWER_DOCK,
    when: ["mowing", "returning", "error"],
  },
  siren: {
    sev: { on: "crit" },
    label: "act_off",
    action: "siren.turn_off",
    feature: SIREN_TURN_OFF,
    when: ["on"],
  },
};

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

/* Calendars give start_time as the server's wall clock time, without an offset. Other times without
 * one may carry fractions of a second. */
const fromServerTime = (text, timeZone) => {
  const m = /^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d):(\d\d)(?::(\d\d)(?:\.(\d+))?)?)?$/.exec(String(text));
  if (!m) return Date.parse(text);
  const wall = Date.UTC(m[1], m[2] - 1, m[3], m[4] || 0, m[5] || 0, m[6] || 0);
  const offset = (ts) => {
    const p = zonedParts(ts, timeZone);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - ts;
  };
  let ts = wall - offset(wall - offset(wall));
  /* Where the clock skips midnight, as in Santiago, the day begins at the end of the gap. */
  if (zonedParts(ts, timeZone).day !== Number(m[3])) ts = wall - offset(wall);
  return ts + (m[7] ? Number(m[7].slice(0, 3).padEnd(3, "0")) : 0);
};

/* Home Assistant writes times as ISO text. Date.parse would also read a bare number like 5 as a year. */
const isoTime = (value, zone) =>
  typeof value === "string" && /^\d{4}-\d\d-\d\d/.test(value) ? fromServerTime(value, zone) : NaN;

/* Timers write their duration and the time left as H:MM:SS. */
const parseDuration = (text) => {
  const m = /^(\d+):(\d\d):(\d\d)$/.exec(String(text == null ? "" : text).trim());
  return m ? (Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])) * 1000 : NaN;
};

const TIME_UNITS = { d: 86400000, h: 3600000, min: 60000, s: 1000, ms: 1, "μs": 0.001 };

/* A state with a time unit holds the time left, unless its device class says it is a timestamp. */
const durationUnit = (a) => (a.device_class === "timestamp" ? undefined : TIME_UNITS[a.unit_of_measurement]);

/* The moment a state points to. A duration counts down from the state's last change and has ended at 0. */
const endOf = (st, zone) => {
  const unit = durationUnit(st.attributes || {});
  if (!unit) return isoTime(st.state, zone);
  const rest = Number(st.state) * unit;
  return rest > 0 ? parseTs(st.last_changed, NaN) + rest : NaN;
};

const MINUTE_MS = 60000;
const DAY_MS = 86400000;

const toMinute = (ts) => Math.round(ts / MINUTE_MS) * MINUTE_MS;

/* Moments on the same date in timeZone share a number. */
const dayNumber = (ts, timeZone) => {
  const p = zonedParts(ts, timeZone);
  return Date.UTC(p.year, p.month - 1, p.day) / DAY_MS;
};

/* The moment the day with that number begins in timeZone. */
const dayStart = (day, timeZone) => fromServerTime(new Date(day * DAY_MS).toISOString().slice(0, 10), timeZone);

const numberOf = (value) =>
  typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;

const BEFORE_UNITS = { days: DAY_MS, hours: 3600000, minutes: MINUTE_MS, seconds: 1000 };

/* How long ahead a calendar or a to-do list shows, in the formats of Home Assistant's durations. A bare
 * number counts as minutes, where Home Assistant reads seconds. */
const parseBefore = (value) => {
  let ms = NaN;
  if (typeof value === "number") ms = value * MINUTE_MS;
  else if (typeof value === "string") {
    const m = /^\+?(\d+):(\d+)(?::(\d+(?:\.\d+)?))?$/.exec(value.trim());
    if (m) ms = m[1] * 3600000 + m[2] * MINUTE_MS + (m[3] || 0) * 1000;
  } else if (isObject(value)) {
    const keys = Object.keys(value);
    if (keys.length && keys.every((k) => k in BEFORE_UNITS)) {
      ms = keys.reduce((sum, k) => sum + numberOf(value[k]) * BEFORE_UNITS[k], 0);
    }
  }
  return ms >= 0 && Number.isFinite(ms) ? ms : NaN;
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

const usesDevicePicture = (src) =>
  !src.image && (src.type === "event" || (src.type === "auto" && !src.attribute && src.entity.startsWith("event.")));

/* For each id, the image and camera entities on its device, images first. */
const devicePictures = (reg, ids) => {
  const pictures = new Map();
  if (!reg || !ids.length) return pictures;
  const byDevice = new Map();
  for (const [id, entry] of Object.entries(reg)) {
    if (!entry || !entry.device_id || !/^(image|camera)\./.test(id)) continue;
    if (!byDevice.has(entry.device_id)) byDevice.set(entry.device_id, []);
    byDevice.get(entry.device_id).push(id);
  }
  for (const id of ids) {
    const found = byDevice.get(reg[id] && reg[id].device_id) || [];
    pictures.set(id, [...found.filter((p) => p.startsWith("image.")), ...found.filter((p) => p.startsWith("camera."))]);
  }
  return pictures;
};

/* An image keeps its address for a new picture until its token changes, so Home Assistant's own cards
 * add its state. */
const devicePicture = (hass, ids) => {
  for (const id of ids) {
    const s = hass.states[id];
    const a = (s && s.attributes) || {};
    if (id.startsWith("image.") && typeof a.access_token === "string" && a.access_token) {
      return "/api/image_proxy/" + id + "?token=" + encodeURIComponent(a.access_token) + "&state=" + encodeURIComponent(s.state);
    }
    if (typeof a.entity_picture === "string" && a.entity_picture) return a.entity_picture;
  }
  return null;
};

/* Persistent notifications are Markdown. The card shows them as plain text with their first picture,
 * and a tap follows the first link. */
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

/* As in Home Assistant, the address may follow spaces and ends where a title begins. */
const firstPicture = (md) => {
  const m = /!\[[^\]]*\]\(\s*([^)\s]*)[^)]*\)/.exec(String(md || ""));
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

/* While a calendar is off, its attributes describe the next event. With before, it shows that long ahead. */
const renderCalendar = (id, st, items, ctx) => {
  const a = st.attributes;
  if (!a.message) return;
  const push = (fields) =>
    items.push({ key: "c:" + id, kind: "calendar", entity: id, title: a.message, message: ctx.calWhen(a.start_time, a.all_day), ...fields });
  if (st.state === "on") {
    push({ ts: parseTs(st.last_changed, ctx.now), past: true, ack: a.message + "\u0000" + a.start_time });
    return;
  }
  if (st.state !== "off" || !(ctx.lead >= 0)) return;
  const start = isoTime(a.start_time, serverZone(ctx.hass));
  if (!(start > ctx.now)) return;
  if (start - ctx.now > ctx.lead) {
    ctx.wake(start - ctx.lead);
    return;
  }
  /* Once the event runs, its last change may equal its start to the millisecond. The ahead mark keeps a
   * dismissed reminder from hiding the running event. */
  push({ ts: start, day: Boolean(a.all_day), ack: [a.message, a.start_time, "ahead"].join("\u0000") });
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

/* A running timer has a fixed end in finishes_at. Its remaining keeps the value from the start, so
 * the time left is read from remaining only while the timer is paused. */
const renderTimer = (id, st, items, ctx) => {
  const a = st.attributes;
  const t = ctx.t;
  const button = (label, service) => serviceAction(ctx.host, id, label, "timer." + service);
  const item = { key: "tm:" + id, kind: "timer", entity: id, title: ctx.name(st) };
  if (st.state === "active") {
    const end = parseTs(a.finishes_at, NaN);
    items.push({
      ...item,
      oldKey: "g:" + id,
      oldRow: { ack: "active", ts: parseTs(st.last_changed, ctx.now) },
      message: ctx.format(st),
      ts: end,
      live: true,
      clock: true,
      ack: String(a.finishes_at),
      actions: [button(t.act_pause, "pause"), button(t.act_cancel, "cancel")],
    });
  } else if (st.state === "paused") {
    const rest = parseDuration(a.remaining);
    items.push({
      ...item,
      message: fill(t.paused_left, { t: clockText(rest), s: ctx.format(st) }),
      ts: parseTs(st.last_changed, ctx.now),
      past: true,
      ack: "paused\u0000" + a.remaining,
      actions: [button(t.act_resume, "start"), button(t.act_cancel, "cancel")],
    });
  }
};

/* A timestamp sensor holds its end, a duration sensor the time left. Either shows while the end lies ahead.
 * The time left goes stale until the sensor changes again, so a duration names its end instead. */
const renderCountdown = (id, st, items, ctx) => {
  const ts = toMinute(endOf(st, serverZone(ctx.hass)));
  if (!(ts > ctx.now)) return;
  items.push({
    key: "cd:" + id,
    kind: "countdown",
    entity: id,
    title: ctx.name(st),
    message: durationUnit(st.attributes) ? ctx.absTime(ts) : ctx.format(st),
    ts,
    live: true,
    ack: "",
  });
};

/* The state is the time of the last event and survives a restart, so the entry ends a day after the event. */
const renderEvent = (id, st, items, ctx) => {
  const ts = isoTime(st.state, serverZone(ctx.hass));
  if (!Number.isFinite(ts)) return;
  const type = st.attributes.event_type;
  items.push({
    key: "ev:" + id,
    kind: "event",
    entity: id,
    title: ctx.name(st),
    message: type == null || type === "" ? "" : ctx.formatAttribute(st, "event_type", type),
    ts,
    past: true,
    expires: ts + DAY_MS,
    image: findPicture(st.attributes) || devicePicture(ctx.hass, ctx.devicePictures(id)),
    ack: String(st.state),
  });
};

/* With type todo, the items of a list come from a subscription. Without it, a list shows how many are open, as in 0.4.
 * A due date without a time is a day on the server, like an all-day event. What is due by the end of today shows,
 * and with before what is due within that time. */
const renderTodo = (id, st, items, ctx) => {
  const list = ctx.todos(id);
  if (!list) return;
  const server = serverZone(ctx.hass);
  const today = dayNumber(ctx.now, ctx.zone);
  const canFinish = (Number(st.attributes.supported_features) & TODO_UPDATE_ITEM) === TODO_UPDATE_ITEM;
  for (const todo of list) {
    if (!todo || todo.status !== "needs_action" || !todo.uid || typeof todo.due !== "string") continue;
    const day = !todo.due.includes("T");
    const ts = isoTime(todo.due, server);
    if (!Number.isFinite(ts)) continue;
    if (dayNumber(ts, day ? server : ctx.zone) > today && !(ts - ctx.now <= ctx.lead)) {
      ctx.wake(dayStart(today + 1, ctx.zone));
      ctx.wake(ts - ctx.lead);
      continue;
    }
    const done = { item: todo.uid, status: "completed" };
    items.push({
      key: "t:" + id + ":" + todo.uid,
      kind: "todo",
      entity: id,
      title: String(todo.summary || ""),
      message: ctx.name(st),
      ts,
      day,
      ack: todo.uid + "\u0000" + todo.due,
      open: linkAction(ctx.host, "/todo?entity_id=" + id),
      actions: canFinish ? [serviceAction(ctx.host, id, ctx.t.act_done, "todo.update_item", done)] : [],
    });
  }
};

/* A device shows while Home Assistant counts it as active. A lock that asks for a code gets no button, since
 * the card can't ask for one. 0.4 showed a sounding siren as a plain entity, and its dismissal carries over. */
const renderDevice = (id, st, items, ctx) => {
  if (st.state === "unknown" || !stateActive(st)) return;
  const a = st.attributes;
  const d = DEVICES[id.split(".")[0]];
  const offered =
    d &&
    (d.when.includes(st.state) || (d.assumed && a.assumed_state === true)) &&
    (!d.feature || (Number(a.supported_features) & d.feature) === d.feature) &&
    !(id.startsWith("lock.") && a.code_format);
  items.push({
    key: "dv:" + id,
    oldKey: "g:" + id,
    kind: "device",
    sev: d && d.sev && d.sev[st.state],
    entity: id,
    title: ctx.name(st),
    message: ctx.memberText(st) || ctx.format(st),
    ts: parseTs(st.last_changed, ctx.now),
    past: true,
    ack: String(st.state),
    actions: offered ? [serviceAction(ctx.host, id, ctx.t[d.label], d.action, null, d.confirm)] : [],
  });
};

const CAP_SEV = { extreme: "crit", severe: "crit", moderate: "warn" };

const isCap = (a) => Boolean(textOf(a, ["severity"]) && textOf(a, ["headline", "event"]));

const platformOf = (reg, id) => (reg && reg[id] && reg[id].platform) || "";

/* From Home Assistant 2026.11, NINA keeps a warning out of its attributes and answers its get_details action
 * instead. A slot can switch warnings while it stays on, so answers are kept per slot and warning. */
const NINA_DETAILS = new Map();

/* The details of a warning, null without them, or undefined while they are not known yet. That includes the time
 * before Home Assistant lists the action, which may come after the states. */
const ninaDetails = (hass, st, card) => {
  const id = st.entity_id;
  const warning = st.attributes.id || st.last_updated || st.last_changed;
  const known = NINA_DETAILS.get(id) || new Map();
  let entry = known.get(warning);
  if (!entry) {
    const nina = hass.services && hass.services.nina;
    if (!nina || !nina.get_details) return undefined;
    /* A slot keeps the answer before this one, which a card away from the page may still show. */
    for (const [old, e] of [...known].slice(0, -1)) if (e.data !== undefined) known.delete(old);
    entry = { data: undefined, cards: new Set() };
    known.set(warning, entry);
    NINA_DETAILS.set(id, known);
    const answer = (data) => {
      entry.data = isObject(data) ? data : null;
      for (const c of entry.cards) c._recompute();
      entry.cards.clear();
    };
    new Promise((resolve) => resolve(hass.callService("nina", "get_details", {}, { entity_id: id }, false, true))).then(
      (res) => answer(res && res.response && res.response[id]),
      () => answer(null)
    );
  }
  if (entry.data === undefined) entry.cards.add(card);
  return entry.data;
};

/* NINA and Meteoalarm send warnings in the Common Alerting Protocol, and severity sets the urgency. Meteoalarm
 * writes neither start nor sent, and its onset is optional, so effective counts as a start too. */
const renderWarning = (id, st, items, ctx) => {
  if (st.state !== "on") return;
  const a = st.attributes;
  const cap = isCap(a);
  const details = cap || platformOf(ctx.hass.entities, id) !== "nina" ? null : ctx.ninaDetails(st);
  const w = cap ? a : details || {};
  const zone = serverZone(ctx.hass);
  const start = ["start", "onset", "effective"].map((k) => isoTime(w[k], zone)).find(Number.isFinite);
  const sent = isoTime(w.sent, zone);
  const expires = isoTime(w.expires, zone);
  const title = textOf(w, ["headline", "event"]);
  const text = textOf(w, ["description"]);
  const changed = parseTs(st.last_changed, ctx.now);
  const item = {
    key: "wn:" + id,
    oldKey: "g:" + id,
    oldRow: { ack: "on", ts: changed },
    kind: "warning",
    sev: CAP_SEV[String(w.severity).toLowerCase()],
    entity: id,
    title: title || ctx.name(st),
    message: plainText(text),
    ts: start !== undefined ? start : Number.isFinite(sent) ? sent : changed,
    past: start === undefined,
    ack: title ? [title, w.severity, text].join("\u0000") : String(a.id || ""),
  };
  if (details === undefined) item.waiting = true;
  if (Number.isFinite(expires)) item.expires = expires;
  items.push(item);
};

/* Home Assistant's default theme shows these classes in red while they are on. The worst are critical. */
const DEVICE_CLASS_SEV = {
  smoke: "crit",
  gas: "crit",
  carbon_monoxide: "crit",
  moisture: "crit",
  safety: "crit",
  heat: "crit",
  problem: "warn",
  tamper: "warn",
  battery: "warn",
  sound: "warn",
};

const nameList = (names) => (names.length > 4 ? names.slice(0, 4).join(", ") + " +" + (names.length - 4) : names.join(", "));

/* The members a group entity names. A sensor group keeps its state, a value like a mean, so it names none. */
const groupMembers = (st) =>
  Array.isArray(st.attributes.entity_id) && !st.entity_id.startsWith("sensor.")
    ? st.attributes.entity_id.filter((id) => typeof id === "string")
    : [];

const memberText = (hass, ids, name) => {
  const active = ids.map((id) => hass.states[id]).filter((m) => m && stateActive(m));
  return nameList(active.map((m) => name(m)));
};

/* The room of an entity, its own or else its device's. */
const areaOf = (hass, id) => {
  const entry = hass.entities && hass.entities[id];
  const device = entry && entry.device_id && hass.devices && hass.devices[entry.device_id];
  const area = hass.areas && hass.areas[(entry && entry.area_id) || (device && device.area_id)];
  return (area && area.name) || "";
};

const renderGeneric = (id, st, items, ctx) => {
  const active = ctx.forced ? !isInactive(st.state) : isUnambiguouslyActive(st.state);
  if (!active) return;
  const a = st.attributes;
  const binary = id.startsWith("binary_sensor.");
  items.push({
    key: "g:" + id,
    kind: "generic",
    sev: binary && st.state === "on" ? DEVICE_CLASS_SEV[a.device_class] : undefined,
    /* A group entity is a group already, so it never joins one. */
    deviceClass: binary && typeof a.device_class === "string" && !Array.isArray(a.entity_id) ? a.device_class : undefined,
    entity: id,
    title: ctx.name(st),
    message: ctx.memberText(st) || ctx.format(st),
    ts: parseTs(st.last_changed, ctx.now),
    past: true,
    ack: String(st.state),
  });
};

/* A recipe attribute claims the entity even while it is empty, as up to 0.2. */
const detectType = (id, st, reg) => {
  const a = st.attributes;
  if (a.warning_count !== undefined) return "dwd";
  if (id.startsWith("calendar.")) return "calendar";
  if (id.startsWith("update.")) return "update";
  if (id.startsWith("alarm_control_panel.")) return "alarm";
  if (id.startsWith("alert.")) return "alert";
  if (id.startsWith("timer.")) return "timer";
  if (findThing(a) || "recipe" in a) return "attribute";
  /* Home Assistant merges what an integration sends into an event's attributes, and any integration can add
   * attributes to a device. An event or a device with a thing there keeps the row it had in 0.4. */
  if (id.startsWith("event.")) return "event";
  if (DEVICES[id.split(".")[0]]) return "device";
  if (id.startsWith("binary_sensor.") && (isCap(a) || platformOf(reg, id) === "nina")) return "warning";
  /* A duration may count up as well, so it stays a plain number unless its kind is set, as in 0.4. */
  if (id.startsWith("sensor.") && a.device_class === "timestamp") return "countdown";
  return "generic";
};

/* The kind an entity shows as. checkConfig has already turned `type: recipe` into an attribute. */
const kindOf = (src, st, hass) => {
  if (src.type && src.type !== "auto") return src.type;
  if (src.attribute) return "attribute";
  return st ? detectType(st.entity_id, st, hass && hass.entities) : "generic";
};

/* In the order the editor offers them. */
const RENDERERS = {
  calendar: renderCalendar,
  update: renderUpdate,
  alarm: renderAlarm,
  alert: renderAlert,
  dwd: renderDwd,
  timer: renderTimer,
  countdown: renderCountdown,
  event: renderEvent,
  todo: renderTodo,
  device: renderDevice,
  warning: renderWarning,
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

/* A button the card offers on its own, run like an action from the config. With confirmation, Home Assistant
 * asks first in its own words. */
const serviceAction = (host, entity, label, action, data, confirmation) => ({
  label,
  run: () =>
    fireAction(host, {
      entity,
      tap_action: {
        action: "perform-action",
        perform_action: action,
        target: { entity_id: entity },
        ...(data ? { data } : {}),
        ...(confirmation ? { confirmation } : {}),
      },
    }),
});

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
  const kind = kindOf(src, st, ctx.hass);
  const renderer = RENDERERS[kind];
  if (!renderer) return;
  const named = Boolean(src.name);
  const name = named ? (s) => ctx.name(s, src.name) : ctx.name;
  const before = items.length;
  try {
    renderer(id, st, items, { ...ctx, forced, kind, attribute, objectOnly, named, name, lead: parseBefore(src.before) });
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
    /* A to-do is a task on a list, so it keeps the icon of its kind. */
    if (items[i].kind !== "todo") items[i].stateObj = st;
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

/* A count like 3 windows open. Without words of its own, a class takes Home Assistant's name for it. */
const alikeTitle = (lang, dc, n, localize) => {
  const forms = (ALIKE_TITLES[String(lang).split("-")[0]] || {})[dc];
  if (forms) return fill(n === 1 && forms.one ? forms.one : forms.other, { n });
  const name = (typeof localize === "function" && localize("component.binary_sensor.entity_component." + dc + ".name")) || prettySlug(dc);
  return fill("{name} ({n})", { name, n });
};

/* A group can't show the buttons, the picture or the tap of one entry, so such an entry stays alone. */
const groupable = (it) => it.kind === "generic" && Boolean(it.deviceClass) && !it.image && !it.open && !(it.actions && it.actions.length);

/* Two or more plain binary sensors of one device class become one entry. */
const groupAlike = (items, ctx) => {
  const alike = new Map();
  for (const it of items) {
    if (!groupable(it)) continue;
    if (!alike.has(it.deviceClass)) alike.set(it.deviceClass, []);
    alike.get(it.deviceClass).push(it);
  }
  const out = [];
  for (const it of items) {
    const members = groupable(it) ? alike.get(it.deviceClass) : null;
    if (!members || members.length < 2) out.push(it);
    else if (members[0] === it) out.push(alikeGroup(it.deviceClass, members, ctx));
  }
  return out;
};

/* The newest member comes first. A member without a room is named instead, and a room shared by several shows once. */
const alikeGroup = (dc, members, ctx) => {
  const sorted = sortItems([...members], ctx.now);
  const rooms = new Set();
  const names = [];
  for (const m of sorted) {
    const room = areaOf(ctx.hass, m.entity);
    if (!room) {
      names.push(m.title);
    } else if (!rooms.has(room)) {
      rooms.add(room);
      names.push(room);
    }
  }
  return {
    key: "gr:" + dc,
    kind: "group",
    sev: sorted[0].sev,
    title: ctx.alikeTitle(dc, sorted.length),
    message: nameList(names),
    ts: sorted.reduce((ts, m) => Math.max(ts, m.ts), -Infinity),
    past: true,
    icon: sorted[0].icon,
    stateObj: sorted[0].stateObj,
    members: sorted,
    dismiss: () => ctx.host._dismiss(sorted),
  };
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

/* Milliseconds until the times on show change, or 0. A countdown in view changes by the second, in
 * step with its end. Other times change by the minute, while the list is open or an entry lies
 * ahead. */
const nextTick = (items, head, open, now) => {
  const clock = (open ? items : head ? [head] : []).find((it) => it.clock && it.ts > now);
  if (clock) return (clock.ts - now) % 1000 || 1000;
  if (open || items.some((it) => isAhead(it, now))) return 60000 - (now % 60000);
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

/* Like Home Assistant's own icons, the option goes first, then the icon the user picked for the entity, then the
 * one the entity names. */
const fallbackIcon = (it, hass) => {
  const st = it.stateObj;
  const reg = st && hass && hass.entities && hass.entities[st.entity_id];
  return it.icon || (reg && reg.icon) || (st && st.attributes && st.attributes.icon) || ICONS[it.kind] || ICONS.generic;
};

/* Home Assistant's state icon follows the state, like an open or a closed lock. Until Home Assistant has defined
 * it, an entry shows the icon its entity names, or its kind's. */
const setIcon = (tile, it, hass) => {
  const state = it.stateObj && customElements.get("ha-state-icon") ? it.stateObj : null;
  const tag = state ? "ha-state-icon" : "ha-icon";
  let el = tile.querySelector("ha-icon, ha-state-icon");
  if (!el || el.localName !== tag) {
    const fresh = document.createElement(tag);
    if (el) el.replaceWith(fresh);
    else tile.insertBefore(fresh, tile.querySelector(".badge"));
    el = fresh;
  }
  if (state) {
    el.hass = hass;
    el.stateObj = state;
    el.icon = it.icon || undefined;
  } else {
    el.setAttribute("icon", fallbackIcon(it, hass));
  }
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
  .tile :is(ha-icon, ha-state-icon) { --mdc-icon-size: var(--origami-icon); }

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
  .rtile :is(ha-icon, ha-state-icon) { --mdc-icon-size: var(--icon-size-xs, 18px); display: flex; }
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
  img.ready ~ :is(ha-icon, ha-state-icon) { visibility: hidden; }
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
  .msg, .eta {
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
  .eta { min-width: 0; font-variant-numeric: tabular-nums; text-overflow: ellipsis; }
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
            before: entry ? entry.before : null,
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

/* Whether ack hid the plain row this entry had up to 0.4, saved as in 0.4 or in 0.3. */
const heldAs = (ack, row) => ack === ACK_MARK + row.ack + "\u0000" + row.ts || isOldAck(ack, row, false);

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
    this._readIds = [];
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
    this._todos = new Map();
    this._pictures = new Map();
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
    /* Home Assistant may define its state icon after the card. Then every icon is drawn again. */
    if (!customElements.get("ha-state-icon")) {
      customElements.whenDefined("ha-state-icon").then(() => {
        this._epoch++;
        this._render();
      });
    }
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

  /* The one text for the time of an entry. A countdown counts the seconds. A day has no time of day. */
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
    const diff = dayNumber(ts, zone) - dayNumber(now, this._clockOpts().timeZone);
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
    /* Home Assistant may load its actions, translations and rooms after the states. Warnings and groups need them. */
    const loaded =
      hass.services !== old.services || hass.localize !== old.localize || hass.areas !== old.areas || hass.devices !== old.devices;
    if (localeChanged || formatChanged || loaded) {
      this._recompute();
      return;
    }
    const changed = (id) => old.states[id] !== hass.states[id];
    if (this._watched.some(changed) || this._readIds.some(changed)) this._recompute();
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
    /* The items stay, so a card that comes back shows them until Home Assistant sends the list again. */
    for (const [id, sub] of this._todos) {
      if (sub.unsub) sub.unsub.then((u) => u()).catch(() => {});
      this._todos.set(id, { items: sub.items });
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
    this._subscribeTodos();
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

  /* One subscription per to-do list. Home Assistant sends the whole list at once and again after every
   * change. A list it refused is asked for again once its state changes. */
  _subscribeTodos() {
    const h = this._hass;
    const conn = h && h.connection;
    if (!conn || !this.isConnected) return;
    const wanted = new Set(
      this._allSources
        .filter((src) => src.entity.startsWith("todo.") && h.states[src.entity] && kindOf(src, h.states[src.entity]) === "todo")
        .map((src) => src.entity)
    );
    for (const [id, sub] of this._todos) {
      if (wanted.has(id)) continue;
      if (sub.unsub) sub.unsub.then((u) => u()).catch(() => {});
      this._todos.delete(id);
    }
    for (const id of wanted) {
      const old = this._todos.get(id);
      if (old && old.unsub && (old.failed === undefined || old.failed === h.states[id])) continue;
      const sub = { items: old ? old.items : null };
      this._todos.set(id, sub);
      sub.unsub = conn.subscribeMessage(
        (msg) => {
          if (this._todos.get(id) !== sub) return;
          sub.items = Array.isArray(msg && msg.items) ? msg.items : [];
          this._recompute();
        },
        { type: "todo/item/subscribe", entity_id: id }
      );
      sub.unsub.catch(() => {
        sub.failed = (this._hass && this._hass.states[id]) || null;
      });
    }
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
    this._subscribeTodos();
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
    /* A picture from a device changes on its own, with every new snapshot or token. */
    this._pictures = devicePictures(this._hass && this._hass.entities, list.filter(usesDevicePicture).map((s) => s.entity));
    const refs = list.flatMap((s) => [s.entity, ...(this._pictures.get(s.entity) || [])]);
    this._watched = [...new Set([...this._updateIds, ...refs])];
  }

  _recompute() {
    const h = this._hass;
    const c = this._config || {};
    const now = Date.now();
    const wakes = [];
    const read = [];
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
      absTime: (ts) => this._absTime(ts),
      zone: this._clockOpts().timeZone,
      todos: (id) => (this._todos.get(id) || {}).items || null,
      devicePictures: (id) => this._pictures.get(id) || [],
      ninaDetails: (st) => ninaDetails(h, st, this),
      /* The members of a group entity change without the group, so they are watched as well. */
      memberText: (st) => {
        const ids = groupMembers(st);
        read.push(...ids);
        return memberText(h, ids, name);
      },
      alikeTitle: (dc, n) => alikeTitle(this._lang, dc, n, h && h.localize),
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
          image: ctx.url(firstPicture(message)),
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
    this._readIds = read;

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
      const oldKey = acks[it.key] === undefined && it.oldKey ? it.oldKey : it.key;
      const heldBefore = oldKey !== it.key && it.oldRow !== undefined && heldAs(acks[oldKey], it.oldRow);
      /* A NINA warning without its details has no signature yet. A dismissal stays as it is and hides it meanwhile. */
      if (it.waiting) {
        if (acks[it.key] !== undefined || heldBefore) items.splice(i, 1);
        continue;
      }
      const once = it.kind === "attribute" || it.kind === "picture";
      const sig = ACK_MARK + (once ? it.ack : it.ack + "\u0000" + it.ts);
      /* A dismissal from an older version moves to the new key, so it can't hide the entry again once it changes. */
      if (heldBefore || isOldAck(acks[oldKey], it, once)) {
        delete acks[oldKey];
        acks[it.key] = sig;
        acksDirty = true;
      }
      /* The same signature under the old key carries over. It stays there for a card that still shows the row that way. */
      if (oldKey !== it.key && acks[oldKey] === sig) {
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
    items = groupAlike(items, ctx);
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

  /* One timer for the earliest moment the list changes on its own. A card that was away catches up
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
  }

  /* Rows go at once. PENDING_MS covers Home Assistant refusing. */
  _dismiss(items) {
    const acks = loadAcks();
    let acked = false;
    /* A group stands for its members, and each of them keeps a dismissal of its own. */
    for (const it of items.flatMap((i) => i.members || [i])) {
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
      setIcon(d.tile, { icon: "mdi:bell-outline" }, this._hass);
      d.tile.className = "tile idle";
      setText(d.title, this._t.idle_title);
      this._setMessage(this._t.idle_msg);
      d.badge.hidden = true;
      d.chev.hidden = true;
    } else {
      const top = items[0];
      setIcon(d.tile, top, this._hass);
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
        setIcon(el.querySelector(".rtile"), it, this._hass);
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
    /* A button can end its own row, like Cancel on a timer. Focus then goes where it goes after a dismissal. */
    const keys = [...cache.keys()];
    const lost = active ? keys.findIndex((key) => !next.has(key) && cache.get(key).el.contains(active)) : -1;
    const focus = () => {
      const target = refocus && refocus[0].querySelectorAll(refocus[1])[refocus[2]];
      if (target) target.focus({ preventScroll: true });
      else if (lost >= 0) this._focusAfter(lost);
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
    setIcon(tile, it, this._hass);
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
    type_timer: "Timer",
    type_countdown: "Countdown",
    type_event: "Event",
    type_todo: "To-do list",
    type_device: "Device",
    type_warning: "Warning",
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
    type_timer: "Timer",
    type_countdown: "Countdown",
    type_event: "Ereignis",
    type_todo: "To-do-Liste",
    type_device: "Gerät",
    type_warning: "Warnung",
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
    return src.type === "recipe" ? "attribute" : kindOf(src, this._hass && this._hass.states[src.entity], this._hass);
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
  Object.assign(window.__origamiTest, {
    sortItems,
    waker,
    dropExpired,
    nextReorder,
    wakeDelay,
    clockText,
    nextTick,
    parseDuration,
    endOf,
    parseBefore,
    stateActive,
    alikeTitle,
    firstPicture,
  });
}
