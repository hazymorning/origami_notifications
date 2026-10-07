import { isObject } from "./config.js";
import { clockText, DAY, fill, isoTime, parseDuration, parseTime } from "./format.js";
import { domainOf, FEATURE, stateActive, supports } from "./ha.js";
import { linkAction, plainText } from "./markdown.js";

export const sig = (...parts) => parts.join("\u0000");

export const service = (entity, label, action, extra = {}) => ({
  label,
  action: { entity, tap_action: { action: "perform-action", perform_action: action, target: { entity_id: entity }, ...extra } },
});

const textOf = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if ((typeof v === "string" && v) || typeof v === "number") return String(v);
  }
  return "";
};

const isEmpty = (v) => v == null || v === "" || v === false || (typeof v === "object" && Object.keys(v).length === 0);

const attrPath = (attrs, path) => path.split(".").reduce((v, k) => v?.[k], attrs);

const PICTURE_ATTRS = ["image", "image_url", "picture", "thumbnail"];

export function findPicture(attrs) {
  if (typeof attrs.entity_picture === "string" && attrs.entity_picture) return attrs.entity_picture;
  return PICTURE_ATTRS.map((k) => attrs[k]).find((v) => typeof v === "string" && /^(https?:\/\/|\/|data:image\/)/i.test(v)) || null;
}

const THING_TEXT = ["description", "summary"];

const isThing = (v) => isObject(v) && textOf(v, ["name", "title"]) !== "";

const findThing = (attrs) => Object.keys(attrs).find((k) => isThing(attrs[k]) && [...THING_TEXT, ...PICTURE_ATTRS].some((f) => !isEmpty(attrs[k][f])));

const isInactive = (state) => {
  const s = String(state).trim().toLowerCase();
  return ["off", "unavailable", "unknown", "idle", "none", ""].includes(s) || Number(s) === 0;
};

const isOn = (state) => {
  const s = String(state).toLowerCase();
  return s === "on" || s === "active" || Number(state) > 0;
};

function thing(st, src, ctx, kind) {
  const a = st.attributes;
  const path = src.attribute || findThing(a);
  const value = path ? attrPath(a, path) : undefined;
  const base = { kind, ts: parseTime(st.last_changed, ctx.now), past: true, once: true };
  if (isThing(value)) {
    const title = textOf(value, ["name", "title"]);
    const text = textOf(value, THING_TEXT);
    return [{ ...base, title, message: text || ctx.name(st, src.name), image: textOf(value, PICTURE_ATTRS), ack: sig(title, text) }];
  }
  if (kind === "attribute") {
    if (!src.attribute || isEmpty(value) || typeof value === "object") return [];
    return [{ ...base, title: ctx.attr(st, path, value), message: ctx.name(st, src.name), ack: String(value) }];
  }
  if (isInactive(st.state)) return [];
  return [{ ...base, title: ctx.state(st), message: ctx.name(st, src.name), ack: String(st.state) }];
}

function calendar(st, src, ctx) {
  const a = st.attributes;
  if (!a.message) return [];
  const entry = { kind: "calendar", title: a.message, message: ctx.clock.calendar(a.start_time, a.all_day, ctx.now) };
  if (st.state === "on") return [{ ...entry, ts: parseTime(st.last_changed, ctx.now), past: true, ack: sig(a.message, a.start_time) }];
  const start = isoTime(a.start_time, ctx.clock.server);
  if (st.state !== "off" || !(src.lead >= 0) || !(start > ctx.now)) return [];
  if (start - ctx.now > src.lead) {
    ctx.wake(start - src.lead);
    return [];
  }
  return [{ ...entry, ts: start, day: Boolean(a.all_day), ack: sig(a.message, a.start_time, "ahead") }];
}

