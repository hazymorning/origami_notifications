import assert from "node:assert/strict";
import { test } from "node:test";
import { parseConfig } from "../src/config.js";
import { Clock } from "../src/format.js";
import { infoText } from "../src/infos.js";
import { buildModel, finishEntries } from "../src/model.js";
import { cardTexts } from "../src/strings.js";
import { windowIds } from "../src/weather.js";
import { NOW, on, st, statesOf } from "./helpers.js";

const at = (minutes) => new Date(NOW + minutes * 60000).toISOString();

// What the card would show, worked out without a page.
function model(config, states = {}, opts = {}) {
  const lang = opts.lang || "en";
  const hass = {
    states,
    entities: {},
    devices: {},
    areas: {},
    services: {},
    user: { id: "u1", is_admin: true },
    locale: { language: lang, time_format: "24", time_zone: "server", ...opts.locale },
    config: { time_zone: "UTC" },
    localize: () => "",
    formatEntityState: (s) => s.state,
    ...opts.hass,
  };
  const parsed = parseConfig({ updates: false, repairs: false, ...config });
  const texts = cardTexts(lang, hass.localize);
  const now = opts.now ?? NOW;
  const built = buildModel({
    hass,
    config: parsed,
    now,
    texts,
    clock: new Clock(hass, lang, texts),
    admin: hass.user.is_admin,
    viewer: opts.viewer ?? "",
    preview: false,
    sources: parsed.entities,
    updates: opts.updates || [],
    windows: windowIds(states),
    devicePictures: () => [],
    details: opts.details || (() => null),
    todos: (id) => opts.todos?.[id],
    media: () => false,
    serverCondition: opts.server || (() => ({ result: false, failed: false })),
    data: { notifications: new Map(Object.entries(opts.notifications || {})), repairs: opts.repairs || [], forecast: (id) => opts.forecast?.[id] },
  });
  return { ...built, entries: finishEntries(built.entries, built.ctx), wakes: built.wakes.sort((a, b) => a - b) };
}

const show = (m, ...fields) => m.entries.map((e) => (fields.length ? fields : ["title", "message"]).map((f) => (f === "actions" ? e.actions.map((a) => a.label) : e[f])));

test("a broken config names the option, and a good one passes", () => {
  const error = (config) => {
    try {
      parseConfig(config);
      return null;
    } catch (e) {
      return e.message.replace("origami-notifications: ", "");
    }
  };
  const broken = [
    [{ entities: "sensor.door" }, "entities must be a list"],
    [{ entities: [{ name: "Washer" }] }, 'entities must contain entity ids, got {"name":"Washer"}'],
    [{ entities: [{ entity: "sensor.door", type: "nope" }] }, "unknown type 'nope'"],
    [{ entities: [{ entity: "sensor.door", background: "yes" }] }, "background must be true or false"],
    [{ entities: [{ entity: "calendar.family", before: "soon" }] }, "before must be minutes or a duration like 1:30:00"],
    [{ entities: [{ entity: "sensor.door", tap_action: "toggle" }] }, "tap_action must be an action"],
    [{ entities: [{ entity: "sensor.door", actions: [{ label: "Open" }] }] }, "actions must be a list of buttons with a label and a tap_action"],
    [{ vertical: "yes" }, "vertical must be true or false"],
    [{ rotate: -1 }, "rotate must be the seconds between turns, or 0 to turn them off"],
    [{ slide: "down" }, "slide must be up or side"],
    [{ weather: "sensor.rain" }, "weather must be a weather entity, e.g. weather.home"],
    [{ infos: [{ entity: "weather.home", forecast_type: "weekly" }] }, "forecast_type must be daily, hourly or twice_daily"],
    [{ infos: [{ entity: "weather.home", forecast_slots: 0 }] }, "forecast_slots must be a whole number above 0"],
    [{ infos: [{ entity: "sun.sun", visibility: { condition: "user" } }] }, "visibility of sun.sun must be a list of conditions"],
    [{ audience: { system: { only: ["anna"] } } }, "audience.system.only must list person entities, e.g. person.anna"],
  ];
  assert.deepEqual(broken.map(([config]) => error(config)), broken.map(([, message]) => message));
  const fine = [{ rotate: 0, slide: "side" }, ...[30, "1:30:00", { days: 1, minutes: "15" }].map((before) => ({ entities: [{ entity: "calendar.family", before }] }))];
  assert.deepEqual(fine.map(error), fine.map(() => null));
});

