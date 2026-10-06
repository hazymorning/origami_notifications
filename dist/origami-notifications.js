/* Origami Notifications, https://github.com/hazymorning/origami_notifications */

const CARD = "origami-notifications";
const EDITOR = CARD + "-editor";
const REPO = "https://github.com/hazymorning/origami_notifications";
const VERSION = "0.5.0";

const DEFAULTS = {
  hide_when_empty: true,
  updates: true,
  repairs: true,
  rotate: 8,
  slide: "up",
};

const KEY_ORDER = ["entities", "label", "weather", "infos", "updates", "repairs", "hide_when_empty", "rotate", "slide", "audience", "css"];
const INFO_KEY_ORDER = ["entity", "name", "icon", "color", "show_entity_picture", "state_content", "time_format", "forecast_type", "forecast_slots", "tap_action", "hold_action", "double_tap_action", "visibility"];
const OPTION_KEYS = ["type", "attribute", "name", "icon", "image", "background", "before", "tap_action"];
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
  weather: "mdi:weather-partly-rainy",
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
    wx_rain_from: "Rain from {t}",
    wx_snow_from: "Snow from {t}",
    wx_thunder_from: "Thunderstorms from {t}",
    wx_hail_from: "Hail from {t}",
    wx_rain_now: "It is raining",
    wx_snow_now: "It is snowing",
    wx_thunder_now: "Thunderstorm",
    wx_hail_now: "Hail",
    wx_chance: "{p} chance",
    wx_frost_from: "Frost from {t}",
    wx_low: "Low of {v}",
    wx_day: "Day",
    wx_night: "Night",
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
    wx_rain_from: "Regen ab {t}",
    wx_snow_from: "Schnee ab {t}",
    wx_thunder_from: "Gewitter ab {t}",
    wx_hail_from: "Hagel ab {t}",
    wx_rain_now: "Es regnet",
    wx_snow_now: "Es schneit",
    wx_thunder_now: "Gewitter",
    wx_hail_now: "Hagel",
    wx_chance: "{p} Wahrscheinlichkeit",
    wx_frost_from: "Frost ab {t}",
    wx_low: "Tiefstwert {v}",
    wx_day: "Tag",
    wx_night: "Nacht",
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
  wx_day: ["ui.card.weather.day"],
  wx_night: ["ui.card.weather.night"],
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
    /* Home Assistant names the weather in every language, so rain ahead reads like "Pluie, 19 h". */
    for (const [kind, condition] of [["rain", "rainy"], ["snow", "snowy"], ["thunder", "lightning"], ["hail", "hail"]]) {
      const name = localize("component.weather.entity_component._.state." + condition);
      if (!name) continue;
      t["wx_" + kind + "_now"] = name;
      t["wx_" + kind + "_from"] = name + ", {t}";
    }
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

/* The domains Home Assistant colors by their state, and how its tile card builds that color from theme variables. */
const STATE_COLORED = new Set([
  "alarm_control_panel",
  "alert",
  "automation",
  "binary_sensor",
  "calendar",
  "camera",
  "climate",
  "cover",
  "device_tracker",
  "fan",
  "group",
  "humidifier",
  "input_boolean",
  "lawn_mower",
  "light",
  "lock",
  "media_player",
  "person",
  "plant",
  "remote",
  "schedule",
  "script",
  "siren",
  "sun",
  "switch",
  "timer",
  "update",
  "vacuum",
  "valve",
  "water_heater",
  "weather",
]);

const cssChain = (names) => names.reduceRight((rest, name) => "var(" + name + (rest ? ", " + rest : "") + ")", "");

const stateKey = (state) => String(state).toLowerCase().replace(/[^a-z0-9]+/g, "_");

const stateColorChain = (domain, deviceClass, state, active) => {
  const level = active ? "active" : "inactive";
  return cssChain([
    ...(deviceClass ? ["--state-" + domain + "-" + deviceClass + "-" + stateKey(state) + "-color"] : []),
    "--state-" + domain + "-" + stateKey(state) + "-color",
    "--state-" + domain + "-" + level + "-color",
    "--state-" + level + "-color",
  ]);
};

/* A person or tracker has its color on a badge, so its icon stays plain, as on a tile. */
const stateColor = (st) => {
  if (st.state === "unavailable") return "var(--state-unavailable-color)";
  const domain = st.entity_id.split(".")[0];
  const a = st.attributes || {};
  if (domain === "sensor" && a.device_class === "battery" && st.state !== "" && !isNaN(Number(st.state))) {
    const n = Number(st.state);
    return "var(--state-sensor-battery-" + (n >= 70 ? "high" : n >= 30 ? "medium" : "low") + "-color)";
  }
  const members = domain === "group" && Array.isArray(a.entity_id) ? [...new Set(a.entity_id.map((id) => String(id).split(".")[0]))] : [];
  const colored = domain === "group" ? (members.length === 1 ? members[0] : null) : domain;
  const active = stateActive(st);
  if (!STATE_COLORED.has(colored) || domain === "person" || domain === "device_tracker") {
    return active ? "var(--state-icon-color)" : "var(--state-inactive-color)";
  }
  return stateColorChain(colored, a.device_class, st.state, active);
};

/* Theme color names, as the color option of a tile takes them. */
const THEME_COLORS = new Set([
  "primary",
  "accent",
  "red",
  "pink",
  "purple",
  "deep-purple",
  "indigo",
  "blue",
  "light-blue",
  "cyan",
  "teal",
  "green",
  "light-green",
  "lime",
  "yellow",
  "amber",
  "orange",
  "deep-orange",
  "brown",
  "light-grey",
  "grey",
  "dark-grey",
  "blue-grey",
  "black",
  "white",
  "primary-text",
  "secondary-text",
  "disabled",
]);

const themeColor = (color) => (THEME_COLORS.has(color) ? "var(--" + color + "-color)" : color);

/* Urgency colors an entry first, then its own color, then its entity's state, like a tile. */
const KIND_COLORS = { system: "var(--info-color)", repair: "var(--warning-color)" };

