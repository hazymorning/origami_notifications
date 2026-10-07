import { fill, fromServerTime, HOUR, isoDate, parseTime, zonedParts } from "./format.js";
import { domainColor } from "./ha.js";

const FEATURE_BITS = { daily: 1, hourly: 2, twice_daily: 4 };

export const SPAN = { hourly: HOUR, twice_daily: 12 * HOUR, daily: 24 * HOUR };

export const forecastSupported = (st, type) => Boolean(FEATURE_BITS[type] && Number(st?.attributes.supported_features) & FEATURE_BITS[type]);

// Rain ahead needs hours.
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

// The parts of a day as people name them, by the hour they start.
const PARTS = [
  [5, "morning"],
  [12, "afternoon"],
  [17, "evening"],
  [22, "night"],
];

const WET_FIRST = ["lightning-rainy", "lightning", "hail", "snowy-rainy", "snowy", "pouring", "rainy"];

function mainCondition(slots, unit) {
  const wet = slots.filter((f) => isWet(f, unit));
  if (wet.length) return WET_FIRST.find((c) => wet.some((f) => f.condition === c)) || "rainy";
  const counts = new Map();
  for (const f of slots) if (f.condition) counts.set(f.condition, (counts.get(f.condition) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0];
}

// What comes next in the words people use. That is the coming part of the day and, from the evening on, tomorrow.
export function outlook(st, forecast, type, ctx) {
  const t = ctx.t;
  const zone = ctx.clock.zone;
  const today = ctx.dayOf(ctx.now);
  const at = (day, hour) => fromServerTime(`${isoDate(day)} ${String(hour).padStart(2, "0")}:00:00`, zone);
  const evening = zonedParts(ctx.now, zone).hour >= 17;
  const periods = [];
  if (type === "daily") {
    const day = evening ? today + 1 : today;
    periods.push({ label: ctx.clock.slotLabel(at(day, 12), "daily", ctx.now), start: Math.max(at(day, 0), ctx.now), end: at(day + 1, 0) });
  } else {
    const parts = [today, today + 1].flatMap((day) => PARTS.map(([hour, name]) => ({ name, day, start: at(day, hour) })));
    parts.forEach((p, i) => (p.end = parts[i + 1]?.start ?? at(today + 2, 5)));
    const next = parts.find((p) => p.start > ctx.now);
    const names = { morning: next.day === today ? t.wx_this_morning : t.wx_tomorrow_morning, afternoon: t.wx_this_afternoon, evening: t.wx_this_evening, night: t.wx_tonight };
    if (!(evening && next.day > today)) periods.push({ label: names[next.name], start: next.start, end: next.end, night: next.name === "night" });
    if (evening) periods.push({ label: ctx.clock.slotLabel(at(today + 1, 12), "daily", ctx.now), start: at(today + 1, 5), end: at(today + 1, 22) });
    ctx.wake(next.start);
  }
  ctx.wake(at(today, 17));
  ctx.wake(ctx.midnight);
  return periods
    .map((p) => {
      const slots = forecast.filter((f) => {
        const ts = Date.parse(f?.datetime);
        return ts < p.end && ts + SPAN[type] > p.start;
      });
      if (!slots.length) return null;
      const temps = slots
        .flatMap((f) => [f.temperature, f.templow])
        .filter((v) => v != null && v !== "" && Number.isFinite(Number(v)))
        .map((v) => Math.round(Number(v)));
      const [lo, hi] = [Math.min(...temps), Math.max(...temps)];
      const range = !temps.length ? "" : lo === hi ? ctx.clock.number(hi) + "°" : fill(t.wx_range, { lo: ctx.clock.number(lo), hi: ctx.clock.number(hi) });
      const condition = mainCondition(slots, st.attributes.precipitation_unit);
      const shown = { ...st, state: condition || "unknown" };
      return { label: p.label, condition, night: p.night, text: [condition ? ctx.state(shown) : "", range].filter(Boolean).join(" · ") };
    })
    .filter(Boolean);
}

export const windowIds = (states) =>
  Object.keys(states).filter((id) => {
    const a = states[id]?.attributes;
    return a?.device_class === "window" && !Array.isArray(a.entity_id) && /^(binary_sensor|cover)\./.test(id);
  });

export const isOpenWindow = (st) =>
  st && (st.entity_id.startsWith("binary_sensor.") ? st.state === "on" : !["closed", "unavailable", "unknown"].includes(st.state));
