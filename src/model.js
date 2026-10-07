import { conditionsMet } from "./conditions.js";
import { dayNumber, dayStart, DAY } from "./format.js";
import { groupAlike, nameList } from "./group.js";
import { stateActive } from "./ha.js";
import { infoSlides, quietInfos } from "./infos.js";
import { entityEntries } from "./kinds.js";
import { alikeTitle } from "./strings.js";
import { notificationEntries, repairEntries } from "./system.js";
import { forecastType, isOpenWindow, weatherEntries } from "./weather.js";

const visibleTo = (rule, viewer) => !rule || (rule.only ? rule.only.includes(viewer) : !rule.except.includes(viewer));

export const isAhead = (entry, now) => !entry.past && entry.ts > now;

export const entityName = (hass) => (st, override) =>
  (typeof override === "string" && override) || hass.formatEntityName?.(st, override || undefined) || st.attributes.friendly_name || st.entity_id;

// The names a group entity's members show. A sensor group keeps a value of its own, like a mean.
const members = (st) => (Array.isArray(st.attributes.entity_id) && !st.entity_id.startsWith("sensor.") ? st.attributes.entity_id.filter((id) => typeof id === "string") : []);

// Everything the card shows, from Home Assistant's state and what its subscriptions brought.
export function buildModel(input) {
  const { hass, config, now, data } = input;
  const watched = new Set();
  const wakes = [];
  const known = new Set();
  const available = new Set();
  const allowed = (source) => input.preview || visibleTo(config.audience[source], input.viewer);
  const ctx = {
    ...input,
    t: input.texts,
    watch: (id) => watched.add(id),
    wake: (ts) => Number.isFinite(ts) && ts > now && wakes.push(ts),
    midnight: dayStart(dayNumber(now, input.clock.zone) + 1, input.clock.zone),
    dayOf: (ts, zone = input.clock.zone) => dayNumber(ts, zone),
    name: entityName(hass),
    state: (st) => (hass.formatEntityState ? hass.formatEntityState(st) : String(st.state)),
    attr: (st, key, value) => (!key.includes(".") && hass.formatEntityAttributeValue?.(st, key, value)) || String(value),
    alikeTitle: (dc, n) => alikeTitle(input.clock.lang, dc, n, hass.localize),
    members: (st) => {
      const ids = members(st);
      ids.forEach((id) => watched.add(id));
      return nameList(ids.map((id) => hass.states[id]).filter((m) => m && stateActive(m)).map((m) => ctx.name(m)));
    },
    conditionsMet: (conditions, entity) =>
      conditionsMet(conditions, entity, { hass, now, zone: input.clock.zone, watch: ctx.watch, wake: ctx.wake, media: input.media, server: input.serverCondition }),
  };

  const entries = [];
  if (allowed("system")) entries.push(...notificationEntries(data.notifications, ctx));
  if (config.repairs && input.admin && allowed("repairs")) entries.push(...repairEntries(data.repairs, ctx));

  const sources = [...input.sources];
  for (const id of input.updates) if (!sources.some((src) => src.entity === id)) sources.push({ entity: id });
  for (const src of sources) {
    const id = src.entity;
    watched.add(id);
    if (!allowed(id) || (id.startsWith("update.") && !allowed("updates"))) continue;
    const st = hass.states[id];
    entries.push(...entityEntries(src, st, ctx));
    if (st && st.state !== "unavailable" && st.state !== "unknown") available.add(id);
  }

  const weather = config.weather && hass.states[config.weather];
  if (weather && allowed(config.weather)) {
    watched.add(config.weather);
    const type = forecastType(weather);
    const forecast = type && data.forecast(config.weather, type);
    if (forecast) {
      const openWindows = () => {
        input.windows.forEach((id) => watched.add(id));
        return input.windows.filter((id) => isOpenWindow(hass.states[id])).length;
      };
      entries.push(...weatherEntries(weather, forecast, type, { ...ctx, openWindows }));
      known.add(`wx:${config.weather}:wet`).add(`wx:${config.weather}:frost`);
    }
  }

  const current = entries.filter((entry) => {
    if (entry.expires <= now) return false;
    ctx.wake(entry.expires);
    if (entry.live) ctx.wake(entry.ts);
    return true;
  });
  if (current.some((entry) => entry.day || entry.kind === "calendar")) ctx.wake(ctx.midnight);
  const slides = infoSlides(quietInfos(config, input.sources, hass, allowed), { ...ctx, forecast: data.forecast });
  return { entries: current, slides, watched, wakes, known, available, ctx };
}

const distance = (entry, now) => (!Number.isFinite(entry.ts) ? Infinity : entry.past ? now - entry.ts : Math.abs(entry.ts - now));

// Critical first, then what lies closest to now, then the latest arrival.
export function sortEntries(entries, now) {
  return entries.sort(
    (a, b) =>
      (b.sev === "crit") - (a.sev === "crit") ||
      distance(a, now) - distance(b, now) ||
      (b.seq || 0) - (a.seq || 0) ||
      (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
  );
}

// The order changes on its own once an entry ahead comes as close to now as the one before it.
export function nextReorder(entries, now) {
  let next = Infinity;
  for (let i = 1; i < entries.length; i++) {
    const [a, b] = [entries[i - 1], entries[i]];
    if ((a.sev === "crit") !== (b.sev === "crit") || !isAhead(b, now) || !(b.ts > a.ts)) continue;
    next = Math.min(next, Math.max((a.ts + b.ts) / 2, now + 1));
  }
  return next;
}

export function finishEntries(entries, ctx) {
  const sorted = sortEntries(groupAlike(entries, ctx), ctx.now);
  ctx.wake(nextReorder(sorted, ctx.now));
  return sorted;
}

export const nextWake = (wakes, now) => (wakes.length ? Math.min(Math.max(Math.min(...wakes) - now, 0), DAY) + 50 : null);