function update(st, src, ctx) {
  if (st.state !== "on") return [];
  const { attributes: a, entity_id: id } = st;
  const t = ctx.t;
  const percent = typeof a.update_percentage === "number" ? Math.round(a.update_percentage) : null;
  const busy = a.in_progress ? [{ label: percent === null ? t.installing : fill(t.installing_pct, { p: percent }), disabled: true }] : null;
  const install = ctx.admin && supports(st, FEATURE.updateInstall) ? [service(id, t.install, "update.install")] : [];
  return [
    {
      kind: "update",
      title: (src.name ? ctx.name(st, src.name) : a.title || ctx.name(st).replace(/\s*update\s*$/i, "").trim()) || t.update,
      message: a.latest_version ? fill(t.update_msg, { v: a.latest_version }) : t.update_msg_plain,
      ts: parseTime(st.last_changed, ctx.now),
      past: true,
      actions: busy || install,
      ...(ctx.admin && !a.auto_update ? { dismiss: { service: ["update", "skip", { entity_id: id }] } } : { ack: String(a.latest_version) }),
    },
  ];
}

const ALARM = { triggered: "crit", pending: "warn", arming: "warn" };

function alarm(st, src, ctx) {
  if (!ALARM[st.state]) return [];
  return [{ kind: "alarm", sev: ALARM[st.state], title: ctx.name(st, src.name), message: ctx.state(st), ts: parseTime(st.last_changed, ctx.now), past: true }];
}

function alert(st, src, ctx) {
  if (st.state !== "on") return [];
  return [{ kind: "alert", sev: "warn", title: ctx.name(st, src.name), message: "", ts: parseTime(st.last_changed, ctx.now), past: true, ack: "on" }];
}

// A running timer ends at finishes_at. Its remaining keeps the value from its start.
function timer(st, src, ctx) {
  const { attributes: a, entity_id: id } = st;
  const t = ctx.t;
  const entry = { kind: "timer", title: ctx.name(st, src.name) };
  if (st.state === "active") {
    return [{ ...entry, message: ctx.state(st), ts: parseTime(a.finishes_at), live: true, clock: true, ack: String(a.finishes_at), actions: [service(id, t.act_pause, "timer.pause"), service(id, t.act_cancel, "timer.cancel")] }];
  }
  if (st.state !== "paused") return [];
  return [
    {
      ...entry,
      message: fill(t.paused_left, { t: clockText(parseDuration(a.remaining)), s: ctx.state(st) }),
      ts: parseTime(st.last_changed, ctx.now),
      past: true,
      ack: sig("paused", a.remaining),
      actions: [service(id, t.act_resume, "timer.start"), service(id, t.act_cancel, "timer.cancel")],
    },
  ];
}

const TIME_UNITS = { d: DAY, h: 3600000, min: 60000, s: 1000, ms: 1 };

const durationUnit = (a) => (a.device_class === "timestamp" ? undefined : TIME_UNITS[a.unit_of_measurement]);

// A duration counts down from the last change. Its value goes stale, so the entry names the end.
function countdown(st, src, ctx) {
  const unit = durationUnit(st.attributes);
  const end = unit ? parseTime(st.last_changed) + Number(st.state) * unit : isoTime(st.state, ctx.clock.server);
  const ts = Math.round(end / 60000) * 60000;
  if (!(ts > ctx.now)) return [];
  return [{ kind: "countdown", title: ctx.name(st, src.name), message: unit ? ctx.clock.absolute(ts) : ctx.state(st), ts, live: true, ack: "" }];
}

function devicePicture(hass, ids) {
  for (const id of ids) {
    const st = hass.states[id];
    const a = st?.attributes || {};
    if (id.startsWith("image.") && a.access_token) {
      return `/api/image_proxy/${id}?token=${encodeURIComponent(a.access_token)}&state=${encodeURIComponent(st.state)}`;
    }
    if (a.entity_picture) return a.entity_picture;
  }
  return null;
}

