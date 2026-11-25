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

// Copied from frontend src/common/string/slugify.ts, so a theme's color for a zone like Büro has the same name here.
const SPECIAL = "àáâäæãåāăąабçćčđďдèéêëēėęěеёэфğǵгḧîïíīįìıİийкłлḿмñńǹňнôöòóœøōõőоṕпŕřрßśšşșсťțтûüùúūǘůűųувẃẍÿýыžźżз·";
const PLAIN = "aaaaaaaaaaabcccdddeeeeeeeeeeefggghiiiiiiiiijkllmmnnnnnoooooooooopprrrsssssstttuuuuuuuuuuvwxyyyzzzz_";
const CYRILLIC = { ж: "zh", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ю: "iu", я: "ia" };
const SPECIAL_CHARS = new RegExp(SPECIAL.split("").join("|"), "g");

export function slugify(value) {
  if (value === "") return "";
  const slug = String(value)
    .toLowerCase()
    .replace(SPECIAL_CHARS, (c) => PLAIN.charAt(SPECIAL.indexOf(c)))
    .replace(/[а-я]/g, (c) => CYRILLIC[c] || "")
    .replace(/(\d),(?=\d)/g, "$1")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug || "unknown";
}

export function domainColor(domain, deviceClass, state, active) {
  const level = active ? "active" : "inactive";
  return cssVar([
    ...(deviceClass ? [`--state-${domain}-${deviceClass}-${slugify(state)}-color`] : []),
    `--state-${domain}-${slugify(state)}-color`,
    `--state-${domain}-${level}-color`,
    `--state-${level}-color`,
  ]);
}

const stateColorOf = (stateObj, state = stateObj.state) => domainColor(domainOf(stateObj.entity_id), stateObj.attributes.device_class, state, stateActive(stateObj, state));

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

export const HOME_ZONE = "zone.home";

// Copied from frontend src/data/zone.ts. A tracker in a zone takes the zone's name as its state.
export const zoneState = (zone) =>
  zone.entity_id === HOME_ZONE ? "home" : zone.attributes.friendly_name === undefined ? zone.entity_id.split(".")[1].replace(/_/g, " ") : String(zone.attributes.friendly_name ?? "");

// Zone names need not be unique, so the zones a tracker reports in in_zones come first.
export function zoneOf(stateObj, states) {
  const reported = Array.isArray(stateObj.attributes.in_zones) ? stateObj.attributes.in_zones : [];
  const zones = [...reported, ...Object.keys(states).filter((id) => id.startsWith("zone."))];
  return zones.map((id) => states[id]).find((zone) => zone && zoneState(zone) === stateObj.state);
}

// Copied from frontend src/panels/lovelace/cards/tile/badges and, for pages that have not loaded
// ha-attribute-icon, from the icons.json of core's climate and humidifier.
const ACTIONS = {
  climate: {
    attribute: "hvac_action",
    modes: { cooling: "cool", defrosting: "heat", drying: "dry", fan: "fan_only", heating: "heat", idle: "off", off: "off", preheating: "heat" },
    icons: { cooling: "mdi:snowflake", defrosting: "mdi:snowflake-melt", drying: "mdi:water-percent", fan: "mdi:fan", heating: "mdi:fire", idle: "mdi:clock-outline", preheating: "mdi:heat-wave" },
  },
  humidifier: {
    attribute: "action",
    modes: { drying: "on", humidifying: "on", idle: "off", off: "off" },
    icons: { drying: "mdi:arrow-down-bold", humidifying: "mdi:arrow-up-bold", idle: "mdi:clock-outline" },
  },
};

export function tileBadge(stateObj, states) {
  const domain = domainOf(stateObj.entity_id);
  if (stateObj.state === "unknown") return null;
  if (domain === "person" || domain === "device_tracker") {
    const zone = stateObj.state === "home" || stateObj.state === "not_home" ? undefined : zoneOf(stateObj, states);
    return { icon: zone?.attributes.icon || (stateObj.state === "not_home" ? "mdi:home-export-outline" : "mdi:home"), color: stateColorOf(stateObj) };
  }
  const action = ACTIONS[domain];
  const value = action && stateObj.attributes[action.attribute];
  if (!value || value === "off") return null;
  return { attribute: action.attribute, icon: action.icons[value] || "mdi:circle-medium", color: stateColorOf(stateObj, action.modes[value]) };
}

const devices = new WeakMap();

function entitiesOf(registry, device) {
  if (!devices.has(registry)) {
    const byDevice = new Map();
    for (const [id, entry] of Object.entries(registry)) {
      if (entry?.device_id) byDevice.set(entry.device_id, [...(byDevice.get(entry.device_id) || []), id]);
    }
    devices.set(registry, byDevice);
  }
  return devices.get(registry).get(device) || [];
}

// Copied from frontend src/data/entity/entity_registry.ts, where a device page finds its battery.
const BATTERY_DOMAINS = ["sensor", "binary_sensor"];

const deviceBattery = (hass, device) =>
  entitiesOf(hass.entities, device)
    .filter((id) => hass.states[id]?.attributes.device_class === "battery" && BATTERY_DOMAINS.includes(domainOf(id)))
    .sort((a, b) => BATTERY_DOMAINS.indexOf(domainOf(a)) - BATTERY_DOMAINS.indexOf(domainOf(b)))[0];

// A person has no device of its own, so the battery comes from the first of its trackers that has one.
export function batteryOf(hass, stateObj) {
  const own = domainOf(stateObj.entity_id) === "person" ? stateObj.attributes.device_trackers : [stateObj.entity_id];
  for (const id of Array.isArray(own) ? own : []) {
    const device = hass.entities?.[id]?.device_id;
    const battery = device && deviceBattery(hass, device);
    if (battery) return battery;
  }
  return undefined;
}
