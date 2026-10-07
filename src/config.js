import { DAY, HOUR, MINUTE } from "./format.js";

export const CARD = "origami-notifications";

export const KINDS = ["calendar", "update", "alarm", "alert", "timer", "countdown", "event", "todo", "device", "warning", "attribute", "picture", "generic"];

export const FORECAST_TYPES = ["daily", "hourly", "twice_daily"];

export const DEFAULTS = { updates: true, repairs: true, hide_when_empty: true, vertical: false, rotate: 8, slide: "up" };

export const isObject = (v) => v != null && typeof v === "object" && !Array.isArray(v);

export const isEntityId = (v) => typeof v === "string" && /^\w+\.\w+$/.test(v);

const BEFORE_UNITS = { days: DAY, hours: HOUR, minutes: MINUTE, seconds: 1000 };

// A bare number counts as minutes.
export function parseBefore(value) {
  let ms = NaN;
  if (typeof value === "number") ms = value * MINUTE;
  else if (typeof value === "string") {
    const m = /^(\d+):(\d+)(?::(\d+(?:\.\d+)?))?$/.exec(value.trim());
    if (m) ms = m[1] * HOUR + m[2] * MINUTE + (m[3] || 0) * 1000;
  } else if (isObject(value) && Object.keys(value).length && Object.keys(value).every((k) => k in BEFORE_UNITS)) {
    ms = Object.entries(value).reduce((sum, [k, v]) => sum + Number(v) * BEFORE_UNITS[k], 0);
  }
  return ms >= 0 && Number.isFinite(ms) ? ms : NaN;
}

const fail = (message) => {
  throw new Error(`${CARD}: ${message}`);
};

const check = (ok, message) => ok || fail(message);

const optional = (value, test) => value == null || test(value);

const isAction = (v) => optional(v, isObject);

function parseEntity(entry) {
  const src = typeof entry === "string" ? { entity: entry } : isObject(entry) ? { ...entry } : null;
  check(src && isEntityId(src.entity), "entities must contain entity ids, got " + JSON.stringify(entry));
  check(optional(src.type, (t) => KINDS.includes(t)), `unknown type '${src.type}'`);
  check(optional(src.attribute, (a) => typeof a === "string"), "attribute must be the name of an attribute");
  check(optional(src.image, (i) => typeof i === "string"), "image must be an attribute path or URL");
  check(optional(src.background, (b) => typeof b === "boolean"), "background must be true or false");
  check(optional(src.before, (b) => parseBefore(b) >= 0), "before must be minutes or a duration like 1:30:00");
  check(isAction(src.tap_action), "tap_action must be an action");
  check(optional(src.actions, (a) => Array.isArray(a) && a.every((ac) => isObject(ac) && typeof ac.label === "string" && isObject(ac.tap_action))), "actions must be a list of buttons with a label and a tap_action");
  return { ...src, lead: src.before == null ? undefined : parseBefore(src.before) };
}

function parseInfo(entry) {
  const info = typeof entry === "string" ? { entity: entry } : isObject(entry) ? { ...entry } : null;
  check(info && isEntityId(info.entity), "infos must contain entity ids, got " + JSON.stringify(entry));
  check(optional(info.visibility, Array.isArray), `visibility of ${info.entity} must be a list of conditions`);
  check(optional(info.forecast_type, (t) => FORECAST_TYPES.includes(t)), "forecast_type must be daily, hourly or twice_daily");
  for (const key of ["show_current", "show_forecast", "show_entity_picture"]) {
    check(optional(info[key], (v) => typeof v === "boolean"), key + " must be true or false");
  }
  check(optional(info.forecast_slots, (n) => Number.isInteger(n) && n > 0), "forecast_slots must be a whole number above 0");
  for (const key of ["tap_action", "hold_action", "double_tap_action"]) check(isAction(info[key]), key + " must be an action");
  return info;
}

function parseAudience(audience) {
  check(optional(audience, isObject), "audience must map sources to only or except");
  for (const [key, rule] of Object.entries(audience || {})) {
    const modes = isObject(rule) ? ["only", "except"].filter((m) => m in rule) : [];
    check(modes.length === 1, `audience.${key} needs either only or except`);
    const people = rule[modes[0]];
    check(Array.isArray(people) && people.every((id) => typeof id === "string" && id.startsWith("person.")), `audience.${key}.${modes[0]} must list person entities, e.g. person.anna`);
  }
  return audience || {};
}

export function parseConfig(config) {
  check(optional(config.entities, Array.isArray), "entities must be a list");
  check(optional(config.infos, Array.isArray), "infos must be a list");
  check(optional(config.weather, (w) => typeof w === "string" && w.startsWith("weather.")), "weather must be a weather entity, e.g. weather.home");
  check(optional(config.label, (l) => typeof l === "string"), "label must be a label ID");
  check(optional(config.css, (c) => typeof c === "string"), "css must be a string");
  check(optional(config.rotate, (r) => typeof r === "number" && r >= 0), "rotate must be the seconds between turns, or 0 to turn them off");
  check(optional(config.slide, (s) => s === "up" || s === "side"), "slide must be up or side");
  for (const key of ["updates", "repairs", "hide_when_empty", "vertical"]) {
    check(optional(config[key], (v) => typeof v === "boolean"), key + " must be true or false");
  }
  const entities = [];
  for (const entry of config.entities || []) {
    const src = parseEntity(entry);
    if (!entities.some((e) => e.entity === src.entity)) entities.push(src);
  }
  return {
    ...DEFAULTS,
    ...config,
    entities,
    infos: (config.infos || []).map(parseInfo),
    audience: parseAudience(config.audience),
  };
}
