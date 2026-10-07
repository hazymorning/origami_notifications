export const domainOf = (entityId) => entityId.split(".")[0];

// Copied from frontend src/common/const.ts and src/common/entity/state_active.ts.
const TIMESTAMP_DOMAINS = new Set([
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

const INACTIVE_STATES = {
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

export const isTimestampDomain = (domain) => TIMESTAMP_DOMAINS.has(domain);

export function stateActive(stateObj, state = stateObj.state) {
  const domain = domainOf(stateObj.entity_id);
  if (TIMESTAMP_DOMAINS.has(domain)) return state !== "unavailable";
  if (state === "unavailable" || state === "unknown") return false;
  if (state === "off" && domain !== "alert") return false;
  if (ACTIVE_STATES[domain]) return ACTIVE_STATES[domain].includes(state);
  return !(INACTIVE_STATES[domain] || []).includes(state);
}

// Copied from frontend src/common/entity/state_color.ts and the tile card's color.
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

const cssVar = (names) => names.reduceRight((rest, name) => `var(${name}${rest ? ", " + rest : ""})`, "");

const slug = (state) => String(state).toLowerCase().replace(/[^a-z0-9]+/g, "_");

export function domainColor(domain, deviceClass, state, active) {
  const level = active ? "active" : "inactive";
  return cssVar([
    ...(deviceClass ? [`--state-${domain}-${deviceClass}-${slug(state)}-color`] : []),
    `--state-${domain}-${slug(state)}-color`,
    `--state-${domain}-${level}-color`,
    `--state-${level}-color`,
  ]);
}

const groupDomain = (stateObj) => {
  const domains = new Set((stateObj.attributes.entity_id || []).map((id) => domainOf(String(id))));
  return domains.size === 1 ? [...domains][0] : undefined;
};

export function stateColor(stateObj) {
  const { state, attributes } = stateObj;
  if (state === "unavailable") return "var(--state-unavailable-color)";
  const domain = domainOf(stateObj.entity_id);
  const active = stateActive(stateObj);
  if (domain === "sensor" && attributes.device_class === "battery" && state !== "" && !isNaN(Number(state))) {
    const n = Number(state);
    return `var(--state-sensor-battery-${n >= 70 ? "high" : n >= 30 ? "medium" : "low"}-color)`;
  }
  const colored = domain === "group" ? groupDomain(stateObj) : domain;
  if (STATE_COLORED.has(colored) && domain !== "person" && domain !== "device_tracker") {
    return domainColor(colored, attributes.device_class, state, active);
  }
  return active ? "var(--state-icon-color)" : "var(--state-inactive-color)";
}

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

export const themeColor = (color) => (THEME_COLORS.has(color) ? `var(--${color}-color)` : color);

export const FEATURE = {
  updateInstall: 1,
  todoUpdate: 4,
  coverClose: 2,
  valveClose: 2,
  vacuumReturn: 16,
  mowerDock: 4,
  sirenOff: 2,
};

export const supports = (stateObj, feature) => (Number(stateObj.attributes.supported_features) & feature) === feature;
