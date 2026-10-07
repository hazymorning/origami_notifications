import { isoTime, parseTime } from "./format.js";
import { domainOf, stateActive, stateColor, themeColor } from "./ha.js";
import { findPicture } from "./kinds.js";
import { isEmpty, isObject } from "./values.js";
import { forecastSupported, forecastType, outlook, SPAN } from "./weather.js";

const NIGHT_ICONS = { sunny: "mdi:weather-night", partlycloudy: "mdi:weather-night-partly-cloudy" };

export const showsForecast = (info, st) => info.entity.startsWith("weather.") && info.show_forecast !== false && forecastSupported(st, info.forecast_type);

export function quietInfos(config, sources, hass, allowed) {
  if (config.hide_when_empty !== false) return config.infos;
  const taken = new Set(config.infos.map((info) => info.entity));
  const extra = [];
  const weather = config.weather && hass.states[config.weather];
  if (weather && !taken.has(config.weather) && allowed(config.weather)) {
    const type = forecastType(weather);
    extra.push({ entity: config.weather, state_content: ["state", "temperature"], ...(type ? { forecast_type: type, outlook: true } : {}) });
  }
  for (const src of sources) {
    const st = hass.states[src.entity];
    if (!src.entity.startsWith("calendar.") || taken.has(src.entity) || !allowed(src.entity)) continue;
    if (st?.state === "off" && !isEmpty(st.attributes.message)) extra.push({ entity: src.entity, name: src.name, icon: src.icon, color: src.color });
  }
  return [...config.infos, ...extra];
}

export function infoText(stateObj, content, name, ctx) {
  const parts = [].concat(content ?? "state").map((c) => {
    if (c === "state") return ctx.state(stateObj);
    if (c === "name") return name;
    if (/^last[_-](changed|updated)$/.test(c)) return ctx.clock.relative(parseTime(stateObj[c.replace("-", "_")], ctx.now), ctx.now);
    const value = stateObj.attributes[c];
    if (value == null) return "";
    const at = isoTime(value, ctx.clock.server);
    return Number.isFinite(at) ? ctx.clock.relative(at, ctx.now) : ctx.attr(stateObj, c, value);
  });
  return parts.filter(Boolean).join(" · ") || ctx.state(stateObj);
}

function slotText(slot, shown, type, ctx) {
  const temps = [slot.temperature, slot.templow]
    .filter((v) => v != null && v !== "" && Number.isFinite(Number(v)))
    .map((v) => ctx.clock.number(Number(v)) + "°")
    .join(" / ");
  const half = type === "twice_daily" ? (slot.is_daytime === false ? ctx.t.wx_night : ctx.t.wx_day) : "";
  return [half, temps, slot.condition ? ctx.state(shown) : ""].filter(Boolean).join(" · ");
}

// Each slide ahead has a label, the condition it shows and its text.
function forecastAhead(info, st, ctx) {
  if (!showsForecast(info, st)) return null;
  const type = info.forecast_type;
  const forecast = ctx.forecast(info.entity, type);
  if (!forecast) return [];
  if (info.outlook) return outlook(st, forecast, type, ctx);
  const today = ctx.dayOf(ctx.now);
  const slots = forecast
    .filter((f) => Number.isFinite(Date.parse(f?.datetime)))
    .filter((f) => (type === "daily" ? ctx.dayOf(Date.parse(f.datetime)) >= today : Date.parse(f.datetime) + SPAN[type] > ctx.now))
    .slice(0, info.forecast_slots || 1);
  if (!slots.length) return null;
  ctx.wake(ctx.midnight);
  if (type !== "daily") ctx.wake(Date.parse(slots[0].datetime) + SPAN[type]);
  return slots.map((slot) => ({
    label: ctx.clock.slotLabel(Date.parse(slot.datetime), type, ctx.now),
    condition: slot.condition,
    night: slot.is_daytime === false,
    text: slotText(slot, { ...st, state: slot.condition || "unknown" }, type, ctx),
  }));
}

export function infoSlides(infos, ctx) {
  const slides = [];
  const keys = new Set();
  for (const info of infos) {
    ctx.watch(info.entity);
    const st = ctx.hass.states[info.entity];
    if (!st || st.state === "unavailable" || st.state === "unknown") continue;
    if (!ctx.conditionsMet(info.visibility, info.entity)) continue;
    let key = "info:" + info.entity;
    while (keys.has(key)) key += "+";
    keys.add(key);
    const custom = info.color && info.color !== "state";
    const colorOf = (s) => (custom ? (stateActive(s) ? themeColor(info.color) : "var(--state-inactive-color)") : stateColor(s));
    const name = ctx.name(st, info.name);
    const base = { kind: "info", info, entity: info.entity, row: key, name, icon: info.icon, image: info.show_entity_picture ? findPicture(st.attributes) : null };
    const ahead = forecastAhead(info, st, ctx);
    const domain = domainOf(info.entity);
    const event = domain === "calendar" && !isEmpty(st.attributes.message);
    const named = isObject(info.name) || !isEmpty(info.name) ? name : "";
    const current = { ...base, key, stateObj: st, title: name, color: colorOf(event ? { ...st, state: "on" } : st) };
    // A calendar's or the weather's name stays the same, so without a name set what they show leads.
    if (event) Object.assign(current, named ? { content: info.state_content ?? ["message", "start_time"] } : { title: st.attributes.message, content: info.state_content ?? ["start_time"] });
    if (!named && domain === "weather") Object.assign(current, { title: infoText(st, info.state_content ?? ["state", "temperature"], name, ctx), text: name });
    if (!ahead || info.show_current !== false) slides.push(current);
    (ahead || []).forEach((a, n) => {
      const shown = { ...st, state: a.condition || "unknown" };
      slides.push({
        ...base,
        key: `${key}#${n}`,
        stateObj: shown,
        title: named || a.text,
        text: named ? [a.label, a.text].filter(Boolean).join(" · ") : a.label,
        icon: info.icon || (a.night && NIGHT_ICONS[a.condition]) || undefined,
        color: colorOf(shown),
      });
    });
  }
  return slides;
}