// The state is the time of the last event, so the entry ends a day after it.
function event(st, src, ctx) {
  const ts = isoTime(st.state, ctx.clock.server);
  if (!Number.isFinite(ts)) return [];
  const type = st.attributes.event_type;
  const pictures = ctx.devicePictures(st.entity_id);
  pictures.forEach(ctx.watch);
  return [
    {
      kind: "event",
      title: ctx.name(st, src.name),
      message: type == null || type === "" ? "" : ctx.attr(st, "event_type", type),
      ts,
      past: true,
      expires: ts + DAY,
      image: findPicture(st.attributes) || devicePicture(ctx.hass, pictures),
      ack: String(st.state),
    },
  ];
}

// A due date without a time is a day on the server.
function todo(st, src, ctx) {
  const id = st.entity_id;
  const lead = src.lead >= 0 ? src.lead : 0;
  const today = ctx.dayOf(ctx.now);
  const canFinish = supports(st, FEATURE.todoUpdate);
  const done = (item) => (canFinish ? [service(id, ctx.t.act_done, "todo.update_item", { data: { item: item.uid, status: "completed" } })] : []);
  const entries = [];
  for (const item of ctx.todos(id) || []) {
    if (item?.status !== "needs_action" || !item.uid || typeof item.due !== "string") continue;
    const day = !item.due.includes("T");
    const ts = isoTime(item.due, ctx.clock.server);
    if (!Number.isFinite(ts)) continue;
    if (ctx.dayOf(ts, day ? ctx.clock.server : ctx.clock.zone) > today && ts - ctx.now > lead) {
      ctx.wake(ts - lead);
      ctx.wake(ctx.midnight);
      continue;
    }
    entries.push({
      key: `t:${id}:${item.uid}`,
      kind: "todo",
      title: String(item.summary || ""),
      message: ctx.name(st, src.name),
      ts,
      day,
      ack: sig(item.uid, item.due),
      tap: linkAction("/todo?entity_id=" + id),
      actions: done(item),
    });
  }
  return entries;
}

const DEVICES = {
  lock: { sev: { jammed: "warn" }, label: "act_lock", action: "lock.lock", when: ["unlocked", "open", "jammed"], assumed: true },
  cover: { label: "act_close_cover", action: "cover.close_cover", feature: FEATURE.coverClose, when: ["open", "opening"], assumed: true, confirm: true },
  valve: { label: "act_close_valve", action: "valve.close_valve", feature: FEATURE.valveClose, when: ["open", "opening"], assumed: true, confirm: true },
  vacuum: { sev: { error: "warn" }, label: "act_dock_vacuum", action: "vacuum.return_to_base", feature: FEATURE.vacuumReturn, when: ["cleaning", "error"] },
  lawn_mower: { sev: { error: "warn" }, label: "act_dock_mower", action: "lawn_mower.dock", feature: FEATURE.mowerDock, when: ["mowing", "returning", "error"] },
  siren: { sev: { on: "crit" }, label: "act_off", action: "siren.turn_off", feature: FEATURE.sirenOff, when: ["on"] },
};

// A lock that asks for a code gets no button, since the card can't ask for one.
function device(st, src, ctx) {
  if (st.state === "unknown" || !stateActive(st)) return [];
  const { attributes: a, entity_id: id } = st;
  const d = DEVICES[domainOf(id)];
  const offered =
    d &&
    (d.when.includes(st.state) || (d.assumed && a.assumed_state === true)) &&
    (!d.feature || supports(st, d.feature)) &&
    !(domainOf(id) === "lock" && a.code_format);
  return [
    {
      kind: "device",
      sev: d?.sev?.[st.state],
      title: ctx.name(st, src.name),
      message: ctx.members(st) || ctx.state(st),
      ts: parseTime(st.last_changed, ctx.now),
      past: true,
      ack: String(st.state),
      actions: offered ? [service(id, ctx.t[d.label], d.action, d.confirm ? { confirmation: true } : {})] : [],
    },
  ];
}