test("notifications are plain text with their first picture, and a tap follows their first link", () => {
  const n = { notification_id: "n1", title: "**New devices**", message: "![logo](/static/logo.png) We found [2 devices](/config/integrations).\n\n- Hue", created_at: at(-5) };
  const [entry] = model({}, {}, { notifications: { n1: n } }).entries;
  assert.deepEqual(
    [entry.title, entry.message, entry.image, entry.tap, entry.dismiss],
    ["New devices", "We found 2 devices.\n\nHue", "/static/logo.png", { tap_action: { action: "navigate", navigation_path: "/config/integrations" } }, { service: ["persistent_notification", "dismiss", { notification_id: "n1" }] }]
  );
  const unsafe = model({}, {}, { notifications: { n2: { notification_id: "n2", message: "[x](javascript:alert(1))" } } }).entries[0];
  assert.deepEqual([unsafe.title, unsafe.tap], ["Notification", undefined]);
});

test("repairs are named from Home Assistant's translations and ignored when dismissed", () => {
  const repairs = [
    { domain: "zwave_js", issue_id: "fw", translation_key: "old_firmware", severity: "warning", breaks_in_ha_version: "2026.12", created: at(-60) },
    { domain: "cloud", issue_id: "legacy_login", severity: "critical", created: at(-120) },
  ];
  const words = { "component.zwave_js.issues.old_firmware.title": "Firmware is out of date", "component.cloud.title": "Home Assistant Cloud" };
  const m = model({ repairs: true }, {}, { repairs, hass: { localize: (k) => words[k] || "" } });
  assert.deepEqual(show(m, "title", "message", "sev"), [
    ["Legacy login", "Home Assistant Cloud", "crit"],
    ["Firmware is out of date", "Stops working in 2026.12", "warn"],
  ]);
  assert.deepEqual(m.entries[0].dismiss, { ws: { type: "repairs/ignore_issue", domain: "cloud", issue_id: "legacy_login", ignore: true } });
  assert.equal(model({ repairs: true }, {}, { repairs, hass: { user: { id: "u2", is_admin: false } } }).entries.length, 0, "only admins see repairs");
});

test("updates show what is new, can be installed by admins and are skipped when dismissed", () => {
  const update = (id, attributes) => st(id, "on", { title: "RouterOS", latest_version: "7.15", supported_features: 1, ...attributes });
  const states = statesOf(update("update.router"), update("update.tv", { title: "TV", in_progress: true, update_percentage: 42 }), update("update.nas", { title: "NAS", auto_update: true }));
  const m = model({ updates: true }, states, { updates: Object.keys(states) });
  assert.deepEqual(show(m, "title", "message", "actions"), [
    ["NAS", "Update 7.15 available", ["Install"]],
    ["RouterOS", "Update 7.15 available", ["Install"]],
    ["TV", "Update 7.15 available", ["Installing (42%)"]],
  ]);
  assert.deepEqual([m.entries[0].dismiss, m.entries[1].dismiss], [undefined, { service: ["update", "skip", { entity_id: "update.router" }] }], "an update that installs itself can't be skipped");
  const guest = model({ updates: true }, states, { updates: ["update.router"], hass: { user: { id: "u2", is_admin: false } } }).entries[0];
  assert.deepEqual([guest.actions, guest.dismiss, guest.ack], [[], undefined, "7.15"], "a non-admin only hides it");
});

test("a calendar shows a running event and, with before, the next one ahead", () => {
  const cal = (id, state, message, start, allDay = false) => st(id, state, { friendly_name: id, message, start_time: start, all_day: allDay });
  const states = statesOf(
    cal("calendar.holiday", "on", "Holiday", "2026-10-02 00:00:00", true),
    cal("calendar.standup", "on", "Standup", "2026-10-02 09:30:00"),
    cal("calendar.dentist", "off", "Dentist", "2026-10-02 15:00:00"),
    cal("calendar.bins", "off", "Paper bin", "2026-10-02 18:00:00"),
    cal("calendar.trip", "off", "Trip", "2026-10-04 00:00:00", true)
  );
  const config = { entities: ["calendar.holiday", "calendar.standup", { entity: "calendar.dentist", before: 60 }, { entity: "calendar.bins", before: "12:00:00" }, { entity: "calendar.trip", before: { days: 3 } }] };
  const m = model(config, states);
  assert.deepEqual(show(m), [
    ["Paper bin", "today at 18:00"],
    ["Trip", ""],
    ["Holiday", "today"],
    ["Standup", "today at 09:30"],
  ]);
  assert.equal(m.ctx.clock.entryTime(m.entries[1], NOW), "on 10/04", "a day ahead is named once, by its time");
  assert.equal(m.wakes[0], Date.parse("2026-10-02T14:00:00Z"), "it wakes when the dentist is an hour ahead");
});

