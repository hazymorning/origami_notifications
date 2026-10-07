import { HOUR, fill, parseTime } from "./format.js";
import { domainColor } from "./ha.js";

const FEATURE_BITS = { daily: 1, hourly: 2, twice_daily: 4 };

export const SPAN = { hourly: HOUR, twice_daily: 12 * HOUR, daily: 24 * HOUR };

export const forecastSupported = (st, type) => Boolean(FEATURE_BITS[type] && Number(st?.attributes.supported_features) & FEATURE_BITS[type]);

// Rain ahead needs hours, so it asks for hourly, then twice daily, then daily.
export const forecastType = (st) => ["hourly", "twice_daily", "daily"].find((type) => forecastSupported(st, type)) || null;

const WET = new Set(["rainy", "pouring", "lightning", "lightning-rainy", "snowy", "snowy-rainy", "hail"]);

export const isWet = (f, unit) => WET.has(f.condition) || Number(f.precipitation) >= (unit === "in" ? 0.01 : 0.2) || Number(f.precipitation_probability) >= 60;

export function wetKind(condition, temperature, cold) {
  const c = String(condition || "");
  if (c.startsWith("lightning")) return "thunder";
  if (c === "hail") return "hail";
  return c.startsWith("snowy") || (temperature != null && temperature !== "" && Number(temperature) <= cold) ? "snow" : "rain";
}

const ICONS = { rain: "mdi:weather-rainy", snow: "mdi:weather-snowy", thunder: "mdi:weather-lightning", hail: "mdi:weather-hail", frost: "mdi:snowflake-thermometer" };

const COLOR_STATES = { rain: "rainy", snow: "snowy", thunder: "lightning", hail: "hail", frost: "snowy" };

const color = (kind) => domainColor("weather", null, COLOR_STATES[kind], true);

// Rain, snow, thunder or hail in the next 6 hours, and frost in the next 18. With a window open, wet weather is a
// warning, also while it already rains.
export function weatherEntries(st, forecast, type, ctx) {
  const id = st.entity_id;
  const a = st.attributes;
  const t = ctx.t;
  const fahrenheit = a.temperature_unit === "°F";
  const hours = type === "hourly" || type === "twice_daily" ? forecast.filter((f) => Date.parse(f.datetime) + SPAN[type] > ctx.now) : [];
  const windows = ctx.openWindows();
  const entries = [];
  const wet = (kind, title, message, ts, past) =>
    entries.push({ key: `wx:${id}:wet`, kind: "weather", entity: id, icon: ICONS[kind], color: color(kind), sev: windows ? "warn" : undefined, title, message, ts, past, once: !past, ack: kind + (windows ? " open" : "") });
  if (WET.has(st.state)) {
    const kind = wetKind(st.state, a.temperature, fahrenheit ? 34 : 1);
    if (windows) wet(kind, t[`wx_${kind}_now`], ctx.alikeTitle("window", windows), parseTime(st.last_changed, ctx.now), true);
  } else {
    const hour = hours.find((f) => Date.parse(f.datetime) < ctx.now + 6 * HOUR && isWet(f, a.precipitation_unit));
    if (hour) {
      const start = Math.max(Date.parse(hour.datetime), ctx.now);
      const kind = wetKind(hour.condition, hour.temperature, fahrenheit ? 34 : 1);
      const chance = hour.precipitation_probability == null ? NaN : Number(hour.precipitation_probability);
      const message = windows ? ctx.alikeTitle("window", windows) : Number.isFinite(chance) ? fill(t.wx_chance, { p: ctx.clock.percent(chance) }) : "";
      wet(kind, fill(t[`wx_${kind}_from`], { t: ctx.clock.hour(start) }), message, start, false);
    }
  }
  const freezing = fahrenheit ? 32 : 0;
  if (hours.length && a.temperature != null && Number(a.temperature) > freezing) {
    const ahead = hours.filter((f) => Date.parse(f.datetime) < ctx.now + 18 * HOUR && f.temperature != null && Number.isFinite(Number(f.temperature)));
    const first = ahead.find((f) => Number(f.temperature) < freezing);
    if (first) {
      const start = Math.max(Date.parse(first.datetime), ctx.now);
      const low = Math.min(...ahead.map((f) => Number(f.temperature)));
      entries.push({
        key: `wx:${id}:frost`,
        kind: "weather",
        entity: id,
        icon: ICONS.frost,
        color: color("frost"),
        title: fill(t.wx_frost_from, { t: ctx.clock.hour(start) }),
        message: fill(t.wx_low, { v: ctx.attr(st, "temperature", low) }),
        ts: start,
        once: true,
        ack: "frost",
      });
    }
  }
  if (hours.length) ctx.wake(Math.floor(ctx.now / HOUR) * HOUR + HOUR);
  return entries;
}

// Windows anywhere in Home Assistant, but no groups of them.
export const windowIds = (states) =>
  Object.keys(states).filter((id) => {
    const a = states[id]?.attributes;
    return a?.device_class === "window" && !Array.isArray(a.entity_id) && /^(binary_sensor|cover)\./.test(id);
  });

export const isOpenWindow = (st) =>
  st && (st.entity_id.startsWith("binary_sensor.") ? st.state === "on" : !["closed", "unavailable", "unknown"].includes(st.state));