const CAP_SEV = { extreme: "crit", severe: "crit", moderate: "warn" };

const isCap = (a) => Boolean(textOf(a, ["severity"]) && textOf(a, ["headline", "event"]));

const NUMBERED = /^([a-z][a-z0-9]*)_(\d+)_(headline|name|title|event)$/;

const numberedWarnings = (a) => {
  const found = new Map();
  for (const key of Object.keys(a)) {
    const m = NUMBERED.exec(key);
    if (m && !isEmpty(a[key])) found.set(m[1] + m[2], { prefix: m[1], n: Number(m[2]) });
  }
  return [...found.values()].sort((x, y) => x.n - y.n);
};

const firstTime = (fields, read, zone) => fields.map((k) => isoTime(read(k), zone)).find(Number.isFinite);

// An integration may renumber its warnings when one ends, so the key names the warning, not its number.
function numbered(st, warnings, ctx) {
  const id = st.entity_id;
  const keys = new Set();
  return warnings.map(({ prefix, n }) => {
    const read = (field) => st.attributes[`${prefix}_${n}_${field}`];
    const fields = { headline: read("headline"), name: read("name"), title: read("title"), event: read("event") };
    const title = textOf(fields, ["headline", "name", "title", "event"]);
    const level = Number(read("level")) || 0;
    const text = plainText(textOf({ d: read("description") }, ["d"]));
    const start = firstTime(["start", "onset"], read, ctx.clock.server);
    const end = firstTime(["end", "expires"], read, ctx.clock.server);
    let key = `w:${id}:${read("name") || title}:${read("start") || read("onset") || ""}`;
    while (keys.has(key)) key += "+";
    keys.add(key);
    return {
      key,
      kind: "warning",
      sev: level >= 3 || CAP_SEV[String(read("severity")).toLowerCase()] === "crit" ? "crit" : "warn",
      title,
      message: text || (level ? fill(ctx.t.level, { l: level }) : ctx.name(st)),
      ts: start ?? parseTime(st.last_changed, ctx.now),
      past: start === undefined,
      expires: end,
      ack: sig(title, level, text),
    };
  });
}

// A warning sends its details in its attributes, often in the Common Alerting Protocol. Some integrations keep them
// back and answer a get_details action instead.
function warning(st, src, ctx) {
  const warnings = numberedWarnings(st.attributes);
  if (warnings.length) return numbered(st, warnings, ctx);
  if (st.state !== "on") return [];
  const details = isCap(st.attributes) ? st.attributes : ctx.details(st);
  const w = details || {};
  const read = (k) => w[k];
  const zone = ctx.clock.server;
  const start = firstTime(["start", "onset", "effective"], read, zone);
  const sent = isoTime(w.sent, zone);
  const expires = isoTime(w.expires, zone);
  const title = textOf(w, ["headline", "event"]);
  const text = plainText(textOf(w, ["description"]));
  return [
    {
      kind: "warning",
      sev: CAP_SEV[String(w.severity).toLowerCase()],
      title: title || ctx.name(st, src.name),
      message: text,
      ts: start ?? (Number.isFinite(sent) ? sent : parseTime(st.last_changed, ctx.now)),
      past: start === undefined,
      expires: Number.isFinite(expires) ? expires : undefined,
      waiting: details === undefined,
      ack: title ? sig(title, w.severity, text) : String(st.attributes.id || ""),
    },
  ];
}

const DEVICE_CLASS_SEV = { smoke: "crit", gas: "crit", carbon_monoxide: "crit", moisture: "crit", safety: "crit", heat: "crit", problem: "warn", tamper: "warn", battery: "warn", sound: "warn" };

