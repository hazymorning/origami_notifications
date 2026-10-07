export const nameList = (names) => (names.length > 4 ? `${names.slice(0, 4).join(", ")} +${names.length - 4}` : names.join(", "));

// A group can't show the buttons, picture or tap of one entry, so such an entry stays alone.
const groupable = (entry) => entry.kind === "generic" && entry.deviceClass && !entry.image && !entry.tap && !entry.actions.length;

export function areaOf(hass, id) {
  const entry = hass.entities?.[id];
  const device = entry?.device_id && hass.devices?.[entry.device_id];
  return hass.areas?.[entry?.area_id || device?.area_id]?.name || "";
}

// Two or more plain binary sensors of one device class become one entry, named by their rooms.
export function groupAlike(entries, ctx) {
  const classes = new Map();
  for (const entry of entries.filter(groupable)) {
    if (!classes.has(entry.deviceClass)) classes.set(entry.deviceClass, []);
    classes.get(entry.deviceClass).push(entry);
  }
  const out = [];
  for (const entry of entries) {
    const members = groupable(entry) ? classes.get(entry.deviceClass) : null;
    if (!members || members.length < 2) out.push(entry);
    else if (members[0] === entry) out.push(group(entry.deviceClass, members, ctx));
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