test("an event leads with its name in the color of a running calendar, and color picks a theme color as on a tile", () => {
  const states = statesOf(st("calendar.family", "off", { friendly_name: "Family", message: "Dentist", start_time: "2026-10-02 12:30:00" }), on("binary_sensor.door", "Door"));
  const running = "var(--state-calendar-on-color, var(--state-calendar-active-color, var(--state-active-color)))";
  const m = model({ hide_when_empty: false, entities: [{ entity: "calendar.family", before: 60 }, { entity: "binary_sensor.door", color: "green" }] }, states);
  assert.deepEqual(show(m, "title", "color"), [["Dentist", running], ["Door", "var(--green-color)"]]);
  const later = model({ hide_when_empty: false, entities: ["calendar.family"] }, states);
  assert.deepEqual(later.slides.map((s) => [s.title, s.content, s.color]), [["Dentist", ["start_time"], running]], "the next event leads, and its time follows");
  const named = model({ hide_when_empty: false, entities: [{ entity: "calendar.family", name: "Family", color: "green" }] }, states).slides;
  assert.deepEqual(named.map((s) => [s.title, s.content, s.color]), [["Family", ["message", "start_time"], "var(--green-color)"]], "a name set by hand leads instead");
});

test("a timer counts down while it runs, says when it ends and shows the time left while paused", () => {
  const timer = (state, attributes) => statesOf(st("timer.kitchen", state, { friendly_name: "Kitchen", ...attributes }));
  const [running] = model({ entities: ["timer.kitchen"] }, timer("active", { finishes_at: at(5) })).entries;
  assert.deepEqual([running.ts, running.clock, running.message, running.actions.map((a) => a.action.tap_action.perform_action)], [NOW + 300000, true, "Ends at 12:05", ["timer.pause", "timer.cancel"]]);
  const [paused] = model({ entities: ["timer.kitchen"] }, timer("paused", { remaining: "0:03:12" })).entries;
  assert.deepEqual([paused.message, paused.actions.map((a) => a.label)], ["Paused, 3:12 left", ["Resume", "Cancel"]]);
  assert.equal(model({ entities: ["timer.kitchen"] }, timer("idle")).entries.length, 0);
});

test("a timestamp or a duration counts down to its end, rounded to the minute", () => {
  const states = statesOf(
    st("sensor.alarm", at(25.6), { friendly_name: "Alarm", device_class: "timestamp" }),
    st("sensor.dishwasher", "25", { friendly_name: "Dishwasher", device_class: "duration", unit_of_measurement: "min" }, at(-0.2)),
    st("sensor.past", at(-1), { device_class: "timestamp" })
  );
  const m = model({ entities: ["sensor.alarm", { entity: "sensor.dishwasher", type: "countdown" }, "sensor.past"] }, states);
  assert.deepEqual(show(m, "title", "ts", "kind"), [
    ["Dishwasher", NOW + 25 * 60000, "countdown"],
    ["Alarm", NOW + 26 * 60000, "countdown"],
  ]);
  assert.equal(m.entries[0].message, "Oct 2, 2026, 12:25", "a duration names its end, since its value goes stale");
});

test("bin day shows from noon the day before until the pickup, from a calendar or a sensor of Waste Collection Schedule", () => {
  const hass = { entities: { "sensor.bins": { platform: "waste_collection_schedule" }, "calendar.bins": { platform: "waste_collection_schedule" } } };
  const states = statesOf(
    st("sensor.bins", "Bio in 1 days", { friendly_name: "Bins", "2026-10-03": "Bio", "2026-10-10": "Paper" }),
    st("calendar.bins", "off", { friendly_name: "Bin calendar", message: "Paper", start_time: "2026-10-04 00:00:00", all_day: true })
  );
  const shown = (hours) => model({ entities: Object.keys(states) }, states, { now: NOW + hours * 3600000, hass });
  const days = (m) => m.entries.map((e) => [e.title, e.message || m.ctx.clock.entryTime(e, m.ctx.now), e.kind]);
  assert.deepEqual(days(shown(-1)), [], "not before noon the day before");
  assert.deepEqual(days(shown(0)), [["Bio", "tomorrow", "waste"]], "the day is named once, by its time");
  assert.deepEqual(days(shown(24)), [["Paper", "tomorrow", "waste"], ["Bio", "today", "waste"]], "on the day itself, and the calendar's next pickup joins at noon");
  assert.equal(shown(-1).wakes[0], NOW, "the card wakes at noon");
});

test("the phone's next alarm shows in the 12 hours before it rings", () => {
  const states = statesOf(st("sensor.pixel_next_alarm", at(18 * 60), { friendly_name: "Pixel Next alarm", device_class: "timestamp", "Time in Milliseconds": 1 }));
  const shown = (hours) => model({ entities: ["sensor.pixel_next_alarm"] }, states, { now: NOW + hours * 3600000 });
  assert.deepEqual([show(shown(0)), shown(0).wakes[0]], [[], NOW + 6 * 3600000]);
  assert.deepEqual(show(shown(7), "title", "message", "kind"), [["Alarm", "tomorrow at 06:00", "next_alarm"]]);
});

