import { HOUR } from "./format.js";
import { domainOf, zoneState } from "./ha.js";

const TRACKERS = ["person", "device_tracker"];

export const PRESENCE_DOMAINS = [...TRACKERS, "zone"];

const STAY = HOUR;

// A tracker without a location has not moved, as during a restart.
const LOST = ["unavailable", "unknown"];

// Copied from frontend src/data/history.ts. What lies before the window goes, except the state it starts with.
export function mergeHistory(old, states, since) {
  const all = old.concat(states);
  if (old.length && states[0].lu < old.at(-1).lu) all.sort((a, b) => a.lu - b.lu);
  let start = 0;
  while (start + 1 < all.length && all[start + 1].lu * 1000 < since) start++;
  return all.slice(start);
}

// Copied from frontend src/panels/lovelace/cards/map/map-activity.ts. The first state is where the window starts.
function changes(history, inside) {
  const out = [];
  let previous;
  for (const h of history) {
    if (LOST.includes(h.s)) continue;
    const now = inside(h);
    if (previous !== undefined && now !== previous) out.push(h);
    previous = now;
  }
  return out;
}

// A zone a tracker reports in in_zones counts, since zone names can repeat.
const inZone = (zone) => (h) => (Array.isArray(h.a?.in_zones) ? h.a.in_zones.includes(zone.entity_id) : h.s === zoneState(zone));

function move(tracker, h, stay, ctx, name) {
  const ts = Math.round(h.lu * 1000);
  const shown = { ...tracker, state: h.s };
  return {
    key: `presence:${tracker.entity_id}:${ts}`,
    entity: tracker.entity_id,
    kind: "presence",
    title: ctx.name(tracker, name),
    message: ctx.state(shown),
    place: TRACKERS.includes(domainOf(tracker.entity_id)) ? h.s : undefined,
    ts,
    past: true,
    expires: ts + stay,
    ack: h.s,
    stateObj: shown,
  };
}

// Home Assistant sets last_changed anew on a restart, so moves come from the history, as on its map.
export function presence(st, src, ctx) {
  const stay = src.trail >= 0 ? src.trail : STAY;
  const since = ctx.now - stay;
  const last = (id, inside) => {
    const history = ctx.history(id, stay);
    return history && changes(history, inside).filter((h) => h.lu * 1000 >= since).at(-1);
  };
  if (domainOf(st.entity_id) !== "zone") {
    const h = last(st.entity_id, (h) => h.s);
    return h ? [move(st, h, stay, ctx, src.name)] : [];
  }
  const people = Object.values(ctx.hass.states).filter((person) => domainOf(person.entity_id) === "person");
  return people.flatMap((person) => {
    const h = last(person.entity_id, inZone(st));
    return h ? [{ ...move(person, h, stay, ctx), image: person.attributes.entity_picture || null }] : [];
  });
}