function generic(st, src, ctx) {
  if (src.type ? isInactive(st.state) : !isOn(st.state)) return [];
  const a = st.attributes;
  const binary = domainOf(st.entity_id) === "binary_sensor";
  return [
    {
      kind: "generic",
      sev: binary && st.state === "on" ? DEVICE_CLASS_SEV[a.device_class] : undefined,
      deviceClass: binary && typeof a.device_class === "string" && !Array.isArray(a.entity_id) ? a.device_class : undefined,
      title: ctx.name(st, src.name),
      message: ctx.members(st) || ctx.state(st),
      ts: parseTime(st.last_changed, ctx.now),
      past: true,
      ack: String(st.state),
    },
  ];
}

const BUILDERS = {
  calendar,
  update,
  alarm,
  alert,
  timer,
  countdown,
  event,
  todo,
  device,
  warning,
  attribute: (st, src, ctx) => thing(st, src, ctx, "attribute"),
  picture: (st, src, ctx) => thing(st, src, ctx, "picture"),
  generic,
};

const DOMAIN_KINDS = { calendar: "calendar", update: "update", alarm_control_panel: "alarm", alert: "alert", timer: "timer" };

export function kindOf(src, st, hass) {
  if (src.type) return src.type;
  if (src.attribute) return "attribute";
  if (!st) return "generic";
  const domain = domainOf(st.entity_id);
  const a = st.attributes;
  if (numberedWarnings(a).length) return "warning";
  if (DOMAIN_KINDS[domain]) return DOMAIN_KINDS[domain];
  if (findThing(a)) return "attribute";
  if (domain === "event") return "event";
  if (DEVICES[domain]) return "device";
  if (domain === "binary_sensor" && (isCap(a) || hasDetails(hass, st.entity_id))) return "warning";
  if (domain === "sensor" && a.device_class === "timestamp") return "countdown";
  return "generic";
}

export const platformOf = (hass, id) => hass?.entities?.[id]?.platform || "";

export const hasDetails = (hass, id) => Boolean(hass?.services?.[platformOf(hass, id)]?.get_details);

export const KIND_ICONS = {
  system: "mdi:bell",
  update: "mdi:rocket-launch",
  repair: "mdi:wrench",
  alarm: "mdi:shield-alert",
  alert: "mdi:alert",
  calendar: "mdi:calendar-month",
  timer: "mdi:timer-outline",
  countdown: "mdi:timer-sand",
  event: "mdi:eye-check",
  todo: "mdi:clipboard-check-outline",
  device: "mdi:devices",
  warning: "mdi:alert-circle",
  group: "mdi:google-circles-communities",
  weather: "mdi:weather-partly-rainy",
  attribute: "mdi:card-text-outline",
  picture: "mdi:image-outline",
  generic: "mdi:information-outline",
};

// Entries for one configured entity, with its options applied.
export function entityEntries(src, st, ctx) {
  if (!st) return [];
  const kind = kindOf(src, st, ctx.hass);
  let entries;
  try {
    entries = BUILDERS[kind](st, src, ctx);
  } catch (e) {
    console.warn(`origami-notifications: ${st.entity_id} could not be shown`, e);
    return [];
  }
  const id = st.entity_id;
  const image = src.image && (src.image.includes("/") ? src.image : attrPath(st.attributes, src.image));
  const tap = src.tap_action && src.tap_action.action !== "none" ? { entity: id, tap_action: src.tap_action } : undefined;
  const extra = (src.actions || []).map((ac) => ({ label: ac.label, action: { entity: id, tap_action: ac.tap_action } }));
  return entries.map((entry) => {
    const picture = src.image ? image : entry.image || findPicture(st.attributes);
    return {
      key: `${kind}:${id}`,
      entity: id,
      ...entry,
      icon: src.icon || entry.icon,
      image: typeof picture === "string" && picture ? picture : null,
      backdrop: Boolean(src.background),
      tap: src.tap_action ? tap : entry.tap,
      inert: src.tap_action?.action === "none",
      actions: [...(entry.actions || []), ...extra],
      stateObj: entry.kind === "todo" ? undefined : st,
    };
  });
}