test("a to-do list shows what is due by tonight or within before, and Done marks it done", () => {
  const item = (uid, summary, due, status = "needs_action") => ({ uid, summary, due, status });
  const items = [item("1", "Milk", "2026-10-02"), item("2", "Bread", at(180)), item("3", "Eggs", "2026-10-01", "completed"), item("4", "Butter", at(24 * 60)), item("5", "Tea", "2026-09-30")];
  const states = statesOf(st("todo.shopping", "5", { friendly_name: "Shopping", supported_features: 4 }), st("todo.chores", "1", { friendly_name: "Chores" }));
  const m = model({ entities: [{ entity: "todo.shopping", type: "todo" }, { entity: "todo.chores", type: "todo", before: "48:00:00" }] }, states, {
    todos: { "todo.shopping": items, "todo.chores": [item("a", "Vacuum", "2026-10-04")] },
  });
  assert.deepEqual(show(m, "title", "message", "actions"), [
    ["Bread", "Shopping", ["Done"]],
    ["Milk", "Shopping", ["Done"]],
    ["Vacuum", "Chores", []],
    ["Tea", "Shopping", ["Done"]],
  ]);
  assert.deepEqual(m.entries[0].actions[0].action.tap_action.data, { item: "2", status: "completed" });
  assert.deepEqual(m.entries[0].tap, { tap_action: { action: "navigate", navigation_path: "/todo?entity_id=todo.shopping" } });
});

test("locks, covers, valves, vacuums, mowers and sirens show while active, with Home Assistant's button", () => {
  const states = statesOf(
    st("lock.front", "unlocked", { friendly_name: "Front" }),
    st("lock.coded", "unlocked", { friendly_name: "Coded", code_format: "^\\d+$" }),
    st("lock.jammed", "jammed", { friendly_name: "Jammed" }),
    st("cover.garage", "open", { friendly_name: "Garage", supported_features: 15 }),
    st("cover.blind", "open", { friendly_name: "Blind", supported_features: 1 }),
    st("valve.garden", "opening", { friendly_name: "Garden", supported_features: 3 }),
    st("vacuum.robo", "error", { friendly_name: "Robo", supported_features: 16 }),
    st("lawn_mower.lawn", "docked", { friendly_name: "Mower", supported_features: 7 }),
    on("siren.hall", "Siren", { supported_features: 3 })
  );
  const m = model({ entities: Object.keys(states) }, states);
  assert.deepEqual(show(m, "title", "sev", "actions").slice(1).sort(), [
    ["Blind", undefined, []],
    ["Coded", undefined, []],
    ["Front", undefined, ["Lock"]],
    ["Garage", undefined, ["Close"]],
    ["Garden", undefined, ["Close"]],
    ["Jammed", "warn", ["Lock"]],
    ["Robo", "warn", ["Dock"]],
  ]);
  assert.deepEqual(show(m, "title", "sev", "actions")[0], ["Siren", "crit", ["Turn off"]], "a sounding siren is critical and comes first");
  assert.equal(m.entries.find((e) => e.title === "Garage").actions[0].action.tap_action.confirmation, true, "Home Assistant asks before closing");
});

test("numbered warnings and alerts of the Common Alerting Protocol follow their level or severity, and expire", () => {
  const warning = (n, headline, level, start, end) => ({ [`warning_${n}_headline`]: headline, [`warning_${n}_level`]: level, [`warning_${n}_start`]: start, [`warning_${n}_end`]: end });
  const cap = (severity) => on("binary_sensor.meteoalarm", "Meteoalarm", { severity, headline: "Forest fire", description: "<b>High</b> hazard", onset: at(120), expires: at(180) });
  const states = statesOf(st("sensor.dwd", "2", { ...warning(1, "Sturm", 3, at(-60), at(60)), ...warning(2, "Glatteis", 2, at(30), at(90)) }), cap("Moderate"));
  const m = model({ entities: Object.keys(states) }, states);
  assert.deepEqual(show(m, "title", "message", "sev"), [
    ["Sturm", "Level 3", "crit"],
    ["Glatteis", "Level 2", "warn"],
    ["Forest fire", "High hazard", "warn"],
  ]);
  assert.ok([NOW + 3600000, NOW + 90 * 60000].every((end) => m.wakes.includes(end)), "each wakes the card when it ends");
  assert.equal(model({ entities: ["sensor.dwd"] }, states, { now: NOW + 61 * 60000 }).entries.length, 1, "an ended warning goes");
  assert.deepEqual(["Extreme", "Severe", "Minor"].map((s) => model({ entities: ["binary_sensor.meteoalarm"] }, statesOf(cap(s))).entries[0].sev), ["crit", "crit", undefined]);
  const zones = statesOf(st("switch.sprinkler", "off", { zone_1_name: "Lawn", zone_2_name: "Beds" }));
  assert.equal(model({ entities: ["switch.sprinkler"] }, zones).entries.length, 0, "numbered names alone are no warnings");
});

