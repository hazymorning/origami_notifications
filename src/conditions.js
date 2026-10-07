import { isEntityId } from "./config.js";
import { isObject } from "./values.js";
import { DAY, dayNumber, dayStart, fromServerTime, isoDate, zonedParts } from "./format.js";

// Copied from frontend src/panels/lovelace/common/validate-condition.ts. Every other kind goes to the server.
const CLIENT = new Set(["state", "numeric_state", "screen", "user", "location", "time", "view_columns"]);

const LOGIC = { and: (r) => r.every(Boolean), or: (r) => r.some(Boolean), not: (r) => !r.every(Boolean) };

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const listOf = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

const enabled = (c) => !(isObject(c) && c.enabled === false);

const daySeconds = (text) => {
  const [h, m, s] = String(text).split(":").map((part) => parseInt(part, 10));
  return h * 3600 + m * 60 + (s || 0);
};

const pad = (n) => String(n).padStart(2, "0");

const wallTime = (day, seconds, zone) =>
  seconds >= DAY / 1000
    ? dayStart(day + 1, zone)
    : fromServerTime(`${isoDate(day)}T${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`, zone);

function timeMet(c, env) {
  const p = zonedParts(env.now, env.zone);
  const day = dayNumber(env.now, env.zone);
  const now = p.hour * 3600 + p.minute * 60 + p.second;
  const after = c.after ? daySeconds(c.after) : null;
  const before = c.before ? daySeconds(c.before) : null;
  for (const at of [after, before == null ? null : before + 1]) {
    if (at != null) [day, day + 1].forEach((d) => env.wake(wallTime(d, at, env.zone)));
  }
  env.wake(dayStart(day + 1, env.zone));
  if (c.weekdays?.length && !c.weekdays.includes(WEEKDAYS[new Date(day * DAY).getUTCDay()])) return false;
  if (after != null && before != null) return before < after ? now >= after || now <= before : now >= after && now <= before;
  if (after != null) return now >= after;
  return before == null || now <= before;
}

export function conditionsMet(conditions, entity, env) {
  const { hass } = env;
  let failed = false;
  const stateOf = (id) => {
    env.watch(id);
    return hass.states[id];
  };
  const refer = (v) => (isEntityId(v) && hass.states[v] ? stateOf(v).state : undefined);
  const met = (c) => {
    if (!isObject(c) || ("enabled" in c && typeof c.enabled !== "boolean")) return false;
    const type = c.condition ?? "state";
    if (LOGIC[type]) return c.conditions == null || LOGIC[type](listOf(c.conditions).filter(enabled).map(met));
    if ("entity_id" in c || !CLIENT.has(type)) {
      const answer = env.server(c);
      failed ||= answer.failed;
      return answer.result;
    }
    if (type === "screen") return Boolean(c.media_query) && env.media(c.media_query);
    if (type === "user") return Boolean(hass.user?.id && c.users?.includes(hass.user.id));
    if (type === "view_columns") return true;
    if (type === "time") return timeMet(c, env);
    if (type === "location") {
      const person = Object.values(hass.states).find((s) => s.entity_id.startsWith("person.") && s.attributes.user_id === hass.user?.id);
      if (person) env.watch(person.entity_id);
      return Boolean(person && c.locations?.includes(person.state));
    }
    const st = stateOf(c.entity || entity);
    const value = st && c.attribute ? st.attributes[c.attribute] : st?.state;
    if (type === "numeric_state") {
      const n = Number(value);
      const bound = (v) => Number(typeof v === "string" ? refer(v) ?? v : v);
      return !Number.isNaN(n) && (c.above == null || !(bound(c.above) >= n)) && (c.below == null || !(bound(c.below) <= n));
    }
    const wanted = c.state ?? c.state_not;
    if (wanted === undefined) return false;
    const values = listOf(wanted).flatMap((v) => (refer(v) !== undefined ? [v, refer(v)] : [v]));
    return values.includes(String(value ?? "unknown")) === (c.state != null);
  };
  const results = listOf(conditions).filter(enabled).map(met);
  return results.every(Boolean) && !failed;
}
