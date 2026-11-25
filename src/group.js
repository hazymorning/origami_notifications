import { domainColor, zoneOf } from "./ha.js";

export const nameList = (names) => (names.length > 4 ? `${names.slice(0, 4).join(", ")} +${names.length - 4}` : names.join(", "));

const groupable = (entry) => (entry.kind === "generic" || entry.kind === "battery") && entry.deviceClass && !entry.image && !entry.tap && !entry.actions.length;

const alikeKey = (entry) => (groupable(entry) ? "class:" + entry.deviceClass : entry.place ? "place:" + entry.place : null);

export function areaOf(hass, id) {
  const entry = hass.entities?.[id];
  const device = entry?.device_id && hass.devices?.[entry.device_id];
  return hass.areas?.[entry?.area_id || device?.area_id]?.name || "";
}

export function groupAlike(entries, ctx) {
  const alike = new Map();
  for (const entry of entries) {
    const key = alikeKey(entry);
    if (key && !alike.has(key)) alike.set(key, []);
    if (key) alike.get(key).push(entry);
  }
  const out = [];
  for (const entry of entries) {
    const members = alike.get(alikeKey(entry));
    if (!members || members.length < 2) out.push(entry);
    else if (members[0] === entry) out.push(entry.kind === "presence" ? place(members, ctx) : group(entry.deviceClass, members, ctx));
  }
  return out;
}

function group(deviceClass, members, ctx) {
  const newest = [...members].sort((a, b) => b.ts - a.ts);
  const names = [...new Set(newest.map((m) => areaOf(ctx.hass, m.entity) || m.title))];
  return {
    key: "group:" + deviceClass,
    kind: "group",
    sev: newest[0].sev,
    title: ctx.alikeTitle(deviceClass, members.length),
    message: nameList(names),
    ts: newest[0].ts,
    past: true,
    icon: newest[0].icon,
    stateObj: newest[0].stateObj,
    members: newest,
    actions: [],
  };
}

// People at the same place share a row with the zone's icon, as a zone shows on Home Assistant's map.
// Each arrival makes it new, so it comes forward.
function place(members, ctx) {
  const newest = [...members].sort((a, b) => b.ts - a.ts);
  const state = newest[0].place;
  const zone = state === "not_home" ? undefined : zoneOf(newest[0].stateObj, ctx.hass.states);
  return {
    key: `group:place:${state}:${newest[0].key}`,
    kind: "group",
    title: newest[0].message,
    message: nameList([...new Set(newest.map((m) => m.title))]),
    ts: newest[0].ts,
    past: true,
    icon: zone ? undefined : state === "not_home" ? "mdi:home-export-outline" : "mdi:home",
    stateObj: zone,
    color: domainColor("person", undefined, state, state !== "not_home"),
    members: newest,
    actions: [],
  };
}