test("a warning whose integration keeps its details back shows them once get_details answers", () => {
  const slot = on("binary_sensor.berlin_warning_1", "Berlin Warning 1", { id: "heat" });
  const hass = { entities: { [slot.entity_id]: { platform: "nina" } }, services: { nina: { get_details: {} } } };
  let details;
  const run = () => model({ entities: [slot.entity_id] }, statesOf(slot), { hass, details: () => details }).entries[0];
  const waiting = run();
  assert.deepEqual([waiting.kind, waiting.title, waiting.waiting], ["warning", "Berlin Warning 1", true]);
  details = { headline: "HITZE", description: "Hot.<br/>Less tomorrow.", severity: "Severe", start: "2026-10-02T10:00:00+02:00" };
  assert.deepEqual([run().title, run().message, run().sev, run().ts], ["HITZE", "Hot.\nLess tomorrow.", "crit", Date.parse("2026-10-02T08:00:00Z")]);
});

test("an attribute describes an entry, and a picture type shows the state as its title", () => {
  const states = statesOf(
    st("sensor.dinner", "Lasagne", { friendly_name: "Dinner", recipe: { name: "Lasagne", description: "Bake for 40 minutes", image: "/local/lasagne.jpg" } }),
    st("sensor.bins", "1", { friendly_name: "Bins", next: "Paper" }),
    st("sensor.book", "Dune", { friendly_name: "Book", cover: "https://img.test/dune.jpg" })
  );
  const m = model({ entities: ["sensor.dinner", { entity: "sensor.bins", attribute: "next" }, { entity: "sensor.book", type: "picture", image: "cover" }] }, states);
  assert.deepEqual(show(m, "title", "message", "image", "once"), [
    ["Paper", "Bins", null, true],
    ["Lasagne", "Bake for 40 minutes", "/local/lasagne.jpg", true],
    ["Dune", "Book", "https://img.test/dune.jpg", true],
  ]);
});

test("other entities show while on, active or above 0, and urgent device classes warn", () => {
  const states = statesOf(
    st("sensor.load", "3", { friendly_name: "Load" }),
    st("sensor.rain", "0.0", { friendly_name: "Rain" }),
    st("sensor.mode", "eco", { friendly_name: "Mode" }),
    on("binary_sensor.smoke", "Smoke", { device_class: "smoke" }),
    on("binary_sensor.battery", "Battery", { device_class: "battery" }),
    on("group.lights", "Lights", { entity_id: ["light.a", "light.b"] }),
    on("light.a", "Lamp A"),
    st("light.b", "off", { friendly_name: "Lamp B" })
  );
  const m = model({ entities: ["sensor.load", "sensor.rain", "sensor.mode", { entity: "sensor.mode", name: "Twice" }, "binary_sensor.smoke", "binary_sensor.battery", "group.lights", { entity: "input_text.note", type: "generic" }] }, states);
  assert.deepEqual(show(m, "title", "message", "sev"), [
    ["Smoke", "on", "crit"],
    ["Battery", "on", "warn"],
    ["Lights", "Lamp A", undefined],
    ["Load", "3", undefined],
  ]);
  assert.deepEqual(model({ entities: [{ entity: "sensor.mode", type: "generic", name: "Mode" }] }, states).entries.map((e) => e.title), ["Mode"], "a forced type shows any state but off");
  assert.ok(m.watched.has("light.b"), "a group's members are watched");
});

test("an entity with conditions shows while they hold, so a sensor can show above or below a mark", () => {
  const config = { entities: [{ entity: "sensor.attic", visibility: [{ condition: "numeric_state", above: 28 }] }, { entity: "sensor.cellar", visibility: [{ condition: "numeric_state", below: 0 }] }] };
  const temps = (attic, cellar) => model(config, statesOf(st("sensor.attic", attic, { friendly_name: "Attic" }), st("sensor.cellar", cellar, { friendly_name: "Cellar" }))).entries.map((e) => [e.title, e.message]);
  assert.deepEqual(temps("29.5", "-2"), [["Attic", "29.5"], ["Cellar", "-2"]], "a value below 0 shows too, since its conditions decide");
  assert.deepEqual(temps("27", "3"), []);
});