const itemColor = (it) => {
  if (it.sev === "crit") return "var(--error-color)";
  if (it.sev === "warn") return "var(--warning-color)";
  if (it.color) return it.color;
  if (it.stateObj) return stateColor(it.stateObj);
  return KIND_COLORS[it.kind] || "var(--state-icon-color)";
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

/* A hold and a double tap take as long as on Home Assistant's own cards. */
const HOLD_MS = 500;
const DOUBLE_TAP_MS = 250;

/* Home Assistant's tokens set the pace, and drop to 1 ms where motion is reduced. */
const tokenMs = (el, name, fallback) => {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  const n = parseFloat(v);
  return Number.isFinite(n) ? (/ms$/.test(v) ? n : n * 1000) : fallback;
};

const hasAction = (a) => Boolean(a && a.action && a.action !== "none");

/* Below this width the list opens in Home Assistant's dialog instead of unfolding in the card. */
const NARROW_PX = 300;

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

/* The conditions Home Assistant's frontend checks itself. It sends every other kind to the server. */
const CLIENT_CONDITIONS = new Set(["state", "numeric_state", "screen", "user", "location", "time", "view_columns", "and", "or", "not"]);
const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const listOf = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

const isEntityId = (v) => typeof v === "string" && /^\w+\.\w+$/.test(v);

const userPerson = (hass) => {
  const uid = hass.user && hass.user.id;
  if (!uid) return null;
  for (const id in hass.states) {
    if (id.startsWith("person.") && hass.states[id].attributes.user_id === uid) return hass.states[id];
  }
  return null;
};

/* Read as leniently as Home Assistant reads it, so 8:00 AM counts as 8:00. */
const daySeconds = (t) => {
  const [h, m, s] = String(t).split(":").map((part) => parseInt(part, 10));
  return h * 3600 + m * 60 + (s || 0);
};

/* Home Assistant skips a condition that is switched off. */
const switchedOn = (c) => !(isObject(c) && c.enabled === false);

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

/* Titles and integration names come from the translations _refreshRepairs loads. */
const REPAIR_SEV = { critical: "crit", error: "crit", warning: "warn" };

const renderRepair = (issue, items, ctx) => {
  const h = ctx.hass;
  const slug = issue.translation_key || issue.issue_id;
  const key = "component." + issue.domain + ".issues." + slug + ".title";
  const vars = issue.translation_placeholders || {};
  const localize = (k, v) => (ctx.issueLocalize && ctx.issueLocalize(k, v)) || (h.localize && h.localize(k, v)) || "";
  const title = localize(key, vars) || prettySlug(slug);
  items.push({
    key: "i:" + issue.domain + "/" + issue.issue_id,
    kind: "repair",
    sev: REPAIR_SEV[issue.severity] || "warn",
    title,
    message: issue.breaks_in_ha_version
      ? fill(ctx.t.breaks_in, { v: issue.breaks_in_ha_version })
      : localize("component." + (issue.issue_domain || issue.domain) + ".title"),
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

/* Forecasts by "<entity>|<type>", shared by every card and kept over a remount. */
const FORECAST_CACHE = new Map();

/* Home Assistant's feature bits for forecasts. For rain ahead the card asks for hourly, then twice daily, then daily. */
const FORECAST_BITS = { daily: 1, hourly: 2, twice_daily: 4 };
const FORECAST_TYPES = Object.keys(FORECAST_BITS);

const forecastSupported = (st, type) =>
  FORECAST_TYPES.includes(type) && Boolean((Number(st && st.attributes && st.attributes.supported_features) || 0) & FORECAST_BITS[type]);

const forecastType = (st) => ["hourly", "twice_daily", "daily"].find((type) => forecastSupported(st, type)) || null;

/* Like Home Assistant's forecast card, a clear or partly cloudy night has a night icon. */
const NIGHT_ICONS = { sunny: "mdi:weather-night", partlycloudy: "mdi:weather-night-partly-cloudy" };

const FORECAST_SPAN = { hourly: 3600000, twice_daily: 43200000, daily: 86400000 };

/* Where the profile picks a number format, Home Assistant formats numbers like these locales. */
const NUMBER_LOCALES = { comma_decimal: "en-US", decimal_comma: "de", space_comma: "fr" };

/* The entries that have not ended yet. Home Assistant sends null when it has no forecast. */
const forecastFilterPast = (forecast, type, now) =>
  (Array.isArray(forecast) ? forecast : []).filter((f) => f && Date.parse(f.datetime) + FORECAST_SPAN[type] > now);

/* What the card reads from a forecast. A new one with the same print changes nothing. */
const forecastFingerprint = (forecast) =>
  Array.isArray(forecast)
    ? forecast
        .map((f) =>
          f ? [f.datetime, f.condition, f.temperature, f.templow, f.is_daytime, f.precipitation, f.precipitation_probability].join("|") : ""
        )
        .join(";")
    : "";

const WET = new Set(["rainy", "pouring", "lightning", "lightning-rainy", "snowy", "snowy-rainy", "hail"]);

const isWet = (f, unit) =>
  WET.has(f.condition) || Number(f.precipitation) >= (unit === "in" ? 0.01 : 0.2) || Number(f.precipitation_probability) >= 60;

const wetKind = (condition, temperature, cold) => {
  const c = String(condition || "");
  if (c.startsWith("lightning")) return "thunder";
  if (c === "hail") return "hail";
  return c.startsWith("snowy") || (temperature != null && temperature !== "" && Number(temperature) <= cold) ? "snow" : "rain";
};

const WEATHER_ICONS = {
  rain: "mdi:weather-rainy",
  snow: "mdi:weather-snowy",
  thunder: "mdi:weather-lightning",
  hail: "mdi:weather-hail",
  frost: "mdi:snowflake-thermometer",
};

/* The weather condition whose state color each entry takes. */
const WEATHER_STATES = { rain: "rainy", snow: "snowy", thunder: "lightning", hail: "hail", frost: "snowy" };

const weatherColor = (kind) => stateColorChain("weather", null, WEATHER_STATES[kind], true);

/* Open windows anywhere in Home Assistant, but not a group of them. Every window is watched, so one that opens counts at once. */
const openWindows = (states, watch) => {
  let open = 0;
  for (const id in states) {
    const st = states[id];
    if (!st || !st.attributes || st.attributes.device_class !== "window" || Array.isArray(st.attributes.entity_id)) continue;
    if (id.startsWith("binary_sensor.")) {
      watch(id);
      if (st.state === "on") open++;
    } else if (id.startsWith("cover.")) {
      watch(id);
      if (st.state !== "closed" && st.state !== "unavailable" && st.state !== "unknown") open++;
    }
  }
  return open;
};

/* Rain, snow, thunder or hail in the next 6 hours, and frost in the next 18. With a window open, wet weather is a
 * warning, also while it already rains. A daily forecast has no hours, so it gives neither. */
const renderWeather = (id, st, forecast, type, items, ctx) => {
  if (!st) return;
  const t = ctx.t;
  const a = st.attributes;
  const fahrenheit = a.temperature_unit === "°F";
  const hours = type === "hourly" || type === "twice_daily" ? forecast : [];
  const windows = openWindows(ctx.hass.states, ctx.watch);
  const wet = (kind, title, message, ts, past) =>
    items.push({
      key: "wx:" + id + ":wet",
      kind: "weather",
      entity: id,
      icon: WEATHER_ICONS[kind],
      color: weatherColor(kind),
      sev: windows ? "warn" : undefined,
      title,
      message,
      ts,
      past,
      /* An open window makes it new, so a hint dismissed before comes back as a warning. */
      ack: kind + (windows ? " open" : ""),
    });
  if (WET.has(st.state)) {
    const kind = wetKind(st.state, a.temperature, fahrenheit ? 34 : 1);
    if (windows) wet(kind, t["wx_" + kind + "_now"], ctx.alikeTitle("window", windows), parseTs(st.last_changed, ctx.now), true);
  } else {
    const hour = hours.find((f) => Date.parse(f.datetime) < ctx.now + 6 * 3600000 && isWet(f, a.precipitation_unit));
    if (hour) {
      /* A forecast hour that has begun counts from now. */
      const start = Math.max(Date.parse(hour.datetime), ctx.now);
      const kind = wetKind(hour.condition, hour.temperature, fahrenheit ? 34 : 1);
      const chance = Number(hour.precipitation_probability);
      const message = windows
        ? ctx.alikeTitle("window", windows)
        : hour.precipitation_probability != null && Number.isFinite(chance)
          ? fill(t.wx_chance, { p: ctx.percent(chance) })
          : "";
      wet(kind, fill(t["wx_" + kind + "_from"], { t: ctx.hour(start) }), message, start, false);
    }
  }
  const freeze = fahrenheit ? 32 : 0;
  if (!hours.length || a.temperature == null || !(Number(a.temperature) > freeze)) return;
  const ahead = hours.filter((f) => Date.parse(f.datetime) < ctx.now + 18 * 3600000 && f.temperature != null && Number.isFinite(Number(f.temperature)));
  const first = ahead.find((f) => Number(f.temperature) < freeze);
  if (!first) return;
  const start = Math.max(Date.parse(first.datetime), ctx.now);
  items.push({
    key: "wx:" + id + ":frost",
    kind: "weather",
    entity: id,
    icon: WEATHER_ICONS.frost,
    color: weatherColor("frost"),
    title: fill(t.wx_frost_from, { t: ctx.hour(start) }),
    message: fill(t.wx_low, { v: ctx.formatAttribute(st, "temperature", Math.min(...ahead.map((f) => Number(f.temperature)))) }),
    ts: start,
    ack: "frost",
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
  if (open || items.some((it) => isAhead(it, now)) || (head && !head.clock && headTime(head))) return 60000 - (now % 60000);
  return 0;
};

/* The closed card shows the time of an entry in place of its message while it runs, or when it has no message. */
const headTime = (it) => Boolean(it.live || (!it.message && Number.isFinite(it.ts)));

/* A row is built again only when something it shows has changed. Times change in place. */
const rowSig = (it) =>
  [
    it.kind,
    it.icon || "",
    it.sev || "",
    it.title,
    it.message || Number.isFinite(it.ts),
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
    --origami-pad: 10px;
    --origami-gap: 10px;
    --origami-gap-s: var(--ha-space-2, 8px);
    --origami-radius: var(--ha-border-radius-md, 8px);
    --origami-tile: 36px;
    --origami-icon: 24px;
    --origami-card-bg: var(--ha-card-background, var(--card-background-color, #fff));
    --origami-row-bg: transparent;
    --origami-hover: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
    --origami-focus: var(--ha-color-focus, var(--primary-color));
    --origami-time: var(--ha-animation-duration-normal, 250ms);
    --origami-ease: cubic-bezier(0.4, 0, 0.2, 1);
    --origami-bg-auto: 0.22;
    --tile-color: var(--state-inactive-color);
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
    transition: box-shadow 180ms ease-in-out, border-color 180ms ease-in-out;
  }
  /* Keyboard focus rings the card in the color of what it shows, like a tile. */
  ha-card:has(.head:focus-visible) {
    border-color: var(--tile-color);
    box-shadow: var(--ha-card-box-shadow, 0 0 0 0 transparent), 0 0 0 1px var(--tile-color);
  }
  /* In the sections view footer the list scrolls within a quarter of the screen. */
  :host(.docked) ha-card { max-height: var(--origami-max-height, 25dvh); }
  /* With a fixed height from the layout tab the card fills its cell, the header centers and the list
   * scrolls. ha-card is stretched rather than sized, so a margin from css stays inside the cell. */
  :host(.bounded) { height: 100%; }
  :host(.bounded) ha-card:not(.open) .hwrap { flex: 1 1 auto; }
  :host(.bounded) ha-card:not(.open) .head { height: 100%; }

  .backdrop, .alert {
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
  /* Something critical makes the closed card pulse, like Home Assistant's alert card. */
  .alert { background: var(--error-color); opacity: 0; }
  ha-card.crit:not(.open) .alert { animation: origami-pulse 1s ease-in-out infinite alternate; }
  @keyframes origami-pulse { to { opacity: var(--origami-pulse-opacity, 0.2); } }

  .head, .ebar {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--origami-gap);
    outline: none;
  }
  .head {
    padding: 0 var(--origami-pad);
    touch-action: pan-y;
  }
  ha-card.tappable .head, .ebar { cursor: pointer; }
  ha-ripple {
    --ha-ripple-color: var(--tile-color);
    --ha-ripple-hover-opacity: 0.04;
    --ha-ripple-pressed-opacity: 0.12;
  }
  ha-card:not(.tappable) .head ha-ripple { display: none; }

  .tile, .rtile {
    position: relative;
    flex: none;
    width: var(--origami-tile);
    height: var(--origami-tile);
    display: flex; align-items: center; justify-content: center;
    border-radius: var(--ha-tile-icon-border-radius, var(--ha-border-radius-pill, 9999px));
    color: var(--tile-color);
    --mdc-icon-size: var(--origami-icon);
    transition: color var(--origami-time) ease-in-out;
  }
  .glyph {
    position: absolute;
    inset: 0;
    display: flex; align-items: center; justify-content: center;
    border-radius: inherit;
  }
  .tile :is(ha-icon, ha-state-icon), .rtile :is(ha-icon, ha-state-icon) { display: flex; }
  .tile.idle { color: var(--state-inactive-color); }

  .badge {
    position: absolute;
    top: -2px;
    inset-inline-end: -6px;
    min-width: 16px; height: 16px;
    padding: 0 4px;
    display: flex; align-items: center; justify-content: center;
    background: var(--accent-color);
    color: var(--text-accent-color, var(--text-primary-color, #fff));
    border-radius: 8px;
    box-shadow: 0 0 0 2px var(--origami-card-bg);
    font-size: var(--ha-font-size-xs, 10px);
    font-weight: var(--ha-font-weight-medium, 500);
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .badge[hidden] { display: none; }

  /* Only the text moves when the card turns, and it is clipped here. The soft edges lie in the space around the
   * text, so the text at rest never fades. The row height sits here too, so the open card folds the head away. */
  .texts {
    flex: 1 1 auto;
    min-width: 0;
    min-height: var(--row-height, 56px);
    align-self: stretch;
    display: flex;
    margin-inline: calc(var(--origami-gap) * -1);
    padding-inline: var(--origami-gap);
    overflow: hidden;
  }
  .texts.up { mask-image: linear-gradient(to bottom, transparent, #000 8px, #000 calc(100% - 8px), transparent); }
  .texts.side { mask-image: linear-gradient(to right, transparent, #000 var(--origami-gap), #000 calc(100% - var(--origami-gap)), transparent); }
  .slide {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .head .title {
    min-width: 0;
    color: var(--ha-tile-info-primary-color, var(--primary-text-color));
    font-size: var(--ha-tile-info-primary-font-size, var(--ha-font-size-m, 14px));
    font-weight: var(--ha-tile-info-primary-font-weight, var(--ha-font-weight-medium, 500));
    line-height: var(--ha-tile-info-primary-line-height, var(--ha-line-height-normal, 1.6));
    letter-spacing: var(--ha-tile-info-primary-letter-spacing, 0.1px);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .msg, .eta {
    min-width: 0;
    color: var(--ha-tile-info-secondary-color, var(--primary-text-color));
    font-size: var(--ha-tile-info-secondary-font-size, var(--ha-font-size-s, 12px));
    font-weight: var(--ha-tile-info-secondary-font-weight, var(--ha-font-weight-normal, 400));
    line-height: var(--ha-tile-info-secondary-line-height, var(--ha-line-height-condensed, 1.2));
    letter-spacing: var(--ha-tile-info-secondary-letter-spacing, 0.4px);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .msg state-display { display: inline; }
  .msg state-display[hidden] { display: none; }
  .eta { font-variant-numeric: tabular-nums; }
  .msg[hidden], .eta[hidden], .head.single .msg { display: none; }

  .chev {
    flex: none;
    color: var(--secondary-text-color);
    --mdc-icon-size: 20px;
  }
  .chev[hidden], :host(.narrow) .head .chev { display: none; }

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
    transition: opacity 200ms var(--origami-ease), visibility 0s 280ms;
  }
  .inner {
    display: flex; flex-direction: column;
    padding-bottom: 0; opacity: 0; visibility: hidden;
    transition: opacity 200ms var(--origami-ease), padding 280ms var(--origami-ease), visibility 0s 280ms;
  }
  ha-card.open .head { opacity: 0; visibility: hidden; }
  ha-card.open .inner {
    padding-bottom: var(--origami-gap-s);
    opacity: 1;
    visibility: visible;
    transition: opacity 200ms 80ms var(--origami-ease), padding 280ms var(--origami-ease), visibility 0s;
  }
  ha-card:not(.open) .head {
    transition: opacity 200ms 80ms var(--origami-ease), visibility 0s;
  }
  .ebar {
    flex: none;
    min-height: 48px;
    padding: 0 var(--origami-pad);
  }
  .ebar:focus-visible, .row .rtile:focus-visible, .x:focus-visible, .act:focus-visible, .clear:focus-visible {
    outline: 2px solid var(--origami-focus);
    outline-offset: -2px;
  }
  .ebar:focus-visible { border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px)); }
  .count {
    flex: 1 1 auto;
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    font-variant-numeric: tabular-nums;
  }
  .list {
    position: relative;
    flex: 0 1 auto;
    min-height: 0;
    display: flex; flex-direction: column;
    gap: 2px;
    padding: 0 calc(var(--origami-pad) - 4px);
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
    position: relative;
    flex: none;
    display: grid;
    grid-template-columns: var(--origami-tile) minmax(0, 1fr) auto;
    grid-template-areas: "rtile rtitle rmeta" "rtile rbody rbody";
    align-items: center;
    column-gap: var(--origami-gap);
    padding: 6px 4px;
    background: var(--origami-row-bg);
    border-radius: var(--origami-radius);
    transition: background-color var(--origami-time) var(--origami-ease);
  }
  .row.crit { background: color-mix(in srgb, var(--error-color) 12%, var(--origami-row-bg)); }
  .row.link, .row.expandable, .row.open { cursor: pointer; }
  .row.moving, .foot.moving { overflow: hidden; }
  .row.leaving, .foot.leaving { pointer-events: none; }
  :host(.has-bg) .row { background: color-mix(in srgb, var(--origami-card-bg) 60%, transparent); }
  :host(.has-bg) .row.crit { background: color-mix(in srgb, var(--error-color) 16%, color-mix(in srgb, var(--origami-card-bg) 60%, transparent)); }
  .rtile {
    grid-area: rtile;
    align-self: start;
    outline: none;
  }
  .rtile[role="button"] { cursor: pointer; }
  .glyph img, .rtile img {
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
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: var(--ha-line-height-normal, 1.6);
    letter-spacing: 0.1px;
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
    gap: 2px;
  }
  .when {
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-s, 12px);
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
    width: 32px; height: 32px;
    margin: -5px -4px -5px 0;
    display: flex; align-items: center; justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--secondary-text-color);
    border-radius: 50%;
    cursor: pointer;
    --mdc-icon-size: 20px;
  }
  .x::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: currentColor;
    opacity: 0;
    transition: opacity 150ms ease;
  }
  /* A bigger touch target. */
  .x::before { content: ""; position: absolute; inset: -6px -4px; }
  .x ha-icon { display: flex; }
  .row .body {
    grid-area: rbody;
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-s, 12px);
    line-height: 1.4;
    letter-spacing: 0.2px;
    overflow-wrap: anywhere;
    text-wrap: pretty;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    max-height: calc(2 * 1.4em);
    overflow: hidden;
  }
  .row .body:empty { display: none; }
  .row .body .when { font-size: inherit; line-height: inherit; }
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
    margin: var(--origami-gap-s) 0 2px;
  }
  /* Buttons look like Home Assistant's filled buttons. */
  .act {
    border: none; cursor: pointer;
    height: 32px;
    padding: 0 12px;
    background: var(--ha-color-fill-primary-normal-resting, color-mix(in srgb, var(--primary-color) 14%, transparent));
    color: var(--ha-color-on-primary-normal, var(--primary-color));
    border-radius: var(--ha-border-radius-pill, 9999px);
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    white-space: nowrap;
    transition: background-color 150ms ease-out;
  }
  .act:active { background: var(--ha-color-fill-primary-normal-active, color-mix(in srgb, var(--primary-color) 24%, transparent)); }
  .act[disabled] {
    background: var(--ha-color-fill-disabled-normal-resting, color-mix(in srgb, var(--primary-text-color) 8%, transparent));
    color: var(--ha-color-on-disabled-normal, var(--disabled-text-color));
    pointer-events: none;
  }
  .foot {
    flex: none;
    margin: var(--origami-gap-s) var(--origami-pad) 0;
    border-top: 1px solid var(--divider-color, color-mix(in srgb, currentColor 12%, transparent));
    padding-top: var(--origami-gap-s);
    text-align: end;
  }
  .foot[hidden] { display: none; }
  .clear {
    border: none; cursor: pointer;
    height: 36px;
    padding: 0 12px;
    background: transparent;
    color: var(--ha-color-on-primary-normal, var(--primary-color));
    border-radius: var(--ha-border-radius-pill, 9999px);
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    transition: background-color 150ms ease-out;
  }
  .clear:active { background: var(--ha-color-fill-primary-quiet-active, color-mix(in srgb, var(--primary-color) 12%, transparent)); }
  .x:active::after { opacity: 0.16; }

  @media (hover: hover) {
    .row.link:hover, .row.expandable:hover, .row.open:hover { background-color: var(--origami-hover); }
    .row.crit.link:hover { background-color: color-mix(in srgb, var(--error-color) 16%, var(--origami-hover)); }
    .x:hover::after { opacity: 0.1; }
    .act:hover { background: var(--ha-color-fill-primary-normal-hover, color-mix(in srgb, var(--primary-color) 20%, transparent)); }
    .clear:hover { background: var(--ha-color-fill-primary-quiet-hover, color-mix(in srgb, var(--primary-color) 8%, transparent)); }
    .ebar:hover .chev { color: var(--primary-text-color); }
  }

  /* Read by screen readers only. */
  .say {
    position: absolute;
    width: 1px; height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
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
    ha-card.crit:not(.open) .alert { opacity: var(--origami-pulse-opacity, 0.2); }
  }
`;

const TEMPLATE = `
  <style>${STYLES}</style>
  <ha-card>
    <div class="backdrop" aria-hidden="true"><img alt="" draggable="false"><img alt="" draggable="false"></div>
    <div class="alert" aria-hidden="true"></div>
    <div class="hwrap">
      <div class="head" role="button" tabindex="0">
        <div class="tile"><div class="glyph"><ha-icon></ha-icon></div><div class="badge" hidden></div></div>
        <div class="texts">
          <div class="slide">
            <div class="title"></div>
            <div class="msg"><span class="t"></span></div>
            <div class="eta" aria-live="off" hidden></div>
          </div>
        </div>
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
    <div class="say" aria-live="polite"></div>
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
    if (src.before != null && !(parseBefore(src.before) >= 0)) fail("before must be minutes or a duration like 1:30:00");
    if (typeof src.tap_action === "string") src.tap_action = { action: src.tap_action };
    src.actions = Array.isArray(src.actions) ? src.actions.filter(isObject) : null;
    if (!sources.some((s) => s.entity === src.entity)) sources.push(src);
  }
  if (config.weather != null && !(typeof config.weather === "string" && config.weather.startsWith("weather."))) {
    fail("weather must be a weather entity, e.g. weather.home");
  }
  if (config.css != null && typeof config.css !== "string") fail("css must be a string");
  if (config.infos != null && !Array.isArray(config.infos)) fail("infos must be a list");
  const infos = [];
  for (const entry of config.infos || []) {
    const info = typeof entry === "string" ? { entity: entry } : isObject(entry) ? { ...entry } : null;
    if (!info || typeof info.entity !== "string" || !info.entity.includes(".")) {
      fail("infos must contain entity ids, got " + JSON.stringify(entry));
    }
    if (info.visibility != null && !Array.isArray(info.visibility)) fail("visibility of " + info.entity + " must be a list of conditions");
    if (info.forecast_type != null && !FORECAST_TYPES.includes(info.forecast_type)) fail("forecast_type must be daily, hourly or twice_daily");
    if (info.forecast_slots != null && !(Number.isInteger(info.forecast_slots) && info.forecast_slots > 0)) {
      fail("forecast_slots must be a whole number above 0");
    }
    for (const key of ["tap_action", "hold_action", "double_tap_action"]) {
      if (typeof info[key] === "string") info[key] = { action: info[key] };
    }
    infos.push(info);
  }
  if (config.rotate != null && config.rotate !== false && !(typeof config.rotate === "number" && config.rotate >= 0)) {
    fail("rotate must be the seconds between turns, or 0 to turn them off");
  }
  if (config.slide != null && config.slide !== "up" && config.slide !== "side") fail("slide must be up or side");
  return { sources, audience: checkAudience(config.audience), infos };
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
    this._forecasts = new Map();
    this._pictures = new Map();
    this._clock = null;
    this._boundaryTimer = null;
    this._wakes = [];
    this._visible = true;
    this._onVisibility = () => {
      if (!document.hidden) this._refreshTimes();
      this._tick();
      this._rotate();
    };
    this._infos = [];
    this._serverSubs = new Map();
    this._serverUsed = new Set();
    this._slides = [];
    this._slideKey = null;
    this._slideKeys = null;
    this._headSlide = null;
    this._swapping = null;
    this._held = new Set();
    this._stopped = false;
    this._rotateTimer = null;
    this._press = null;
    this._noClick = false;
    this._swiped = false;
    this._ownCancel = null;
    this._tapWait = null;
    this._narrow = false;
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
    /* Home Assistant may define its state icon and its state text after the card. Then everything is drawn again. */
    for (const tag of ["ha-state-icon", "state-display"]) {
      if (customElements.get(tag)) continue;
      customElements.whenDefined(tag).then(() => {
        this._epoch++;
        this._headSlide = null;
        this._render();
      });
    }
  }

  setConfig(config) {
    const { sources, audience, infos } = checkConfig(config);
    this._config = { ...DEFAULTS, ...config };
    this._infoConfig = infos;
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

  /* An hour as the profile writes it, like 7 PM or 19 Uhr. */
  _hourText(ts) {
    try {
      return dateFormat(this._lang, { hour: "numeric", ...this._clockOpts() }).format(ts);
    } catch (e) {
      return dateFormat(undefined, { hour: "numeric" }).format(ts);
    }
  }

  _percentText(p) {
    try {
      return new Intl.NumberFormat(this._lang, { style: "percent", maximumFractionDigits: 0 }).format(p / 100);
    } catch (e) {
      return Math.round(p) + " %";
    }
  }

  _weatherId() {
    return (this._config && this._config.weather) || null;
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
    /* Conditions the server checks were given up when the card left. */
    if (this._hass && (this._infoConfig || []).some((info) => info.visibility)) this._recompute();
    if (this._hostAnim) this._hostAnim.finish();
    document.addEventListener("visibilitychange", this._onVisibility);
    this._scheduleDay();
    this._scheduleBoundary();
    if (this._dom) {
      this._ro.observe(this._dom.card);
      if (this._io) this._io.observe(this);
      this._suppressAnim();
      this._refreshTimes();
      this._tick();
      this._rotate();
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
    this._unsubscribeForecasts();
    this._dropServerConditions();
    for (const mql of (this._mediaWatch || new Map()).values()) mql.onchange = null;
    this._mediaWatch = null;
    CARDS.delete(this);
    clearTimeout(this._repairsTimer);
    clearTimeout(this._dayTimer);
    clearTimeout(this._boundaryTimer);
    this._boundaryTimer = null;
    if (this._ro) this._ro.disconnect();
    if (this._io) this._io.disconnect();
    document.removeEventListener("visibilitychange", this._onVisibility);
    this._stopClock();
    this._rotate();
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
    this._subscribeForecasts();
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

  /* One forecast subscription for each weather entity and type the card reads, for rain ahead and for infos. Like a
   * to-do list, a forecast Home Assistant refused is asked for again once the weather changes, since the entity may
   * still be loading. */
  _subscribeForecasts() {
    const h = this._hass;
    const want = new Map();
    if (h && this.isConnected) {
      const id = this._weatherId();
      const type = id ? forecastType(h.states[id]) : null;
      if (type) want.set(id + "|" + type, [id, type]);
      for (const info of this._infoConfig || []) {
        const ft = info.forecast_type;
        if (info.entity.startsWith("weather.") && forecastSupported(h.states[info.entity], ft)) want.set(info.entity + "|" + ft, [info.entity, ft]);
      }
    }
    for (const [key, sub] of this._forecasts) {
      if (want.has(key) && (sub.failed === undefined || sub.failed === h.states[sub.id])) continue;
      this._forecasts.delete(key);
      sub.unsub.then((unsub) => unsub()).catch(() => {});
    }
    if (!h || !h.connection) return;
    for (const [key, [id, type]] of want) {
      if (this._forecasts.has(key)) continue;
      const sub = { key, id };
      this._forecasts.set(key, sub);
      sub.unsub = h.connection.subscribeMessage((msg) => this._onForecast(sub, msg), {
        type: "weather/subscribe_forecast",
        entity_id: id,
        forecast_type: type,
      });
      sub.unsub.catch(() => {
        sub.failed = (this._hass && this._hass.states[id]) || null;
      });
    }
  }

  _unsubscribeForecasts() {
    for (const sub of this._forecasts.values()) sub.unsub.then((unsub) => unsub()).catch(() => {});
    this._forecasts.clear();
  }

  /* Every card on the same forecast takes the news at once. A repeat of what the cache holds changes nothing. */
  _onForecast(sub, msg) {
    if (this._forecasts.get(sub.key) !== sub) return;
    const forecast = msg && Array.isArray(msg.forecast) ? msg.forecast : null;
    const print = forecastFingerprint(forecast);
    const cached = FORECAST_CACHE.get(sub.key);
    if (cached && cached.print === print) return;
    FORECAST_CACHE.set(sub.key, { forecast, print });
    for (const card of CARDS) if (card._forecasts.has(sub.key)) card._recompute();
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
        const named = [...new Set(this._repairs.map((i) => i.issue_domain || i.domain))];
        if (domains.length && typeof h.loadBackendTranslation === "function") {
          const load = (category, list) =>
            h.loadBackendTranslation(category, list).then((localize) => {
              this._issueLocalize = localize;
              this._recompute();
            });
          /* Each load returns Home Assistant's localize with everything loaded so far. */
          return load("issues", domains).then(() => load("title", named));
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
      /* An entity read besides the card's own, so a change to it counts. */
      watch: (id) => read.push(id),
      hour: (ts) => this._hourText(ts),
      percent: (p) => this._percentText(p),
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
    const weather = this._weatherId();
    let forecastKnown = false;
    if (h && weather && allowed(weather)) {
      read.push(weather);
      const st = h.states[weather];
      const type = forecastType(st);
      const cached = type && FORECAST_CACHE.get(weather + "|" + type);
      forecastKnown = Boolean(cached);
      renderWeather(weather, st, cached ? forecastFilterPast(cached.forecast, type, now) : [], type, items, ctx);
      /* The six and eighteen hours ahead move on with every hour. */
      if (cached && type !== "daily") ctx.wake(Math.floor(now / 3600000) * 3600000 + 3600000);
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
      const oldKey = acks[it.key] === undefined && it.oldKey ? it.oldKey : it.key;
      const heldBefore = oldKey !== it.key && it.oldRow !== undefined && heldAs(acks[oldKey], it.oldRow);
      /* A NINA warning without its details has no signature yet. A dismissal stays as it is and hides it meanwhile. */
      if (it.waiting) {
        if (acks[it.key] !== undefined || heldBefore) items.splice(i, 1);
        continue;
      }
      /* Weather ahead keeps its dismissal while its first hour moves on. */
      const once = it.kind === "attribute" || it.kind === "picture" || (it.kind === "weather" && !it.past);
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
    /* So does weather that was gone while the forecast was known. */
    for (const key of forecastKnown ? ["wx:" + weather + ":wet", "wx:" + weather + ":frost"] : []) {
      if (!present.has(key) && acks[key] !== undefined) {
        delete acks[key];
        acksDirty = true;
      }
    }
    if (acksDirty) saveAcks(present);
    items = groupAlike(items, ctx);
    this._items = sortItems(items, now);
    this._infos = h ? this._infosNow(ctx, read) : [];
    this._readIds = read;
    const reorder = nextReorder(this._items, now);
    if (reorder !== null) ctx.wake(reorder);
    this._render(now);
    this._scheduleDay();
    this._scheduleBoundary(wakes, now);
  }

  /* The infos a quiet card shows, in their order, while their entity is there and their conditions hold. */
  _infosNow(ctx, read) {
    const h = ctx.hass;
    const out = [];
    const keys = new Set();
    this._serverUsed = new Set();
    for (const info of this._infoConfig || []) {
      const st = h.states[info.entity];
      read.push(info.entity);
      if (!st || st.state === "unavailable" || st.state === "unknown") continue;
      if (!this._conditionsMet(info.visibility, info.entity, ctx, read)) continue;
      let key = "i:" + info.entity;
      while (keys.has(key)) key += "+";
      keys.add(key);
      const own = info.color && info.color !== "state";
      const colorOf = (s) => (own ? (stateActive(s) ? themeColor(info.color) : "var(--state-inactive-color)") : stateColor(s));
      const base = {
        kind: "info",
        info,
        entity: info.entity,
        icon: info.icon || undefined,
        image: info.show_entity_picture ? ctx.url(findPicture(st.attributes)) : null,
      };
      const slots = this._forecastSlots(info, st, ctx);
      if (!slots) {
        out.push({ ...base, key, stateObj: st, title: ctx.name(st, info.name), color: colorOf(st), content: info.state_content, timeFormat: info.time_format });
        continue;
      }
      /* Each forecast slot turns by like an info of its own, with the condition as its state. A name of the
       * info's own comes first, and the day or hour moves to the second line. */
      const named = isEmpty(info.name) ? "" : ctx.name(st, info.name);
      slots.forEach((slot, n) => {
        const shown = { ...st, state: slot.condition || st.state };
        const label = this._slotLabel(Date.parse(slot.datetime), info.forecast_type, ctx.now);
        out.push({
          ...base,
          key: key + "#" + n,
          stateObj: shown,
          title: named || label,
          text: [named ? label : "", this._slotText(slot, shown, info.forecast_type)].filter(Boolean).join(" · "),
          icon: base.icon || (slot.is_daytime === false && NIGHT_ICONS[slot.condition]) || undefined,
          color: colorOf(shown),
        });
      });
    }
    this._dropServerConditions(this._serverUsed);
    return out;
  }

  /* The forecast slots an info shows in place of its state, none while the forecast loads, or null. Like Home
   * Assistant's forecast card, a type the entity lacks shows the current weather. */
  _forecastSlots(info, st, ctx) {
    const type = info.forecast_type;
    if (!info.entity.startsWith("weather.") || !forecastSupported(st, type)) return null;
    const cached = FORECAST_CACHE.get(info.entity + "|" + type);
    /* A day lasts until midnight where the user is, whatever hour the integration gives it. */
    const today = dayNumber(ctx.now, ctx.zone);
    const slots = (cached && Array.isArray(cached.forecast) ? cached.forecast : [])
      .filter((f) => f && Number.isFinite(Date.parse(f.datetime)))
      .filter((f) => (type === "daily" ? dayNumber(Date.parse(f.datetime), ctx.zone) >= today : Date.parse(f.datetime) + FORECAST_SPAN[type] > ctx.now))
      .slice(0, info.forecast_slots || 1);
    /* Today and Tomorrow move on at midnight, and an hour or half a day when it ends. */
    if (slots.length) {
      ctx.wake(dayStart(today + 1, ctx.zone));
      if (type !== "daily") ctx.wake(Date.parse(slots[0].datetime) + FORECAST_SPAN[type]);
    }
    return slots;
  }

  /* Today, Tomorrow or the weekday, and the hour for an hourly forecast. */
  _slotLabel(ts, type, now) {
    const zone = this._clockOpts().timeZone;
    const diff = dayNumber(ts, zone) - dayNumber(now, zone);
    let day;
    try {
      day = Math.abs(diff) <= 1 ? this._rel.format(diff, "day") : dateFormat(this._lang, { weekday: "long", timeZone: zone }).format(ts);
    } catch (e) {
      day = dateFormat(undefined, { weekday: "long" }).format(ts);
    }
    let text = day;
    if (type === "hourly") {
      let time;
      try {
        time = new Date(ts).toLocaleTimeString(this._lang, { hour: "numeric", minute: "2-digit", ...this._clockOpts() });
      } catch (e) {
        time = new Date(ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
      }
      text = diff === 0 ? time : fill(this._t.day_at, { d: day, t: time });
    }
    return text.charAt(0).toLocaleUpperCase(this._lang) + text.slice(1);
  }

  /* Day or night, the temperatures and the condition, like a slot of Home Assistant's forecast card. */
  _slotText(slot, shown, type) {
    const h = this._hass;
    const temps = [slot.temperature, slot.templow]
      .filter((v) => v != null && v !== "" && Number.isFinite(Number(v)))
      .map((v) => this._numText(Number(v)) + "°")
      .join(" / ");
    return [
      type === "twice_daily" ? (slot.is_daytime === false ? this._t.wx_night : this._t.wx_day) : "",
      temps,
      slot.condition ? (h && h.formatEntityState ? h.formatEntityState(shown) : slot.condition) : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  /* A number as the profile writes numbers. */
  _numText(v) {
    const l = (this._hass && this._hass.locale) || {};
    const locale = l.number_format === "system" ? undefined : NUMBER_LOCALES[l.number_format] || this._lang;
    try {
      return new Intl.NumberFormat(locale, { maximumFractionDigits: 1, useGrouping: l.number_format !== "none" }).format(v);
    } catch (e) {
      return String(v);
    }
  }

  /* Visibility as Home Assistant checks it for cards. An entity a condition reads counts as watched, and the
   * moment a time condition can change wakes the card. */
  _conditionsMet(conditions, entity, ctx, read) {
    this._conditionFailed = false;
    const met = listOf(conditions).filter(switchedOn).map((c) => this._conditionMet(c, entity, ctx, read));
    /* An error from the server hides the info, as it hides a card. */
    return met.every(Boolean) && !this._conditionFailed;
  }

  _conditionMet(c, entity, ctx, read) {
    if (!isObject(c) || ("enabled" in c && typeof c.enabled !== "boolean")) return false;
    const h = ctx.hass;
    const type = "condition" in c ? c.condition : "state";
    if (type === "and" || type === "or" || type === "not") {
      if (c.conditions == null) return true;
      const met = listOf(c.conditions).filter(switchedOn).map((k) => this._conditionMet(k, entity, ctx, read));
      return type === "and" ? met.every(Boolean) : type === "or" ? met.some(Boolean) : !met.every(Boolean);
    }
    if ("entity_id" in c || !CLIENT_CONDITIONS.has(type)) return this._serverCondition(c, ctx);
    /* A value that names an entity also stands for that entity's state. */
    const refer = (v) => {
      if (!isEntityId(v) || !h.states[v]) return undefined;
      read.push(v);
      return h.states[v].state;
    };
    const own = () => {
      const id = c.entity || entity;
      read.push(id);
      const st = h.states[id];
      return st && c.attribute ? st.attributes[c.attribute] : st && st.state;
    };
    if (type === "screen") return Boolean(c.media_query) && this._media(c.media_query);
    if (type === "user") return Boolean(c.users && h.user && h.user.id) && c.users.includes(h.user.id);
    if (type === "view_columns") return true;
    if (type === "time") return this._timeMet(c, ctx);
    if (type === "location") {
      const person = userPerson(h);
      if (person) read.push(person.entity_id);
      return Boolean(person && c.locations && c.locations.includes(person.state));
    }
    if (type === "numeric_state") {
      const n = Number(own());
      if (isNaN(n)) return false;
      const bound = (v) => Number(typeof v === "string" ? (refer(v) !== undefined ? refer(v) : v) : v);
      const above = bound(c.above);
      const below = bound(c.below);
      return (c.above == null || isNaN(above) || above < n) && (c.below == null || isNaN(below) || below > n);
    }
    const raw = own();
    const state = raw == null ? "unknown" : String(raw);
    const value = c.state != null ? c.state : c.state_not;
    if (value === undefined) return false;
    const values = listOf(value).flatMap((v) => (refer(v) !== undefined ? [v, refer(v)] : [v]));
    return c.state != null ? values.includes(state) : !values.includes(state);
  }

  /* Like Home Assistant, a time condition reads today in the zone of the profile and includes both ends. */
  _timeMet(c, ctx) {
    const zone = this._clockOpts().timeZone;
    const p = zonedParts(ctx.now, zone);
    const day = dayNumber(ctx.now, zone);
    const now = p.hour * 3600 + p.minute * 60 + p.second;
    const after = c.after ? daySeconds(c.after) : null;
    const before = c.before ? daySeconds(c.before) : null;
    for (const at of [after, before == null ? null : before + 1]) {
      if (at == null) continue;
      ctx.wake(dayStart(day, zone) + at * 1000);
      ctx.wake(dayStart(day + 1, zone) + at * 1000);
    }
    ctx.wake(dayStart(day + 1, zone));
    if (c.weekdays && c.weekdays.length && !c.weekdays.includes(WEEKDAYS[new Date(day * DAY_MS).getUTCDay()])) return false;
    if (after != null && before != null) return before < after ? now >= after || now <= before : now >= after && now <= before;
    if (after != null) return now >= after;
    return before == null || now <= before;
  }

  /* A media query is asked again whenever its answer changes. */
  _media(query) {
    if (!window.matchMedia) return false;
    this._mediaWatch = this._mediaWatch || new Map();
    let mql = this._mediaWatch.get(query);
    if (!mql) {
      mql = window.matchMedia(query);
      mql.onchange = () => this._recompute();
      this._mediaWatch.set(query, mql);
    }
    return mql.matches;
  }

  /* From 2026.10 Home Assistant checks conditions like sun or template on the server and sends each change. Until
   * the first answer, and where the server does not know the command, the condition counts as not met. */
  _serverCondition(c, ctx) {
    const key = JSON.stringify(c);
    this._serverUsed.add(key);
    let sub = this._serverSubs.get(key);
    if (!sub) {
      sub = { result: false, failed: false };
      this._serverSubs.set(key, sub);
      const conn = ctx.hass.connection;
      if (conn && this.isConnected) {
        sub.unsub = conn.subscribeMessage(
          (msg) => {
            const result = Boolean(msg && msg.result === true);
            const failed = Boolean(msg && msg.error);
            if (result === sub.result && failed === sub.failed) return;
            Object.assign(sub, { result, failed });
            this._recompute();
          },
          { type: "subscribe_condition", condition: c }
        );
        sub.unsub.catch(() => {});
      }
    }
    if (sub.failed) this._conditionFailed = true;
    return sub.result;
  }

  _dropServerConditions(keep = new Set()) {
    for (const [key, sub] of this._serverSubs) {
      if (keep.has(key)) continue;
      if (sub.unsub) sub.unsub.then((u) => u()).catch(() => {});
      this._serverSubs.delete(key);
    }
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
      glyph: q(".head .glyph"),
      texts: q(".texts"),
      slide: q(".slide"),
      title: q(".head .title"),
      msg: q(".msg"),
      t: q(".msg .t"),
      eta: q(".head .eta"),
      badge: q(".badge"),
      chev: q(".head .chev"),
      list: q(".list"),
      foot: q(".foot"),
      clear: q(".clear"),
      ebar: q(".ebar"),
      count: q(".count"),
      say: q(".say"),
      bgs: [...this.shadowRoot.querySelectorAll(".backdrop img")],
      userCss,
    };
    const d = this._dom;
    for (const img of d.bgs) img.referrerPolicy = "no-referrer";
    d.clear.textContent = this._t.clear;
    this._applyCustomStyles();
    /* Home Assistant's own ripple gives the hover and press feedback of its cards. */
    if (customElements.get("ha-ripple")) {
      for (const el of [d.head, d.ebar]) el.prepend(document.createElement("ha-ripple"));
    }
    d.head.addEventListener("click", () => {
      if (this._noClick) {
        this._noClick = false;
        return;
      }
      this._activate();
    });
    d.head.addEventListener("keydown", (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (step && this._slides.length > 1) {
        e.preventDefault();
        this._step(step * (e.key.length > 7 && this._rtl() ? -1 : 1), "key");
        return;
      }
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      this._activate();
    });
    d.head.addEventListener("pointerdown", (e) => this._onPress(e));
    d.head.addEventListener("pointermove", (e) => this._onDrag(e));
    d.head.addEventListener("pointerup", (e) => this._onRelease(e, false));
    d.head.addEventListener("pointercancel", (e) => e !== this._ownCancel && this._onRelease(e, true));
    d.head.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && this._hold("hover", true));
    d.head.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && this._hold("hover", false));
    d.head.addEventListener("focusin", () => this._hold("focus", d.head.matches(":focus-visible")));
    d.head.addEventListener("focusout", () => this._hold("focus", false));
    /* The click that ends a swipe reaches neither the card nor its ripple. */
    d.card.addEventListener(
      "click",
      (e) => {
        if (!this._swiped || !d.head.contains(e.target)) return;
        this._swiped = false;
        e.stopPropagation();
      },
      true
    );
    d.ebar.addEventListener("click", () => this._toggle());
    d.ebar.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      this._toggle();
    });
    d.card.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !this._expanded) return;
      e.stopPropagation();
      this._toggle();
      d.head.focus({ preventScroll: true });
    });
    d.clear.addEventListener("click", (e) => {
      this._clearAll();
      if (e.detail === 0) this._focusAfter(0);
    });
    /* Like Home Assistant's own cards, the card measures its width to fit a narrow cell. */
    this._ro = new ResizeObserver((entries) => {
      const width = entries[entries.length - 1].contentRect.width;
      const narrow = width > 0 && width < NARROW_PX;
      if (narrow === this._narrow) return;
      this._narrow = narrow;
      this.classList.toggle("narrow", narrow);
      this._render();
    });
    this._ro.observe(d.card);
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
    this._rotate();
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
    if (this._narrow && !this._expanded && this._openDialog()) return;
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

  /* Where the card is narrow, the list opens in Home Assistant's own dialog. It is a bottom sheet on a phone.
   * Until Home Assistant has loaded that dialog, and in the dashboard editor, the list unfolds in the card. */
  _openDialog() {
    if (this._editMode || !customElements.get("ha-adaptive-dialog")) return false;
    fire(this._dom.head, "show-dialog", { dialogTag: DIALOG, dialogImport: () => Promise.resolve(), dialogParams: { card: this } });
    return true;
  }

  /* One clock per card, and only while a time on show can change. */
  _tick() {
    this._stopClock();
    if (!this._dom || !this.isConnected || !this._visible || document.hidden) return;
    const ms = nextTick(this._items, this._headItem(), this._expanded || Boolean(this._dialogEl), Date.now());
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
    const top = this._headItem();
    if (top && headTime(top) && !this._swapping) setText(this._dom.eta, this._timeText(top, now));
    for (const rows of [this._rowCache, this._dialogEl && this._dialogEl._cache]) {
      if (!rows) continue;
      for (const it of this._items) {
        const entry = rows.get(it.key);
        if (entry) this._setTime(entry.el, it, now);
      }
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

  /* After a dismissal by keyboard, focus the row that took its place, in the card or in the dialog. */
  _focusAfter(index, root = this.shadowRoot, cache) {
    const inCard = root === this.shadowRoot;
    if (inCard && this._hiding()) return;
    const rows = cache || (inCard ? this._rowCache : (this._dialogEl && this._dialogEl._cache) || new Map());
    const it = this._items[Math.min(Math.max(index, 0), this._items.length - 1)];
    const entry = it && rows.get(it.key);
    const target =
      (entry && (entry.el.querySelector(".x") || entry.el.querySelector(".rtile[role=button]"))) ||
      (inCard ? (this._expanded ? this._dom.ebar : this._dom.head) : null);
    if (target) target.focus({ preventScroll: true });
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
    const empty = items.length === 0 && this._infos.length === 0;

    /* The card keeps showing what it showed while it fades away. */
    if (empty && this._config.hide_when_empty && !this._editMode && !this._inPicker) {
      this._setShown(false);
      this._painted = true;
      this._stopClock();
      this._rotate();
      if (this._dialogEl) this._dialogEl.update();
      return;
    }
    this._setShown(true);

    if (!items.length) this._expanded = false;
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
    d.card.classList.toggle("has-items", items.length > 0);

    const { slide, moved } = this._pickSlide();
    const tappable = items.length > 0 || Boolean(slide && slide.kind === "info" && this._infoActs(slide));
    d.card.classList.toggle("tappable", tappable);
    d.head.setAttribute("aria-disabled", String(!tappable));
    /* The head opens the list, or the dialog where the card is narrow, or what an info leads to. */
    if (items.length && !this._narrow) d.head.setAttribute("aria-expanded", String(this._expanded));
    else d.head.removeAttribute("aria-expanded");
    if (items.length && this._narrow) d.head.setAttribute("aria-haspopup", "dialog");
    else d.head.removeAttribute("aria-haspopup");
    d.badge.hidden = items.length < 2;
    setText(d.badge, badgeText(items.length));
    d.chev.hidden = !items.length;
    const shown = this._painted && !this._hiding() && !this._expanded;
    this._paintHead(slide, now, moved && shown ? { dir: 1 } : null);

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
    if (this._dialogEl) this._dialogEl.update();
    this._tick();
    this._rotate(moved);
  }

  /* What the closed card turns through. Critical entries take it alone, and infos fill a quiet card. A new
   * entry comes forward at once and is read out, and so does a new first entry. */
  _pickSlide() {
    const items = this._items;
    const crit = items.filter((it) => it.sev === "crit");
    const slides = crit.length ? crit : items.length ? items : this._infos;
    const before = this._slideKeys;
    const top = slides[0] || null;
    const topMoved = Boolean(top && top.kind !== "info" && top.key !== this._topKey);
    this._slides = slides;
    this._slideKeys = new Set(slides.map((s) => s.key));
    this._topKey = top ? top.key : null;
    let slide = slides.find((s) => s.key === this._slideKey) || null;
    const fresh = before && this._painted ? slides.find((s) => s.kind !== "info" && !before.has(s.key)) : null;
    if (fresh) {
      slide = fresh;
      this._stopped = false;
      setText(this._dom.say, [fresh.title, fresh.message].filter(Boolean).join(". "));
    } else if (!slide || topMoved || !(this._turns() || this._stopped)) {
      slide = top;
    }
    const key = slide ? slide.key : null;
    const moved = key !== this._slideKey;
    this._slideKey = key;
    return { slide, moved };
  }

  /* The entry on show, unless it is an info. */
  _headItem() {
    const s = this._headSlide;
    return s && s.kind !== "info" ? s : null;
  }

  /* A turn moves only the text, and fades the icon out and in again. The card keeps its size. A turn that
   * is under way paints whatever is current once its text is out of sight. */
  _paintHead(slide, now, motion) {
    this._headSlide = slide;
    if (this._swapping) return;
    if (!motion || !this._animOK() || !this._dom.slide.animate) {
      this._dom.slide.style.transform = this._dom.slide.style.opacity = "";
      this._fillHead(slide, now);
      return;
    }
    const d = this._dom;
    const side = motion.side || this._config.slide === "side";
    const sign = (motion.dir < 0 ? -1 : 1) * (side && this._rtl() ? -1 : 1);
    const move = (k) => (side ? "translateX(" + k * 24 + "px)" : "translateY(" + k * 14 + "px)");
    const ms = tokenMs(this, "--ha-animation-duration-slow", 350) * 1.6;
    const from = { transform: d.slide.style.transform || "none", opacity: d.slide.style.opacity || "1" };
    d.slide.style.transform = d.slide.style.opacity = "";
    for (const a of [...d.slide.getAnimations(), ...d.glyph.getAnimations()]) a.cancel();
    d.texts.classList.remove("up", "side");
    d.texts.classList.add(side ? "side" : "up");
    const away = { duration: ms * 0.4, easing: EASE_FADE_OUT, fill: "forwards" };
    const out = d.slide.animate([from, { transform: move(-sign), opacity: 0 }], away);
    const iconOut = d.glyph.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.6)" }], away);
    this._swapping = out;
    out.onfinish = () => {
      if (this._swapping !== out) return;
      this._swapping = null;
      this._fillHead(this._headSlide, Date.now());
      const back = { duration: ms * 0.6, easing: EASE_FADE_IN };
      const into = d.slide.animate([{ transform: move(sign), opacity: 0 }, { transform: "none", opacity: 1 }], back);
      d.glyph.animate([{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "none" }], back);
      out.cancel();
      iconOut.cancel();
      into.onfinish = () => d.texts.classList.remove("up", "side");
    };
  }

  _fillHead(slide, now) {
    const d = this._dom;
    const info = Boolean(slide && slide.kind === "info");
    d.card.style.setProperty("--tile-color", slide ? itemColor(slide) : "var(--state-inactive-color)");
    d.card.classList.toggle("crit", Boolean(slide && slide.sev === "crit"));
    setIcon(d.glyph, slide || { icon: "mdi:bell-outline" }, this._hass);
    d.tile.className = "tile" + (slide ? sevClass(slide.sev) : " idle");
    setText(d.title, slide ? slide.title : this._t.idle_title);
    const live = Boolean(slide && !info && headTime(slide));
    d.msg.hidden = live;
    d.eta.hidden = !live;
    setText(d.eta, live ? this._timeText(slide, now) : "");
    let sd = d.msg.querySelector("state-display");
    if (info && slide.text == null && customElements.get("state-display")) {
      if (!sd) {
        sd = document.createElement("state-display");
        d.msg.append(sd);
      }
      Object.assign(sd, { hass: this._hass, stateObj: slide.stateObj, content: slide.content, timeFormat: slide.timeFormat, name: slide.title });
      sd.hidden = false;
      d.t.hidden = true;
      setText(d.t, "");
    } else {
      if (sd) sd.hidden = true;
      d.t.hidden = false;
      setText(d.t, info ? (slide.text != null ? slide.text : this._infoText(slide)) : slide ? slide.message || "" : this._t.idle_msg);
    }
    d.head.classList.toggle("single", Boolean(slide) && !info && !slide.message && !live);
    setImage(d.glyph, slide ? slide.image : null);
    this._setBackdrop(slide && slide.backdrop ? slide.image : null);
  }

  /* What an info says where Home Assistant's state text is missing. Like it, the state fills in for parts that
   * have nothing to say. */
  _infoText(slide) {
    const h = this._hass;
    const st = slide.stateObj;
    const state = () => (h && h.formatEntityState ? h.formatEntityState(st) : String(st.state));
    const text = [].concat(slide.content == null ? "state" : slide.content)
      .map((c) => {
        if (c === "state") return state();
        if (c === "name") return slide.title;
        const ts = st[String(c).replace("-", "_")];
        if (/^last[_-](changed|updated)$/.test(c)) return this._relTime(parseTs(ts, Date.now()));
        if (!(c in st.attributes) || st.attributes[c] == null) return "";
        return h && h.formatEntityAttributeValue ? h.formatEntityAttributeValue(st, c) : String(st.attributes[c]);
      })
      .filter(Boolean)
      .join(" · ");
    return text || state();
  }

  _rtl() {
    return getComputedStyle(this).direction === "rtl";
  }

  /* One timer turns the card while it shows more than one entry. Pointer, focus, an open list, a swipe or the
   * card being out of sight stop it. */
  _rotate(restart = false) {
    const go =
      this._turns() > 0 && Boolean(this._dom) && this._slides.length > 1 && !this._expanded && !this._stopped && !this._held.size &&
      this.isConnected && this._visible && !document.hidden && !this._hiding();
    /* Home Assistant sends new states all the time. They must not push the next turn back. */
    if (go && this._rotateTimer && !restart) return;
    clearTimeout(this._rotateTimer);
    this._rotateTimer = null;
    if (!go) return;
    this._rotateTimer = setTimeout(() => {
      this._rotateTimer = null;
      this._step(1, "auto");
    }, this._turns() * 1000);
  }

  /* Seconds between turns, or 0 when the card holds still. */
  _turns() {
    const r = this._config && this._config.rotate;
    const seconds = r == null ? DEFAULTS.rotate : Number(r);
    return seconds > 0 ? seconds : 0;
  }

  _step(dir, how) {
    const slides = this._slides;
    if (slides.length < 2) return;
    if (how !== "auto") this._stopped = true;
    const i = Math.max(0, slides.findIndex((s) => s.key === this._slideKey));
    const next = slides[(i + dir + slides.length) % slides.length];
    this._slideKey = next.key;
    this._paintHead(next, Date.now(), { dir, side: how === "swipe" });
    this._tick();
    this._rotate(true);
  }

  _hold(reason, on) {
    if (on === this._held.has(reason)) return;
    if (on) this._held.add(reason);
    else this._held.delete(reason);
    this._rotate(true);
  }

  /* A press can become a hold, a horizontal drag turns the card. */
  _onPress(e) {
    if (e.button > 0 || !e.isPrimary) return;
    this._noClick = this._swiped = false;
    this._hold("press", true);
    const slide = this._headSlide;
    const p = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, dx: 0, drag: false };
    if (slide && slide.kind === "info" && hasAction(slide.info.hold_action)) {
      p.timer = setTimeout(() => {
        p.timer = null;
        this._noClick = true;
        this._infoAction(slide, "hold");
      }, HOLD_MS);
    }
    this._press = p;
  }

  _onDrag(e) {
    const p = this._press;
    if (!p || e.pointerId !== p.id) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (!p.drag) {
      if (Math.hypot(dx, dy) > 10) clearTimeout(p.timer);
      if (this._slides.length < 2 || this._expanded || Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      p.drag = true;
      this._swiped = true;
      try {
        this._dom.head.setPointerCapture(p.id);
      } catch (err) {
        /* the pointer is gone */
      }
      this._endRipple(e);
    }
    p.dx = dx;
    if (this._swapping) return;
    this._dom.slide.style.transform = "translateX(" + dx * 0.6 + "px)";
    this._dom.slide.style.opacity = String(Math.max(0.2, 1 - Math.abs(dx) / 160));
  }

  /* A swipe ends the press on Home Assistant's ripple, as scrolling the page does. */
  _endRipple(e) {
    if (!this._dom.head.querySelector("ha-ripple")) return;
    this._ownCancel = new PointerEvent("pointercancel", { pointerId: e.pointerId, pointerType: e.pointerType, isPrimary: true, buttons: e.buttons });
    this._dom.head.dispatchEvent(this._ownCancel);
  }

  _onRelease(e, cancelled) {
    const p = this._press;
    if (!p || e.pointerId !== p.id) return;
    this._press = null;
    clearTimeout(p.timer);
    this._hold("press", false);
    if (!p.drag) return;
    const fast = Math.abs(p.dx) / Math.max(e.timeStamp - p.t, 1) > 0.5;
    if (!cancelled && (Math.abs(p.dx) > 48 || fast)) {
      this._step((p.dx < 0) !== this._rtl() ? 1 : -1, "swipe");
      return;
    }
    const s = this._dom.slide;
    const from = { transform: s.style.transform || "none", opacity: s.style.opacity || "1" };
    s.style.transform = s.style.opacity = "";
    if (s.animate && this._animOK()) s.animate([from, { transform: "none", opacity: 1 }], { duration: SIZE_MS, easing: EASE_STANDARD });
  }

  /* A tap opens the list, or does what the info on show is set to do. */
  _activate() {
    const slide = this._headSlide;
    if (slide && slide.kind === "info") {
      const info = slide.info;
      if (!hasAction(info.double_tap_action)) {
        this._infoAction(slide, "tap");
      } else if (this._tapWait) {
        clearTimeout(this._tapWait);
        this._tapWait = null;
        this._infoAction(slide, "double_tap");
      } else {
        this._tapWait = setTimeout(() => {
          this._tapWait = null;
          this._infoAction(slide, "tap");
        }, DOUBLE_TAP_MS);
      }
      return;
    }
    this._toggle();
  }

  /* Home Assistant runs the action as for its own cards. Without a tap action it opens the entity. */
  _infoAction(slide, action) {
    const info = slide.info;
    const config = { entity: slide.entity, tap_action: info.tap_action || { action: "more-info" } };
    if (info.hold_action) config.hold_action = info.hold_action;
    if (info.double_tap_action) config.double_tap_action = info.double_tap_action;
    if (action !== "tap" || hasAction(config.tap_action)) fire(this, "hass-action", { config, action });
  }

  _infoActs(slide) {
    const info = slide.info;
    return !info.tap_action || hasAction(info.tap_action) || hasAction(info.hold_action) || hasAction(info.double_tap_action);
  }

  _renderDrawer(animate, now = Date.now()) {
    const d = this._dom;
    const items = this._items;
    animate = animate && this._animOK();
    if (items.length) {
      setText(d.count, fill(items.length === 1 ? this._t.count_one : this._t.count_other, { n: items.length }));
    }
    this._rowCache = this._renderList(items, animate, now);
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
  _renderList(items, animate, now, list = this._dom.list, cache = this._rowCache, root = this.shadowRoot) {
    const active = root.activeElement;
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
        el.style.setProperty("--tile-color", itemColor(it));
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
    const kept = new Set(els);
    const gone = new Set(old.filter((el) => !kept.has(el) && !replaced.has(el)));
    /* A button can end its own row, like Cancel on a timer. Focus then goes where it goes after a dismissal. */
    const keys = [...cache.keys()];
    const lost = active ? keys.findIndex((key) => !next.has(key) && cache.get(key).el.contains(active)) : -1;
    const focus = () => {
      const target = refocus && refocus[0].querySelectorAll(refocus[1])[refocus[2]];
      if (target) target.focus({ preventScroll: true });
      else if (lost >= 0) this._focusAfter(lost, root, next);
    };
    if (!animate) {
      for (const el of old) stopMotion(el);
      list.replaceChildren(...els);
      focus();
      return next;
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
    return next;
  }

  _row(it, now) {
    const row = document.createElement("div");
    row.className = "row" + sevClass(it.sev);
    row.dataset.kind = it.kind;
    row.style.setProperty("--tile-color", itemColor(it));
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
        if (e.detail === 0) this._focusAfter(index, row.getRootNode());
      });
      meta.append(x);
    }
    const body = document.createElement("div");
    body.className = "body";
    body.textContent = it.message;
    /* Without a message the time takes its place, like on the repairs page of Home Assistant. */
    if (!it.message && Number.isFinite(it.ts)) body.append(when);
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

  getCardSize() {
    return this._expanded ? 1 + this._items.length : 1;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }
}

const DIALOG = CARD + "-dialog";

const DIALOG_STYLES = `
  ha-adaptive-dialog { --dialog-content-padding: 0; }
  .list { padding: 0 12px 12px; }
`;

/* Home Assistant creates this element once, next to its own dialogs, and calls showDialog for every open. It
 * shows the rows of the card that opened it. A new ha-adaptive-dialog each time picks dialog or bottom sheet anew. */
class OrigamiNotificationsDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._style = document.createElement("style");
    this.shadowRoot.append(this._style);
  }

  set hass(hass) {
    this._hass = hass;
    if (this._dialog) this._dialog.hass = hass;
  }

  showDialog({ card }) {
    if (this._card && this._card !== card) this._card._dialogEl = null;
    this._card = card;
    card._dialogEl = this;
    if (this._dialog) {
      this.update();
      return;
    }
    this._style.textContent = STYLES + DIALOG_STYLES + (card._config.css || "");
    const dialog = document.createElement("ha-adaptive-dialog");
    /* 2026.4 reads hass for its close button. Later versions ignore it. */
    dialog.hass = this._hass || card._hass;
    dialog.setAttribute("flexcontent", "");
    dialog.addEventListener("opened", (e) => {
      if (e.target === dialog) this._shown = true;
    });
    dialog.addEventListener("closed", (e) => {
      if (e.target === dialog) this._closed(dialog);
    });
    const clear = document.createElement("ha-icon-button");
    clear.slot = "headerActionItems";
    const icon = document.createElement("ha-icon");
    icon.icon = "mdi:notification-clear-all";
    clear.append(icon);
    clear.addEventListener("click", () => {
      if (this._card) this._card._clearAll();
    });
    this._list = document.createElement("div");
    this._list.className = "list";
    this._list.setAttribute("role", "list");
    this._cache = new Map();
    dialog.append(clear, this._list);
    Object.assign(this, { _dialog: dialog, _clear: clear, _shown: false });
    this.update();
    this.shadowRoot.append(dialog);
    dialog.open = true;
  }

  /* The card calls this whenever its entries change. With nothing left, the dialog closes. */
  update() {
    const card = this._card;
    if (!card || !this._dialog) return;
    const items = card._hiding() ? [] : card._items;
    if (!items.length) {
      this.closeDialog();
      return;
    }
    this._dialog.setAttribute("header-title", fill(items.length === 1 ? card._t.count_one : card._t.count_other, { n: items.length }));
    this._clear.label = card._t.clear;
    this._clear.hidden = !(items.length > 1 && items.some((it) => it.dismiss));
    this._cache = card._renderList(items, this._shown && card._animOK(), Date.now(), this._list, this._cache, this.shadowRoot);
  }

  /* Home Assistant calls this on back and before it navigates. Closing before the dialog showed skips its animation. */
  closeDialog() {
    if (this._dialog && this._shown) this._dialog.open = false;
    else if (this._dialog) this._closed(this._dialog);
    return true;
  }

  _closed(dialog) {
    if (dialog !== this._dialog) return;
    dialog.remove();
    if (this._card && this._card._dialogEl === this) this._card._dialogEl = null;
    Object.assign(this, { _dialog: null, _list: null, _cache: null, _card: null });
    this.dispatchEvent(new CustomEvent("dialog-closed", { bubbles: true, composed: true, detail: { dialog: this.localName } }));
  }
}

/* An info is edited like a tile, so its fields take Home Assistant's own labels in every language. */
const HA_TILE_LABELS = {
  name: "ui.panel.lovelace.editor.card.generic.name",
  icon: "ui.panel.lovelace.editor.card.generic.icon",
  color: "ui.panel.lovelace.editor.card.tile.color",
  state_content: "ui.panel.lovelace.editor.card.tile.state_content",
  time_format: "ui.panel.lovelace.editor.card.generic.time_format",
  show_entity_picture: "ui.panel.lovelace.editor.card.tile.show_entity_picture",
  tap_action: "ui.panel.lovelace.editor.card.generic.tap_action",
  hold_action: "ui.panel.lovelace.editor.card.generic.hold_action",
  double_tap_action: "ui.panel.lovelace.editor.card.generic.double_tap_action",
  visibility: "ui.panel.lovelace.editor.card.heading.entity_config.visibility",
  visibility_intro: "ui.panel.lovelace.editor.card.heading.entity_config.visibility_explanation",
  forecast_type: "ui.panel.lovelace.editor.card.weather-forecast.forecast_type",
  forecast_slots: "ui.panel.lovelace.editor.card.weather-forecast.forecast_slots",
  daily: "ui.panel.lovelace.editor.card.weather-forecast.daily",
  hourly: "ui.panel.lovelace.editor.card.weather-forecast.hourly",
  twice_daily: "ui.panel.lovelace.editor.card.weather-forecast.twice_daily",
};

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
    weather: "Weather",
    updates: "Pending updates",
    repairs: "Repairs",
    hide_when_empty: "Hide when there is nothing to show",
    infos: "Infos",
    info_options: "Info options",
    rotate: "Seconds between turns",
    slide: "Turn",
    slide_up: "Upwards",
    slide_side: "Sideways",
    color: "Color",
    state_content: "State content",
    time_format: "Time format",
    show_entity_picture: "Show entity picture",
    hold_action: "Hold behavior",
    double_tap_action: "Double tap behavior",
    visibility: "Visibility",
    forecast_type: "Forecast",
    forecast_none: "Current weather",
    forecast_slots: "Forecasts to show",
    daily: "Daily",
    hourly: "Hourly",
    twice_daily: "Twice daily",
    options: "Entity options",
    type: "Kind",
    attribute: "Attribute",
    name: "Name",
    icon: "Icon",
    image: "Picture",
    background: "Picture as card background",
    before: "Show ahead of time",
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
    weather: "Wetter",
    updates: "Ausstehende Updates",
    repairs: "Reparaturen",
    hide_when_empty: "Ausblenden, wenn nichts anliegt",
    infos: "Infos",
    info_options: "Optionen je Info",
    rotate: "Sekunden bis zum Wechsel",
    slide: "Wechsel",
    slide_up: "Nach oben",
    slide_side: "Seitlich",
    color: "Farbe",
    state_content: "Zustandsinhalt",
    time_format: "Zeitformat",
    show_entity_picture: "Entitätsbild anzeigen",
    hold_action: "Verhalten beim Halten",
    double_tap_action: "Verhalten beim Doppeltippen",
    visibility: "Sichtbarkeit",
    forecast_type: "Vorhersage",
    forecast_none: "Aktuelles Wetter",
    forecast_slots: "Anzahl der Vorhersagen",
    daily: "Täglich",
    hourly: "Stündlich",
    twice_daily: "Zweimal täglich",
    options: "Optionen je Entität",
    type: "Art",
    attribute: "Attribut",
    name: "Name",
    icon: "Symbol",
    image: "Bild",
    background: "Bild als Kartenhintergrund",
    before: "Im Voraus zeigen",
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
    weather: "Shows rain, snow and frost ahead.",
    visible: "Applies outside edit mode, like Home Assistant's own card visibility.",
    people: "Matches the user account linked to each person in Settings → People.",
    attribute: "An attribute that holds an object with a name or title, or a plain value. If empty, the card looks for an object with a description or a picture.",
    attribute_picture: "An attribute that holds an object with a name or title. The object is shown instead of the state.",
    image: "An attribute, a path into one like book.cover, or a URL. If empty, the card uses the picture of the shown object or of the entity.",
    background: "Blurred behind the card while this entity is on top.",
    before: "How long before it starts or is due.",
    infos: "Shown in turn while nothing needs attention.",
    rotate: "At 0 the card holds still.",
    visibility_intro: "The info shows while all of these conditions hold.",
  },
  de: {
    label: "Jede Entität mit diesem Label kommt dazu und wird automatisch erkannt.",
    weather: "Zeigt Regen, Schnee und Frost im Voraus.",
    visible: "Gilt außerhalb des Bearbeitungsmodus, wie die Sichtbarkeit von Home Assistant selbst.",
    people: "Verglichen wird das Benutzerkonto, das unter Einstellungen → Personen verknüpft ist.",
    attribute: "Ein Attribut, das ein Objekt mit name oder title enthält, oder ein einfacher Wert. Bleibt es leer, sucht die Karte ein Objekt mit description oder Bild.",
    attribute_picture: "Ein Attribut, das ein Objekt mit name oder title enthält. Das Objekt erscheint statt des Zustands.",
    image: "Ein Attribut, ein Pfad darin wie book.cover, oder eine URL. Bleibt es leer, nimmt die Karte das Bild des gezeigten Objekts oder der Entität.",
    background: "Unscharf hinter der Karte, solange diese Entität oben steht.",
    before: "Wie lange vor dem Beginn oder der Fälligkeit.",
    infos: "Erscheinen im Wechsel, solange nichts anliegt.",
    rotate: "Bei 0 bleibt die Karte stehen.",
    visibility_intro: "Die Info erscheint, solange alle diese Bedingungen erfüllt sind.",
  },
};

const TYPES = ["auto", ...Object.keys(RENDERERS)];

/* The kinds that read an attribute, so only they show the field. */
const USES_ATTRIBUTE = ["auto", "attribute", "picture", "recipe"];
const USES_BEFORE = ["calendar", "todo"];

/* Home Assistant's duration field reads only parts. A bare number there would count as seconds. */
const durationParts = (ms) => ({
  days: Math.floor(ms / DAY_MS),
  hours: Math.floor((ms % DAY_MS) / 3600000),
  minutes: Math.floor((ms % 3600000) / MINUTE_MS),
  seconds: (ms % MINUTE_MS) / 1000,
});

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
    if (c.weather) sources.push({ key: c.weather, name: this._name(c.weather), icon: ICONS.weather });
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
      { name: "weather", selector: { entity: { filter: { domain: "weather" } } } },
      { name: "infos", selector: { entity: { multiple: true, reorder: true } } },
      {
        name: "",
        type: "grid",
        schema: [
          { name: "updates", selector: { boolean: {} } },
          { name: "repairs", selector: { boolean: {} } },
        ],
      },
      { name: "hide_when_empty", selector: { boolean: {} } },
      {
        name: "",
        type: "grid",
        schema: [
          { name: "rotate", selector: { number: { min: 0, max: 60, step: 1, mode: "box", unit_of_measurement: "s" } } },
          {
            name: "slide",
            selector: { select: { mode: "dropdown", options: ["up", "side"].map((value) => ({ value, label: this._label("slide_" + value) })) } },
          },
        ],
      },
      ...(entries.length
        ? [
            {
              name: "options",
              type: "expandable",
              title: this._label("options"),
              icon: "mdi:tune-variant",
              schema: entries.map((e) => {
                const kind = this._typeOf(e);
                const icon = typeIcon(kind);
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
                    ...(USES_BEFORE.includes(kind) ? [{ name: "before", selector: { duration: { enable_day: true } } }] : []),
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
    data.infos = this._infos().map((info) => info.entity);
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
          before: e.before == null ? undefined : durationParts(parseBefore(e.before)),
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
        /* An unchanged duration keeps the way it was written. */
        if (key === "before" && parseBefore(v) === parseBefore(base.before)) continue;
        if (isEmpty(v) || (key === "type" && v === "auto") || (key === "before" && !parseBefore(v))) delete merged[key];
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
    if (Array.isArray(value.infos)) value.infos = this._mergeInfos(value.infos);
    const audience = { ...(this._config.audience || {}) };
    for (const [key, v] of Object.entries(value.audience || {})) {
      if (v && (v.visible === "only" || v.visible === "except")) {
        audience[key] = { [v.visible]: v.people || [] };
      } else {
        delete audience[key];
      }
    }
    for (const [from, to] of [this._swapped || [], [this._config.weather, value.weather]]) {
      if (from && to && audience[from] && !audience[to]) audience[to] = audience[from];
    }
    /* A rule goes when its source leaves the list, since the editor could no longer show it.
     * Rules for updates stay, because the card applies them to the updates it finds as well. */
    const after = new Set(this._sources({ ...this._config, ...value }).map((s) => s.key));
    const kept = (key) => after.has(key) || key === "updates" || key.startsWith("update.");
    for (const key of before) if (!kept(key)) delete audience[key];
    value.audience = Object.keys(audience).length ? audience : null;
    this._write(value);
  }

  /* Only what differs from the defaults is written, in a fixed order. */
  _write(value) {
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
    this._fire(config);
  }

  _fire(config) {
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

  _infos(c = this._config) {
    return (c.infos || []).map((info) => (typeof info === "string" ? { entity: info } : { ...info }));
  }

  /* Picked infos keep their options, also when the picker swaps or moves them. */
  _mergeInfos(ids) {
    const prev = this._infos();
    const used = new Set();
    const take = (i) => i >= 0 && !used.has(i) && used.add(i) && prev[i];
    return ids.map((id, i) => {
      const base = take(prev.findIndex((info, j) => info.entity === id && !used.has(j))) ||
        (prev.length === ids.length && !ids.includes(prev[i].entity) && take(i)) || {};
      return this._infoEntry({ ...base, entity: id });
    });
  }

  /* An info without options is written as its entity alone. */
  _infoEntry(info) {
    const out = {};
    for (const key of [...INFO_KEY_ORDER, ...Object.keys(info)]) {
      if (key in out || !(key in info) || isEmpty(info[key])) continue;
      if (key === "color" && info[key] === "state") continue;
      out[key] = info[key];
    }
    return Object.keys(out).length === 1 ? out.entity : out;
  }

  _tileLabel(key) {
    const h = this._hass;
    const borrowed = HA_TILE_LABELS[key] && h && h.localize ? h.localize(HA_TILE_LABELS[key]) : "";
    return borrowed || this._label(key);
  }

  /* The forecast types a weather info can show, like in Home Assistant's forecast card editor. */
  _forecastTypes(info) {
    const st = this._hass && this._hass.states[info.entity];
    if (!info.entity.startsWith("weather.")) return [];
    return FORECAST_TYPES.filter((type) => forecastSupported(st, type) || info.forecast_type === type);
  }

  /* The fields of a tile card. The time format shows only where the content holds a time. */
  _infoSchema(info) {
    const st = this._hass && this._hass.states[info.entity];
    const domain = info.entity.split(".")[0];
    const timed = [].concat(info.state_content == null ? "state" : info.state_content).some(
      (c) =>
        /^last[_-](changed|updated|triggered)$/.test(c) ||
        (domain === "sun" && /^next_/.test(c)) ||
        (domain === "calendar" && /_time$/.test(c)) ||
        (c === "state" && Boolean(st) && (st.attributes.device_class === "timestamp" || TIME_STATE_DOMAINS.has(domain)))
    );
    const actions = { entity_id: "entity" };
    const forecasts = this._forecastTypes(info);
    const state = [
      { name: "state_content", selector: { ui_state_content: {} }, context: { filter_entity: "entity" } },
      ...(timed ? [{ name: "time_format", selector: { ui_time_format: {} } }] : []),
    ];
    const forecast = [
      {
        name: "forecast_type",
        selector: {
          select: {
            mode: "dropdown",
            options: [{ value: "", label: this._label("forecast_none") }, ...forecasts.map((value) => ({ value, label: this._tileLabel(value) }))],
          },
        },
      },
      ...(info.forecast_type ? [{ name: "forecast_slots", selector: { number: { min: 1, max: 12, mode: "box" } } }] : state),
    ];
    return [
      { name: "name", selector: { entity_name: {} }, context: { entity: "entity" } },
      {
        name: "",
        type: "grid",
        schema: [
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
          { name: "color", selector: { ui_color: { default_color: "state", include_state: true } } },
        ],
      },
      ...(forecasts.length ? forecast : state),
      { name: "show_entity_picture", selector: { boolean: {} } },
      { name: "tap_action", selector: { ui_action: { default_action: "more-info" } }, context: actions },
      {
        name: "",
        type: "optional_actions",
        flatten: true,
        schema: ["hold_action", "double_tap_action"].map((name) => ({ name, selector: { ui_action: { default_action: "none" } }, context: actions })),
      },
    ];
  }

  /* Each info gets the fields of a tile and Home Assistant's own editor for visibility conditions, which no
   * form field offers. */
  _renderInfos() {
    const infos = this._infos();
    if (!this._infoBox) {
      this._infoBox = document.createElement("div");
      this._infoBox.style.marginTop = "24px";
      this.appendChild(this._infoBox);
    }
    const box = this._infoBox;
    box.hidden = !infos.length;
    if (!infos.length) {
      box.replaceChildren();
      this._infoPanel = null;
      return;
    }
    if (!this._infoPanel || !box.contains(this._infoPanel)) {
      this._infoPanel = panelOf("mdi:information-outline");
      box.replaceChildren(this._infoPanel);
    }
    this._infoPanel.header = this._label("info_options");
    const body = this._infoPanel.querySelector(".content");
    while (body.children.length > infos.length) body.lastElementChild.remove();
    infos.forEach((info, i) => {
      const item = body.children[i] || this._infoItem();
      this._fillInfo(item, info, i);
      if (!item.parentNode) body.append(item);
    });
  }

  _infoItem() {
    const item = panelOf("mdi:information-outline");
    const form = document.createElement("ha-form");
    form.addEventListener("value-changed", (e) => this._onInfo(e, item._index, e.detail.value));
    const vis = panelOf("mdi:eye");
    const intro = document.createElement("p");
    intro.style.cssText = "margin: 0 0 12px; color: var(--secondary-text-color);";
    const conditions = document.createElement("ha-card-conditions-editor");
    conditions.conditions = [];
    conditions.addEventListener("value-changed", (e) => {
      const list = Array.isArray(e.detail.value) ? e.detail.value : [];
      this._onInfo(e, item._index, { visibility: list.length ? list : undefined });
    });
    vis.querySelector(".content").append(intro, conditions);
    item.querySelector(".content").append(form, vis);
    Object.assign(item, { _form: form, _vis: vis, _intro: intro, _conditions: conditions });
    return item;
  }

  _fillInfo(item, info, i) {
    item._index = i;
    const st = this._hass && this._hass.states[info.entity];
    item.header = typeof info.name === "string" && info.name ? info.name : this._name(info.entity);
    item.secondary = info.forecast_type && this._forecastTypes(info).length ? this._tileLabel(info.forecast_type) : "";
    /* Like the row editors of Home Assistant, the panel shows the state icon of its entity. */
    let lead = item.querySelector(":scope > [slot=leading-icon]");
    if (st && customElements.get("ha-state-icon") && lead.localName !== "ha-state-icon") {
      const icon = document.createElement("ha-state-icon");
      icon.slot = "leading-icon";
      lead.replaceWith(icon);
      lead = icon;
    }
    if (lead.localName === "ha-state-icon") Object.assign(lead, { hass: this._hass, stateObj: st, icon: info.icon || (st ? undefined : ICONS.generic) });
    else lead.icon = info.icon || (st && st.attributes.icon) || ICONS.generic;
    const form = item._form;
    form.hass = this._hass;
    form.computeLabel = (s) => this._tileLabel(s.name);
    form.computeHelper = () => undefined;
    const schema = this._infoSchema(info);
    const schemaKey = JSON.stringify(schema);
    if (schemaKey !== item._schemaKey) {
      item._schemaKey = schemaKey;
      form.schema = schema;
    }
    /* The current weather is the empty choice of the forecast field. */
    const data = this._forecastTypes(info).length ? { ...info, forecast_type: info.forecast_type || "" } : info;
    const dataKey = JSON.stringify(data);
    if (dataKey !== item._dataKey) {
      item._dataKey = dataKey;
      form.data = data;
    }
    item._vis.header = this._tileLabel("visibility");
    const h = this._hass;
    const own = (EDITOR_HELPERS[this._lang()] || {}).visibility_intro;
    item._intro.textContent = own || (h && h.localize && h.localize(HA_TILE_LABELS.visibility_intro)) || EDITOR_HELPERS.en.visibility_intro;
    item._conditions.hass = this._hass;
    const conditions = Array.isArray(info.visibility) ? info.visibility : [];
    if (JSON.stringify(conditions) !== JSON.stringify(item._conditions.conditions || [])) item._conditions.conditions = conditions;
  }

  _onInfo(e, index, value) {
    e.stopPropagation();
    const infos = this._infos();
    if (!infos[index]) return;
    infos[index] = { ...infos[index], ...value, entity: infos[index].entity };
    if (!infos[index].forecast_type) delete infos[index].forecast_slots;
    this._write({ infos: infos.map((info) => this._infoEntry(info)) });
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
    this._renderInfos();
  }
}

/* An outlined panel like the ones ha-form draws, with an icon and room for content. */
const panelOf = (icon) => {
  const panel = document.createElement("ha-expansion-panel");
  panel.outlined = true;
  const lead = document.createElement("ha-icon");
  lead.slot = "leading-icon";
  lead.icon = icon;
  const content = document.createElement("div");
  content.className = "content";
  content.style.cssText = "display: flex; flex-direction: column; gap: 12px; padding: 12px;";
  panel.append(lead, content);
  return panel;
};

/* The file may be loaded twice, e.g. by HACS and a manual resource. */
if (!customElements.get(CARD)) {
  customElements.define(CARD, OrigamiNotificationsCard);
  console.info("%c Origami Notifications %c v" + VERSION + " ", "font-weight:bold", "opacity:0.7");
}
if (!customElements.get(EDITOR)) customElements.define(EDITOR, OrigamiNotificationsEditor);
if (!customElements.get(DIALOG)) customElements.define(DIALOG, OrigamiNotificationsDialog);
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
    stateColor,
    alikeTitle,
    firstPicture,
    forecastType,
    isWet,
    wetKind,
  });
}