test("open windows become one entry named by their rooms", () => {
  const win = (id, name, minutes) => on(id, name, { device_class: "window" }, at(minutes));
  const states = statesOf(win("binary_sensor.kitchen", "Kitchen window", -30), win("binary_sensor.bath", "Bath window", -20), win("binary_sensor.office", "Office window", -10));
  const hass = {
    entities: { "binary_sensor.kitchen": { area_id: "kitchen", device_id: "d1" }, "binary_sensor.bath": { device_id: "d2" } },
    devices: { d1: { area_id: "hall" }, d2: { area_id: "bath" } },
    areas: { kitchen: { name: "Kitchen" }, bath: { name: "Bath" }, hall: { name: "Hall" } },
  };
  const [group] = model({ entities: Object.keys(states) }, states, { hass }).entries;
  assert.deepEqual([group.kind, group.title, group.message, group.ts, group.members.length], ["group", "3 windows open", "Office window, Bath, Kitchen", NOW - 600000, 3]);
  assert.equal(model({ entities: Object.keys(states) }, states, { lang: "de", hass }).entries[0].title, "3 Fenster offen");
});

const hourly = (...hours) => hours.map((h, i) => ({ datetime: new Date(NOW + i * 3600000).toISOString(), condition: "cloudy", temperature: 10, ...h }));
const weather = (state = "cloudy", attributes = {}) => st("weather.home", state, { friendly_name: "Home", temperature: 12, temperature_unit: "°C", supported_features: 2, ...attributes });

test("rain, snow, thunder and frost ahead name the hour they start", () => {
  const ahead = (forecast, state) => model({ weather: "weather.home" }, statesOf(weather(...state)), { forecast: { "weather.home": forecast } }).entries.map((e) => [e.title, e.message]);
  assert.deepEqual(ahead(hourly({}, {}, { condition: "rainy", precipitation_probability: 70 }), []), [["Rain from 14:00", "70% chance"]]);
  assert.deepEqual(
    [hourly({}, { condition: "snowy" }), hourly({}, { condition: "lightning-rainy" }), hourly({}, { condition: "rainy", temperature: 1 }), hourly({ precipitation: 0.1, precipitation_probability: 59 }), hourly({}, {}, {}, {}, {}, {}, { condition: "pouring" })].map((f) => ahead(f, [])[0]?.[0] ?? null),
    ["Snow from 13:00", "Thunderstorms from 13:00", "Snow from 13:00", null, null],
    "by kind, and nothing below the marks or beyond six hours"
  );
  assert.deepEqual(ahead(hourly({ temperature: 3 }, { temperature: -1 }, { temperature: -3 }), ["clear-night", { temperature: 3 }]), [["Frost from 13:00", "Low of -3"]]);
});

test("wet weather with a window open is a warning that counts the windows", () => {
  const states = statesOf(weather("rainy"), on("binary_sensor.kitchen", "Kitchen", { device_class: "window" }), st("cover.roof", "open", { device_class: "window" }), on("binary_sensor.all", "All", { device_class: "window", entity_id: ["binary_sensor.kitchen"] }));
  const m = model({ weather: "weather.home" }, states, { forecast: { "weather.home": hourly() } });
  assert.deepEqual(show(m, "title", "message", "sev", "ack"), [["It is raining", "2 windows open", "warn", "rain open"]]);
  assert.ok(m.watched.has("cover.roof"), "every window is watched");
});

test("critical entries come first, then what lies closest to now", () => {
  const dwd = (...warnings) =>
    statesOf(st("sensor.dwd", "1", Object.fromEntries(warnings.flatMap(([title, minutes], i) => [[`warning_${i + 1}_headline`, title], [`warning_${i + 1}_level`, 2], [`warning_${i + 1}_start`, at(minutes)]]))));
  assert.deepEqual(model({ entities: ["sensor.dwd"] }, dwd(["a", -20], ["b", 5], ["c", -120], ["d", 180])).entries.map((e) => e.title), ["b", "a", "c", "d"]);
  const states = { ...dwd(["Frost", 10]), ...statesOf(on("binary_sensor.door", "Door", {}, at(-2))) };
  const m = model({ entities: Object.keys(states) }, states);
  assert.deepEqual([m.entries.map((e) => e.title), m.wakes[0]], [["Door", "Frost"], NOW + 4 * 60000], "the card wakes when the order changes");
});

test("audience rules show a source only to the people they name", () => {
  const states = statesOf(on("binary_sensor.door", "Door"), st("update.nas", "on", { title: "NAS" }));
  const shown = (audience, viewer) => model({ entities: ["binary_sensor.door"], updates: true, audience }, states, { viewer, updates: ["update.nas"], notifications: { n: { notification_id: "n" } } }).entries.map((e) => e.title);
  assert.deepEqual(shown({ system: { except: ["person.anna"] }, updates: { only: ["person.bob"] } }, "person.anna"), ["Door"]);
  assert.deepEqual(shown({ "binary_sensor.door": { only: ["person.anna"] } }, "person.bob"), ["Notification", "NAS"]);
});

test("an info shows while its conditions hold, checked as Home Assistant checks them", () => {
  const states = statesOf(st("sensor.energy", "4.2", { friendly_name: "Energy" }), st("sun.sun", "below_horizon"), st("sensor.level", "30"));
  const shows = (visibility, opts) => model({ infos: [{ entity: "sensor.energy", visibility }] }, states, opts).slides.length === 1;
  const c = (condition, rest) => ({ condition, ...rest });
  const cases = [
    [c("state", { entity: "sun.sun", state: "below_horizon" }), true],
    [c("state", { entity: "sun.sun", state_not: ["below_horizon"] }), false],
    [c("numeric_state", { entity: "sensor.level", above: 20, below: "sensor.energy" }), false],
    [c("numeric_state", { entity: "sensor.level", above: 20, below: 40 }), true],
    [c("user", { users: ["u2"] }), false],
    [c("or", { conditions: [c("user", { users: ["u2"] }), c("user", { users: ["u1"] })] }), true],
    [c("not", { conditions: [c("user", { users: ["u1"] })] }), false],
    [{ ...c("user", { users: ["u2"] }), enabled: false }, true],
    [c("time", { after: "11:00", before: "13:00", weekdays: ["fri"] }), true],
    [c("time", { after: "22:00", before: "06:00" }), false],
  ];
  assert.deepEqual(cases.map(([condition]) => shows([condition])), cases.map(([, expected]) => expected));
  const m = model({ infos: [{ entity: "sensor.energy", visibility: [c("time", { after: "13:00" })] }] }, states);
  assert.equal(m.wakes[0], Date.parse("2026-10-02T13:00:00Z"), "the card wakes when a time condition changes");
  const sun = c("sun", { after: "sunset" });
  const asked = [];
  const answer = (result) => (cond) => (asked.push(cond), result);
  assert.deepEqual([shows([sun], { server: answer({ result: true, failed: false }) }), asked], [true, [sun]], "other kinds are checked by the server");
  assert.equal(shows([sun], { server: answer({ result: true, failed: true }) }), false, "an error from the server hides the info");
});

test("infos turn in their order, without the ones that are unavailable", () => {
  const states = statesOf(st("sensor.energy", "4.2", { friendly_name: "Energy" }), st("sensor.gone", "unavailable"), on("light.desk", "Desk"));
  const m = model({ infos: ["sensor.energy", "sensor.gone", { entity: "light.desk", name: "Lamp", color: "red", icon: "mdi:lamp" }] }, states);
  assert.deepEqual(m.slides.map((s) => [s.key, s.title, s.color, s.icon]), [
    ["info:sensor.energy", "Energy", "var(--state-icon-color)", undefined],
    ["info:light.desk", "Lamp", "var(--red-color)", "mdi:lamp"],
  ]);
});

test("a weather info shows its name over the weather, as a tile does, and turns through its forecast, in the number format of the profile", () => {
  const day = (d, rest) => ({ datetime: new Date(Date.parse("2026-10-02T00:00:00Z") + d * 86400000).toISOString(), condition: "sunny", temperature: 16.5, templow: 9, ...rest });
  const states = statesOf(weather("rainy", { supported_features: 7 }));
  const slides = (info, forecast, opts) => model({ infos: [{ entity: "weather.home", ...info }] }, states, { forecast: { "weather.home": forecast }, ...opts }).slides.map((s) => [s.title, s.text ?? s.stateObj.state, s.icon ?? null]);
  assert.deepEqual(slides({ forecast_type: "daily", forecast_slots: 2 }, [day(-1), day(0), day(1, { condition: "rainy" })]), [
    ["Home", "rainy", null],
    ["Today", "16.5° / 9° · sunny", null],
    ["Tomorrow", "16.5° / 9° · rainy", null],
  ]);
  assert.deepEqual(slides({ forecast_type: "daily", show_current: false }, [day(0)], { locale: { number_format: "decimal_comma" } }), [["Today", "16,5° / 9° · sunny", null]]);
  assert.deepEqual(slides({ forecast_type: "daily", show_current: false }, null), [], "only the forecast waits for it");
  const hours = [{ datetime: at(0), condition: "partlycloudy", temperature: 11, is_daytime: false }];
  assert.deepEqual(slides({ forecast_type: "hourly", show_current: false, name: "Oslo" }, hours), [["Oslo", "12:00 · 11° · partlycloudy", "mdi:weather-night-partly-cloudy"]]);
  assert.deepEqual(slides({ forecast_type: "twice_daily", show_current: false }, [{ ...hours[0], is_daytime: true }]), [["Today", "Day · 11° · partlycloudy", null]]);
});

test("a card that stays while nothing needs attention shows the weather now, what comes next and the next events", () => {
  const states = statesOf(weather("cloudy", { supported_features: 3 }), st("calendar.family", "off", { friendly_name: "Family", message: "Dentist", start_time: "2026-10-03 09:00:00" }), st("calendar.empty", "off"));
  const forecast = hourly(...Array.from({ length: 40 }, (_, i) => ({ temperature: 8 + (i % 4), condition: i === 6 ? "rainy" : "cloudy" })));
  const slides = (now) => {
    const m = model({ hide_when_empty: false, weather: "weather.home", entities: ["calendar.family", "calendar.empty"] }, states, { forecast: { "weather.home": forecast }, now });
    return m.slides.map((s) => [s.title, s.text ?? infoText(s.stateObj, s.content ?? s.info.state_content, s.name, m.ctx)]);
  };
  assert.deepEqual(slides(NOW), [
    ["Home", "cloudy · 12"],
    ["This evening", "rainy · 8 to 11°"],
    ["Dentist", "in 21 hr."],
  ], "the place and the time of day lead the weather, and the event leads its time");
  assert.deepEqual(slides(NOW + 7 * 3600000).map(([title]) => title), ["Home", "Tonight", "Tomorrow", "Dentist"], "from the evening on, tomorrow joins");
  assert.deepEqual(slides(NOW + 11 * 3600000).map(([title]) => title), ["Home", "Tomorrow", "Dentist"], "and tomorrow morning goes into tomorrow");
  const daily = statesOf(weather("sunny", { supported_features: 1 }));
  const day = (d, rest) => ({ datetime: new Date(Date.parse("2026-10-02T00:00:00Z") + d * 86400000).toISOString(), temperature: 16.4, templow: 9, condition: "sunny", ...rest });
  const daySlides = model({ hide_when_empty: false, weather: "weather.home" }, daily, { forecast: { "weather.home": [day(0), day(1, { condition: "rainy" })] } }).slides;
  assert.deepEqual(daySlides.map((s) => [s.title, s.text ?? ""]), [["Home", ""], ["Today", "sunny · 9 to 16°"]], "a daily forecast names the day");
  assert.equal(model({ weather: "weather.home", entities: ["calendar.family"] }, states).slides.length, 0, "a card that hides when empty adds none");
  const soon = model({ hide_when_empty: false, entities: [{ entity: "calendar.family", before: "24:00:00" }] }, states);
  assert.deepEqual([soon.entries.map((e) => e.title), soon.slides.length], [["Dentist"], 0], "an event that shows ahead shows once");
});

test("times read like Home Assistant's, rounded before they pick a unit", () => {
  const clock = new Clock({ locale: { language: "en" }, config: { time_zone: "UTC" } }, "en", cardTexts("en"));
  const s = 1000;
  assert.deepEqual(
    [[NOW - 3580 * s, true], [NOW - 23.8 * 3600 * s, true], [NOW + 30 * s, false], [NOW + 120 * s, false], [NOW + 300 * s, false, true]].map(([ts, past, clockEntry]) => clock.entryTime({ ts, past, clock: clockEntry }, NOW)),
    ["1 hr. ago", "yesterday", "in a moment", "in 2 min.", "5:00"]
  );
  const twelve = new Clock({ locale: { language: "de", time_format: "12", time_zone: "server" }, config: { time_zone: "UTC" } }, "de", cardTexts("de"));
  assert.match(twelve.hour(Date.parse("2026-10-02T19:00:00Z")), /^7\D/, "12 hours where the profile asks for them");
  const british = new Clock({ locale: { language: "en-GB", time_format: "24", time_zone: "server" }, config: { time_zone: "UTC" } }, "en-GB", cardTexts("en"));
  assert.deepEqual([british.hour(Date.parse("2026-10-02T21:00:00Z")), new Clock({ locale: { language: "de", time_format: "24", time_zone: "server" }, config: { time_zone: "UTC" } }, "de", cardTexts("de")).hour(Date.parse("2026-10-02T21:00:00Z"))], ["21:00", "21 Uhr"], "an hour reads as people write it");
});

test("texts use Home Assistant's words where it has them, and other languages borrow them", () => {
  const words = { "ui.card.lock.lock": "Verrouiller", "ui.notification_drawer.title": "Notifications", "component.weather.entity_component._.state.rainy": "Pluie" };
  const fr = cardTexts("fr", (k) => words[k] || "");
  assert.deepEqual([fr.act_lock, fr.count_other, fr.wx_rain_from, fr.just_now, fr.idle_title], ["Verrouiller", "Notifications ({n})", "Pluie, {t}", null, "All quiet"]);
  const de = cardTexts("de", (k) => (k === "ui.card.lock.lock" ? "Verriegeln" : ""));
  assert.deepEqual([de.act_lock, de.idle_title, de.act_cancel], ["Verriegeln", "Alles ruhig", "Cancel"]);
});
