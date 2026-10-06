const { test, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const CODE = fs.readFileSync(path.join(__dirname, "..", "dist", "origami-notifications.js"), "utf8");

/* Closing a window stops its timers, so the test process can exit. A mocked clock goes after them. */
const windows = [];
afterEach(() => {
  windows.splice(0).forEach((w) => w.close());
  mock.timers.reset();
});

/* What jsdom lacks. fire() tells an IntersectionObserver whether the card shows. */
function addStubs(window, opts) {
  window.IntersectionObserver = class {
    constructor(cb) {
      Object.assign(this, { cb, targets: [], disconnected: false });
    }
    observe(target) {
      if (!this.targets.includes(target)) this.targets.push(target);
      this.disconnected = false;
    }
    disconnect() {
      this.targets = [];
      this.disconnected = true;
    }
    fire(isIntersecting) {
      const entries = this.targets.map((target) => ({ isIntersecting, target }));
      if (entries.length) this.cb(entries, this);
    }
  };
  if (opts.stateIcon) {
    window.customElements.define(
      "ha-state-icon",
      class extends window.HTMLElement {
        constructor() {
          super();
          Object.assign(this, { hass: null, stateObj: null, stateValue: undefined, icon: undefined });
        }
      }
    );
  }
}

/* opts.stateIcon defines ha-state-icon, and opts.clock hands the card the Date of mock.timers.
 * Timers follow mock.timers anyway. opts.zone is the browser's time zone for every date format
 * that names none. */
function makeWindow(opts = {}) {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", (...args) => console.error(...args));
  virtualConsole.on("warn", (...args) => console.warn(...args));
  const { window } = new JSDOM("<!doctype html><html><body></body></html>", {
    pretendToBeVisual: true,
    runScripts: "outside-only",
    url: "http://ha.local/",
    virtualConsole,
  });
  /* resize(card, width) tells a card how wide it is. */
  window.ResizeObserver = class {
    constructor(cb) {
      this.cb = cb;
    }
    observe(target) {
      (target.__ro = target.__ro || new Set()).add(this);
    }
    unobserve() {}
    disconnect() {}
  };
  window.__origamiTest = {};
  addStubs(window, opts);
  if (opts.clock) window.Date = Date;
  if (opts.zone) {
    const Format = window.Intl.DateTimeFormat;
    window.Intl.DateTimeFormat = function (locales, options) {
      return new Format(locales, { ...options, timeZone: (options && options.timeZone) || opts.zone });
    };
    window.Intl.DateTimeFormat.supportedLocalesOf = Format.supportedLocalesOf;
  }
  window.eval(CODE);
  windows.push(window);
  return window;
}

/* The time of the mocked clock. Inside a test that uses it, await Promise.resolve() instead of tick(). */
const NOW = Date.parse("2026-10-02T12:00:00Z");
const useClock = (now = NOW) => mock.timers.enable({ apis: ["Date", "setTimeout", "setInterval"], now });

function st(entity_id, state, attributes = {}) {
  return { entity_id, state, attributes, last_changed: "2026-09-21T10:00:00+00:00" };
}

function makeHass(states = {}, opts = {}) {
  const calls = [];
  /* Ending a subscription marks it closed, so a test can check that none is left. */
  const subscribe = (sub) => {
    (opts.subs || []).push(sub);
    return Promise.resolve(() => {
      sub.closed = true;
    });
  };
  return {
    calls,
    states,
    entities: opts.entities || {},
    devices: opts.devices || {},
    areas: opts.areas || {},
    services: opts.services || {},
    locale: { language: opts.lang || "en" },
    user: opts.user || { id: "u1", is_admin: true },
    connection: {
      subscribeMessage: (cb, msg) => subscribe({ cb, msg, closed: false }),
      subscribeEvents: (cb, ev) => subscribe({ cb, ev, closed: false }),
    },
    /* Like Home Assistant's, the last two arguments can turn off its error notice and ask for the response. */
    callService: (d, s, data, target, notifyOnError, returnResponse) => {
      calls.push(target ? [d + "." + s, data, target] : [d + "." + s, data]);
      return Promise.resolve(opts.serviceReply ? opts.serviceReply(d, s, data, target, notifyOnError, returnResponse) : undefined);
    },
    callWS: (msg) => {
      calls.push(["ws", msg.type, msg]);
      return Promise.resolve(opts.wsReply ? opts.wsReply(msg) : { issues: [] });
    },
    hassUrl: (p) => (String(p).startsWith("http") ? p : "http://ha.local" + p),
    formatEntityState: opts.formatEntityState,
    localize: opts.localize || (() => ""),
    loadBackendTranslation: opts.loadBackendTranslation,
    themes: opts.themes || { darkMode: false },
  };
}

function mount(w, config, hass) {
  const el = w.document.createElement("origami-notifications");
  el.setConfig(config);
  w.document.body.appendChild(el);
  el.hass = hass;
  return el;
}

const rows = (el) =>
  [...el.shadowRoot.querySelectorAll(".list .row")].map((r) => ({
    title: r.querySelector(".title").textContent,
    body: r.querySelector(".body").textContent,
    tile: r.querySelector(".rtile").className,
    icon: r.querySelector(".rtile ha-icon").getAttribute("icon"),
    actions: [...r.querySelectorAll(".act")].map((b) => b.textContent + (b.disabled ? "!" : "")),
    x: Boolean(r.querySelector(".x")),
  }));

const head = (el) => ({
  title: el.shadowRoot.querySelector(".head .title").textContent,
  badge: el.shadowRoot.querySelector(".badge").textContent,
});

const resize = (el, width) => {
  const card = el.shadowRoot.querySelector("ha-card");
  for (const ro of card.__ro || []) ro.cb([{ target: card, contentRect: { width } }]);
};

/* Values from the jsdom window belong to another realm, so compare them as plain data. */
const same = (got, want, message) =>
  assert.deepStrictEqual(got === undefined ? got : JSON.parse(JSON.stringify(got)), want, message);

const tick = () => new Promise((r) => setTimeout(r, 0));

const services = (hass) => hass.calls.filter((c) => c[0] !== "ws");

/* jsdom neither computes styles nor parses sheets inside a shadow root, so these read the card's
 * rules from a copy in the page. */
const cssRules = (el) => {
  const style = el.ownerDocument.createElement("style");
  style.textContent = el.shadowRoot.querySelector("style").textContent;
  el.ownerDocument.head.append(style);
  return [...style.sheet.cssRules].filter((r) => r.selectorText);
};

/* A card without updates that shows while it is empty. */
const cfg = (entities, extra = {}) => ({ type: "x", updates: false, hide_when_empty: false, entities, ...extra });

/* Cards in one browser share their dismissals, and a card that shows an entry in another state ends
 * its dismissal. So a test takes the other cards off the page before it dismisses. */
const alone = (el) => {
  for (const card of el.ownerDocument.querySelectorAll("origami-notifications")) if (card !== el) card.remove();
};

const q = (el, selector) => el.shadowRoot.querySelector(selector);
const rowOf = (el, title) => [...el.shadowRoot.querySelectorAll(".row")].find((r) => r.querySelector(".title").textContent === title);
const whens = (el) => [...el.shadowRoot.querySelectorAll(".row .when")].map((t) => t.textContent);
const titles = (el) => rows(el).map((r) => r.title);
const dismiss = (el) => q(el, ".row .x").click();
const picture = (el, where = ".row .rtile") => {
  const img = q(el, where + " img");
  return img && img.getAttribute("src");
};
const actionsOf = (el) => {
  const sent = [];
  el.addEventListener("hass-action", (e) => sent.push(e.detail.config));
  return sent;
};
const notes = (sub, ...list) => sub.cb({ type: "current", notifications: Object.fromEntries(list.map((n) => [n.notification_id, n])) });
const on = (id, name, attributes) => st(id, "on", { friendly_name: name, ...attributes });

/* Opens the editor on a config, lets change edit the value of its form, and returns what it wrote. */
const edit = (w, config, hass, change = () => {}) => {
  const ed = w.document.createElement("origami-notifications-editor");
  ed.setConfig({ type: "custom:origami-notifications", ...config });
  ed.hass = hass;
  let written = null;
  ed.addEventListener("config-changed", (e) => (written = e.detail.config));
  const form = ed.querySelector("ha-form");
  const value = JSON.parse(JSON.stringify(form.data));
  change(value);
  form.dispatchEvent(new w.CustomEvent("value-changed", { detail: { value } }));
  return { ed, form, written };
};

/* A state that changed this many milliseconds from NOW. */
const changedAt = (id, name, ms) => ({ ...on(id, name), last_changed: new Date(NOW + ms).toISOString() });
const threeOn = () => ({
  "binary_sensor.a": changedAt("binary_sensor.a", "Door", -60000),
  "binary_sensor.b": changedAt("binary_sensor.b", "Garage", -120000),
  "binary_sensor.c": changedAt("binary_sensor.c", "Gate", -180000),
});

/* A timer as Home Assistant writes it. A running one ends this many seconds from NOW. */
const timerAt = (state, attributes = {}) => st("timer.kitchen", state, { friendly_name: "Kitchen", duration: "0:10:00", ...attributes });
const running = (seconds) => timerAt("active", { remaining: "0:10:00", finishes_at: new Date(NOW + seconds * 1000).toISOString() });

/* A warning as Meteoalarm writes it, with its times this many minutes from NOW. */
const capTime = (minutes) => new Date(NOW + minutes * 60000).toISOString().replace(".000Z", "+00:00");
const meteoalarm = (extra = {}) =>
  on("binary_sensor.meteoalarm", "meteoalarm", {
    event: "Severe forest-fire warning",
    severity: "Severe",
    effective: capTime(-60),
    onset: capTime(120),
    expires: capTime(180),
    headline: "Orange forest-fire",
    description: "High grass and heather fire hazard.",
    device_class: "safety",
    ...extra,
  });

/* Times on a server in UTC, read on a 24 hour clock in the server's zone. Updates keep both objects. */
const utcHass = (states, opts) => ({ ...makeHass(states, opts), config: { time_zone: "UTC" }, locale: { language: "en", time_format: "24", time_zone: "server" } });

test("the card registers once, with its editor and the version of package.json", () => {
  const w = makeWindow();
  same(w.customCards.map((c) => [c.type, c.name]), [["origami-notifications", "Origami Notifications"]], "picker entry");
  same(Boolean(w.customElements.get("origami-notifications-editor")), true, "editor");
  let error = null;
  try {
    w.eval(CODE);
  } catch (e) {
    error = e.message;
  }
  same([error, w.customCards.length], [null, 1], "loading the file twice changes nothing");
  same(/const VERSION = "([^"]+)"/.exec(CODE)[1], require("../package.json").version, "the version matches package.json");
});

test("an empty card hides the way Home Assistant expects, but shows in the editor and the card picker", () => {
  const w = makeWindow();
  const events = [];
  const el = w.document.createElement("origami-notifications");
  el.addEventListener("card-visibility-changed", (e) => events.push(e.detail.value));
  el.setConfig({ type: "x", updates: false, entities: ["binary_sensor.door"] });
  w.document.body.appendChild(el);
  const door = (state) => makeHass({ "binary_sensor.door": st("binary_sensor.door", state) });
  el.hass = door("off");
  same([el.hidden, el.connectedWhileHidden], [true, true], "hidden when empty, and still attached");
  el.hass = door("on");
  q(el, ".head").click();
  el.hass = door("off");
  el.hass = door("on");
  same([el.hidden, events, q(el, "ha-card").classList.contains("open")], [false, [false, true, false, true], false], "back, and closed, with something to show");
  el.preview = true;
  el.hass = door("off");
  same(el.hidden, false, "never hidden in the dashboard editor");
  const stub = w.customElements.get("origami-notifications").getStubConfig();
  const picker = w.document.createElement("hui-card-picker");
  picker.attachShadow({ mode: "open" });
  w.document.body.appendChild(picker);
  const preview = w.document.createElement("origami-notifications");
  preview.setConfig({ type: "x", ...stub });
  preview.hass = makeHass({});
  picker.shadowRoot.appendChild(preview);
  same([stub, preview.hidden, head(preview).title], [{}, false, "All quiet"], "the card picker shows an empty card");
});

test("a broken config gets a clear error, in the card and in the editor", () => {
  const w = makeWindow();
  const error = (config) => {
    try {
      w.document.createElement("origami-notifications").setConfig({ type: "x", ...config });
      return null;
    } catch (e) {
      return e.message.replace("origami-notifications: ", "");
    }
  };
  const info = (extra) => ({ infos: [{ entity: "weather.home", ...extra }] });
  const turns = "rotate must be the seconds between turns, or 0 to turn them off";
  const lead = "before must be minutes or a duration like 1:30:00";
  const slots = "forecast_slots must be a whole number above 0";
  const broken = [
    [{ entities: "sensor.door" }, "entities must be a list"],
    [{ entities: [{ name: "Washer" }] }, 'entities must contain entity ids, got {"name":"Washer"}'],
    [{ entities: [{ entity: "sensor.door", type: "nope" }] }, "unknown source type 'nope'"],
    [{ entities: [{ entity: "sensor.door", background: "yes" }] }, "background must be true or false"],
    [{ entities: [{ entity: "calendar.family", before: "soon" }] }, lead],
    [{ entities: [{ entity: "calendar.family", before: { weeks: 1 } }] }, lead],
    [{ vertical: "yes" }, "vertical must be true or false"],
    [{ rotate: -1 }, turns],
    [{ rotate: "fast" }, turns],
    [{ slide: "down" }, "slide must be up or side"],
    [{ weather: "sensor.rain" }, "weather must be a weather entity, e.g. weather.home"],
    [info({ forecast_type: "weekly" }), "forecast_type must be daily, hourly or twice_daily"],
    [info({ forecast_type: "daily", forecast_slots: 0 }), slots],
    [info({ forecast_type: "daily", forecast_slots: 2.5 }), slots],
    [info({ forecast_type: "daily", show_current: "no" }), "show_current must be true or false"],
    [{ infos: "sun.sun" }, "infos must be a list"],
    [{ infos: [{ name: "Sun" }] }, 'infos must contain entity ids, got {"name":"Sun"}'],
    [{ infos: [{ entity: "sun.sun", visibility: { condition: "user" } }] }, "visibility of sun.sun must be a list of conditions"],
  ];
  same(broken.map(([config]) => error(config)), broken.map(([, message]) => message), "each names the option");
  const fine = [
    { rotate: 0, slide: "side" },
    ...[30, "1:30:00", { days: 1, minutes: "15" }].map((before) => ({ entities: [{ entity: "calendar.family", before }] })),
    info({ forecast_type: "twice_daily", forecast_slots: 3, show_current: false, tap_action: "none" }),
  ];
  same(fine.map(error), fine.map(() => null), "what is right passes");
  const ed = w.document.createElement("origami-notifications-editor");
  assert.throws(() => ed.setConfig({ type: "x", entities: [{ name: "Washer" }] }), /entities must contain entity ids/, "the editor rejects it too");
});

test("older configs and dismissals still work", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const states = {
    "binary_sensor.door": on("binary_sensor.door", "Door"),
    "binary_sensor.back": on("binary_sensor.back", "Back"),
    "timer.kitchen": { ...running(600), last_changed: new Date(NOW - 60000).toISOString() },
  };
  const ts = (id) => Date.parse(states[id].last_changed);
  /* 0.2 kept the text, 0.3 added the time, and 0.4 kept the state and the time. */
  const acks = {
    "g:binary_sensor.door": "Door\u0000Open",
    "g:binary_sensor.back": "Back\u0000Open\u0000" + ts("binary_sensor.back"),
    "g:timer.kitchen": "#active\u0000" + ts("timer.kitchen"),
  };
  w.localStorage.setItem("origami-notifications-ack", JSON.stringify(acks));
  const hassOf = (extra) => makeHass({ ...states, ...extra }, { formatEntityState: (s) => (s.entity_id.startsWith("binary_sensor.") ? "Open" : s.state) });
  const el = mount(w, cfg(Object.keys(states)), hassOf());
  same(rows(el), [], "dismissals from 0.2, 0.3 and 0.4 hold");
  el.hass = hassOf({ "timer.kitchen": { ...running(900), last_changed: new Date(NOW).toISOString() } });
  same(titles(el), ["Kitchen"], "until it happens again");
  const loose = [
    { entity: "binary_sensor.gate", tap_action: "more-info", actions: [null, { label: "Open", tap_action: { action: "toggle" } }] },
    { entity: "binary_sensor.shed", tap_action: "none", actions: "Open" },
    { entity: "sensor.dinner", type: "recipe" },
    "todo.shopping",
  ];
  const old = mount(w, cfg(loose, { layout_options: { grid_rows: 4 } }), makeHass({
    "binary_sensor.gate": on("binary_sensor.gate", "Gate"),
    "binary_sensor.shed": on("binary_sensor.shed", "Shed"),
    "sensor.dinner": st("sensor.dinner", "Lasagne", { friendly_name: "Dinner", recipe: { name: "Lasagne" } }),
    "todo.shopping": st("todo.shopping", "3", { friendly_name: "Shopping" }),
  }));
  const sent = [];
  old.addEventListener("hass-action", (e) => sent.push(e.detail.config.tap_action.action));
  for (const title of ["Gate", "Shed"]) rowOf(old, title).querySelector(".rtile").click();
  same(
    [rows(old).map((r) => [r.title, r.body, r.actions]).sort(), sent, old.classList.contains("bounded")],
    [[["Gate", "on", ["Open"]], ["Lasagne", "Dinner", []], ["Shed", "on", []], ["Shopping", "3", []]], ["more-info"], true],
    "loose actions, type: recipe, a to-do list as in 0.4 and layout_options"
  );
});

test("system notifications, updates and repairs come from Home Assistant and go back to it", async () => {
  const w = makeWindow();
  const subs = [];
  const hass = makeHass({}, { subs });
  const el = mount(w, { type: "x", updates: false }, hass);
  notes(subs[0], { notification_id: "n1", title: "**New devices**", message: "![logo](/static/logo.png) We found [2 devices](/config/integrations/dashboard).\n\n- Hue" });
  same([rows(el).map((r) => [r.title, r.body]), picture(el, ".head .tile")], [[["New devices", "We found 2 devices.\n\nHue"]], "http://ha.local/static/logo.png"], "Markdown as plain text, with its first picture");
  const sent = actionsOf(el);
  q(el, ".row .rtile").click();
  dismiss(el);
  same([sent, services(hass)], [[{ tap_action: { action: "navigate", navigation_path: "/config/integrations/dashboard" } }], [["persistent_notification.dismiss", { notification_id: "n1" }]]], "a tap follows its link, a dismissal goes to Home Assistant");
  const update = (id, attributes, opts) => makeHass({ [id]: st(id, "on", { title: "RouterOS", latest_version: "7.15", supported_features: 1, ...attributes }) }, opts);
  const router = update("update.router");
  const up = mount(w, { type: "x" }, router);
  same(rows(up).map((r) => [r.title, r.body, r.actions]), [["RouterOS", "Update 7.15 available", ["Install"]]], "an update is found on its own");
  q(up, ".row .act").click();
  dismiss(up);
  same(services(router), [["update.install", { entity_id: "update.router" }], ["update.skip", { entity_id: "update.router" }]], "install and skip are calls to Home Assistant");
  const guest = update("update.tv", {}, { user: { id: "u2", is_admin: false }, wsReply: () => ({ issues: [{ domain: "hue", issue_id: "x", severity: "error" }] }) });
  const g = mount(w, { type: "x" }, guest);
  same(rows(g)[0].actions, [], "a non-admin can't install");
  dismiss(g);
  same([rows(g).length, guest.calls], [0, []], "and only hides it, without repairs");
  const issue = (domain, issue_id, severity, extra) => ({ domain, issue_id, severity, created: "2026-09-21T07:00:00+00:00", ...extra });
  const issues = [issue("zwave_js", "old_firmware", "warning", { translation_key: "old_firmware", breaks_in_ha_version: "2026.12" }), issue("cloud", "legacy", "critical"), issue("hue", "gone", "error", { ignored: true })];
  const names = { "component.cloud.title": "Home Assistant Cloud", "component.zwave_js.title": "Z-Wave" };
  const admin = makeHass({}, { wsReply: () => ({ issues }), loadBackendTranslation: () => Promise.resolve((k) => (k.includes("old_firmware") ? "Firmware is out of date" : names[k] || "")) });
  admin.user = null;
  const fix = mount(w, { type: "x" }, admin);
  await tick();
  same(admin.calls.length, 0, "repairs wait for the user");
  fix.hass = { ...admin, user: { id: "u1", is_admin: true } };
  await tick();
  same(rows(fix).map((r) => [r.title, r.body, r.tile]), [["Legacy", "Home Assistant Cloud", "rtile crit"], ["Firmware is out of date", "Stops working in 2026.12", "rtile warn"]], "an admin gets them, named by their integration");
  dismiss(fix);
  same(admin.calls.map((c) => c[1]), ["repairs/list_issues", "repairs/ignore_issue"], "a dismissal ignores the issue");
});

test("entities show what Home Assistant's formatters say, and alarms and smoke are urgent", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const states = {
    "sensor.load": st("sensor.load", "3", { friendly_name: "Load", unit_of_measurement: "%" }),
    "sensor.rain": st("sensor.rain", "0.0", { friendly_name: "Rain" }),
    "alarm_control_panel.house": st("alarm_control_panel.house", "triggered", { friendly_name: "House" }),
    "alarm_control_panel.shed": st("alarm_control_panel.shed", "disarmed", { friendly_name: "Shed" }),
    "alert.garage": on("alert.garage", "Garage open"),
    "binary_sensor.door": on("binary_sensor.door", "binary_sensor.door"),
    "binary_sensor.smoke": on("binary_sensor.smoke", "Smoke", { device_class: "smoke" }),
    "binary_sensor.battery": on("binary_sensor.battery", "Battery", { device_class: "battery" }),
  };
  const words = { "sensor.load": "3 %", "alarm_control_panel.house": "Triggered" };
  const el = mount(w, { type: "x", updates: false, entities: [...Object.keys(states).slice(0, 5), { entity: "binary_sensor.door", name: "Front door" }, "binary_sensor.smoke", "binary_sensor.battery"] }, makeHass(states, { formatEntityState: (s) => words[s.entity_id] || s.state }));
  same(
    [Object.fromEntries(rows(el).map((r) => [r.title, [r.body, r.tile, r.x]])), head(el).title, rows(el)[0].icon],
    [{ House: ["Triggered", "rtile crit", false], "Garage open": ["11 days ago", "rtile warn", true], Load: ["3 %", "rtile", true], "Front door": ["on", "rtile", true], Smoke: ["on", "rtile crit", true], Battery: ["on", "rtile warn", true] }, "House", "mdi:shield-alert"],
    "Home Assistant's words, urgency by kind and class, 0.0 is off, and a name"
  );
});

/* Calendars as Home Assistant writes them. While one is off, its attributes describe the next event. */
const calendars = (list) =>
  Object.fromEntries(Object.entries(list).map(([id, [state, message, start, all_day = false]]) => [id, st(id, state, { friendly_name: id, message, all_day, start_time: start, end_time: start })]));

test("a calendar shows a running event and, with before, the next one ahead, in the server's time zone", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const now = calendars({ "calendar.holiday": ["on", "Holiday", "2026-10-02 00:00:00", true], "calendar.standup": ["on", "Standup", "2026-10-02 09:30:00"], "calendar.later": ["off", "Later", "2026-10-02 15:00:00"] });
  same(Object.fromEntries(rows(mount(w, cfg(Object.keys(now)), utcHass(now))).map((r) => [r.title, r.body])), { Holiday: "today", Standup: "today at 09:30" }, "a running event shows, the next one waits");
  const trip = { ...makeHass(calendars({ "calendar.trip": ["on", "Flight", "2020-01-15 09:30:00"] })), config: { time_zone: "Pacific/Auckland" }, locale: { language: "en", time_format: "24", time_zone: "server" } };
  same(rows(mount(w, cfg(["calendar.trip"]), trip))[0].body, "on 01/15 at 09:30", "times are read in the server's time zone");
  const states = calendars({
    "calendar.waste": ["off", "Paper bin", "2026-10-02 18:00:00"],
    "calendar.family": ["off", "Dentist", "2026-10-02 15:00:00"],
    "calendar.holiday": ["off", "Holiday", "2026-10-03 00:00:00", true],
    "calendar.work": ["off", "Standup", "2026-10-03 09:00:00"],
    "calendar.gym": ["off", "Gym", "2026-10-02 12:30:00"],
  });
  const ahead = [{ entity: "calendar.waste", before: "12:00:00" }, { entity: "calendar.family", before: 60 }, { entity: "calendar.holiday", before: { days: 1 } }, { entity: "calendar.work", before: { hours: 24 } }, "calendar.gym"];
  const el = mount(w, cfg(ahead), utcHass(states));
  same(
    [rows(el).map((r) => [r.title, r.body]), whens(el), el.shadowRoot.querySelectorAll(".row .when")[1].dateTime, rows(el)[0].icon],
    [[["Paper bin", "today at 18:00"], ["Holiday", "tomorrow"], ["Standup", "tomorrow at 09:00"]], ["in 6 hr.", "tomorrow", "in 21 hr."], "2026-10-03", "mdi:calendar-month"],
    "as far ahead as before says, and an all-day event is a day"
  );
  mock.timers.tick(2 * 3600000 + 49);
  same(rows(el).length, 3, "not before its time");
  mock.timers.tick(1);
  same(rows(el)[0].title, "Dentist", "an hour ahead of the dentist");
});

test("a timer counts down while it runs, shows the time left while paused, and nothing while idle", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const add = { label: "Add a minute", tap_action: { action: "perform-action", perform_action: "timer.change" } };
  const paused = { ...timerAt("paused", { remaining: "0:03:12" }), last_changed: new Date(NOW - 120000).toISOString() };
  const hassOf = (timer) => makeHass({ "timer.kitchen": timer }, { formatEntityState: (s) => (s.state === "active" ? "Active" : "Paused") });
  const el = mount(w, { type: "x", updates: false, entities: [{ entity: "timer.kitchen", actions: [add] }] }, hassOf(running(300)));
  same(
    [head(el).title, q(el, ".head .eta").textContent, q(el, ".head .eta").getAttribute("aria-live"), rows(el).map((r) => [r.body, r.icon, r.actions])],
    ["Kitchen", "5:00", "off", [["Active", "mdi:timer-outline", ["Pause", "Cancel", "Add a minute"]]]],
    "the head counts down quietly, and its buttons come first"
  );
  const row = q(el, ".row");
  mock.timers.tick(1000);
  same([q(el, ".head .eta").textContent, whens(el)[0], q(el, ".row") === row], ["4:59", "4:59", true], "by the second, in place");
  const sent = actionsOf(el);
  for (const button of [...el.shadowRoot.querySelectorAll(".row .act")].slice(0, 2)) button.click();
  el.hass = hassOf(paused);
  q(el, ".row .act").click();
  same(sent.map((a) => [a.entity, a.tap_action.perform_action]), [["timer.kitchen", "timer.pause"], ["timer.kitchen", "timer.cancel"], ["timer.kitchen", "timer.start"]], "Home Assistant runs pause, cancel and resume");
  same([q(el, ".head .msg .t").textContent, rows(el)[0].actions, whens(el)], ["Paused, 3:12 left", ["Resume", "Cancel", "Add a minute"], ["2 min. ago"]], "paused, it shows the time left");
  el.hass = hassOf(timerAt("idle"));
  same(el.hidden, true, "nothing while it is idle");
  el.hass = hassOf(running(300));
  dismiss(el);
  el.hass = hassOf(running(300));
  same(rows(el).length, 0, "dismissed while it runs");
  el.hass = hassOf(running(600));
  same(rows(el).length, 1, "back once it starts again");
});

test("a timestamp or duration sensor counts down to its end, and goes when it ends", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const left = (state, unit, changed = NOW - 10000) => ({ ...st("sensor.dishwasher", state, { friendly_name: "Dishwasher", device_class: "duration", unit_of_measurement: unit }), last_changed: new Date(changed).toISOString() });
  const hassOf = (state) => utcHass({ "sensor.dishwasher": state }, { formatEntityState: (s) => s.state + " " + s.attributes.unit_of_measurement });
  const config = cfg([{ entity: "sensor.dishwasher", type: "countdown" }]);
  const end = (el) => (q(el, ".row .when") || {}).dateTime || null;
  const at = (minutes) => new Date(NOW + minutes * 60000).toISOString();
  const el = mount(w, config, hassOf(left("25", "min")));
  same([q(el, ".head .eta").textContent, end(el), rows(el)[0].body], ["in 25 min.", at(25), "Oct 2, 2026, 12:25"], "24:50 counts as 25 minutes");
  alone(el);
  dismiss(el);
  el.hass = hassOf(left("23", "min", NOW + 110000));
  same(rows(el).length, 0, "a new estimate keeps it dismissed");
  el.hass = hassOf(left("40", "min", NOW + 60000));
  same(end(el), at(41), "a new end brings it back");
  const alarm = (ms) => ({ "sensor.alarm": st("sensor.alarm", new Date(NOW + ms).toISOString(), { friendly_name: "Alarm", device_class: "timestamp" }) });
  const next = mount(w, cfg(["sensor.alarm"]), makeHass(alarm(25 * 60000 + 40000)));
  same([q(next, ".head .eta").textContent, q(next, ".row").dataset.kind, rows(next)[0].icon, end(next)], ["in 26 min.", "countdown", "mdi:timer-sand", at(26)], "a timestamp counts down");
  same(rows(mount(w, cfg(["sensor.alarm"]), makeHass(alarm(-60000)))).length, 0, "nothing once it is behind");
  mock.timers.tick(41 * 60000 + 49);
  same(rows(el).length, 1, "not before its end");
  mock.timers.tick(1);
  same([rows(el).length, rows(next).length], [0, 0], "then each goes by itself");
});

/* A to-do item as the subscription sends it, and the subscriptions a card made for its lists. */
const todoItem = (uid, summary, due, status = "needs_action") => ({ uid, summary, status, due });
const todoSubs = (subs) => subs.filter((s) => s.msg && s.msg.type === "todo/item/subscribe");

test("a to-do list shows what is due and marks it done", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const subs = [];
  const states = { "todo.shopping": st("todo.shopping", "5", { friendly_name: "Shopping", supported_features: 15 }), "todo.chores": st("todo.chores", "2", { friendly_name: "Chores", supported_features: 1 }) };
  const el = mount(w, cfg([{ entity: "todo.shopping", type: "todo" }, { entity: "todo.chores", type: "todo", before: "48:00:00" }]), utcHass(states, { subs }));
  same([todoSubs(subs).map((s) => s.msg.entity_id), rows(el)], [["todo.shopping", "todo.chores"], []], "one subscription for each list, and no entry for the count");
  const [shopping, chores] = todoSubs(subs);
  const groceries = [todoItem("1", "Milk", "2026-10-02"), todoItem("2", "Bread", "2026-10-02T15:00:00+00:00"), todoItem("3", "Eggs", "2026-10-01", "completed"), todoItem("4", "Cheese", null), todoItem("5", "Butter", "2026-10-03T09:00:00+00:00"), todoItem("6", "Tea", "2026-09-30")];
  shopping.cb({ items: groceries });
  chores.cb({ items: [todoItem("a", "Vacuum", "2026-10-04"), todoItem("b", "Taxes", "2026-10-05")] });
  same(
    [rows(el).map((r) => [r.title, r.body, r.actions]), whens(el), rows(el)[0].icon],
    [[["Bread", "Shopping", ["Done"]], ["Milk", "Shopping", ["Done"]], ["Vacuum", "Chores", []], ["Tea", "Shopping", ["Done"]]], ["in 3 hr.", "today", "on 10/04", "on 09/30"], "mdi:clipboard-check-outline"],
    "open items due by tonight, overdue or within before, and Done where possible"
  );
  const sent = actionsOf(el);
  q(el, ".row .act").click();
  q(el, ".row .rtile").click();
  same(
    sent.map((a) => a.tap_action),
    [{ action: "perform-action", perform_action: "todo.update_item", target: { entity_id: "todo.shopping" }, data: { item: "2", status: "completed" } }, { action: "navigate", navigation_path: "/todo?entity_id=todo.shopping" }],
    "Done completes the item and a tap opens the list"
  );
  shopping.cb({ items: groceries.map((it) => (it.uid === "2" ? { ...it, status: "completed" } : it)) });
  same(titles(el), ["Milk", "Vacuum", "Tea"], "a completed item goes");
  dismiss(el);
  shopping.cb({ items: groceries.slice(0, 1) });
  same(titles(el), ["Vacuum"], "dismissed");
  shopping.cb({ items: [todoItem("1", "Milk", "2026-10-02T18:00:00+00:00")] });
  same(titles(el), ["Milk", "Vacuum"], "back once it is due at another time");
});

/* Devices as Home Assistant writes them. */
const deviceStates = () => ({
  "lock.front_door": st("lock.front_door", "unlocked", { friendly_name: "Front door" }),
  "cover.garage": st("cover.garage", "open", { friendly_name: "Garage", supported_features: 15 }),
  "valve.garden": st("valve.garden", "opening", { friendly_name: "Garden", supported_features: 3 }),
  "vacuum.robo": st("vacuum.robo", "cleaning", { friendly_name: "Robo", supported_features: 16 }),
  "lawn_mower.lawn": st("lawn_mower.lawn", "returning", { friendly_name: "Mower", supported_features: 7 }),
  "siren.hall": on("siren.hall", "Siren", { supported_features: 3 }),
});

test("a lock, a cover, a valve, a vacuum, a mower and a siren show while active", () => {
  const w = makeWindow();
  const hold = { label: "Hold", tap_action: { action: "perform-action", perform_action: "script.hold" } };
  const el = mount(w, cfg(["lock.front_door", { entity: "cover.garage", actions: [hold] }, "valve.garden", "vacuum.robo", "lawn_mower.lawn", "siren.hall"]), makeHass(deviceStates(), { formatEntityState: (s) => s.state.toUpperCase() }));
  same(
    [rows(el).map((r) => [r.title, r.body, r.tile, r.actions]), new Set([...el.shadowRoot.querySelectorAll(".row")].map((r) => r.dataset.kind + " " + r.querySelector("ha-icon").getAttribute("icon"))).size],
    [
      [
        ["Siren", "ON", "rtile crit", ["Turn off"]],
        ["Garage", "OPEN", "rtile", ["Close", "Hold"]],
        ["Mower", "RETURNING", "rtile", ["Dock"]],
        ["Front door", "UNLOCKED", "rtile", ["Lock"]],
        ["Robo", "CLEANING", "rtile", ["Dock"]],
        ["Garden", "OPENING", "rtile", ["Close"]],
      ],
      1,
    ],
    "found on their own, a sounding siren first, with their buttons"
  );
  const sent = actionsOf(el);
  for (const row of el.shadowRoot.querySelectorAll(".row")) row.querySelector(".act").click();
  same(
    sent.map((a) => [a.tap_action.perform_action, a.tap_action.target.entity_id, a.tap_action.confirmation || false]),
    [["siren.turn_off", "siren.hall", false], ["cover.close_cover", "cover.garage", true], ["lawn_mower.dock", "lawn_mower.lawn", false], ["lock.lock", "lock.front_door", false], ["vacuum.return_to_base", "vacuum.robo", false], ["valve.close_valve", "valve.garden", true]],
    "Home Assistant runs the buttons and asks before closing"
  );
  /* Each case is an entity of its own, so one card shows them all. */
  const cases = [["lock", "locked"], ["cover", "unknown"], ["lock", "jammed"], ["cover", "open", { supported_features: 1 }], ["vacuum", "error", { supported_features: 16 }]];
  const states = Object.fromEntries(cases.map(([domain, state, attributes], i) => [domain + ".c" + i, st(domain + ".c" + i, state, { friendly_name: "c" + i, ...attributes })]));
  const found = Object.fromEntries(rows(mount(w, cfg([...Object.keys(states), { entity: "media_player.tv", type: "device" }]), makeHass({ ...states, "media_player.tv": st("media_player.tv", "playing") }))).map((r) => [r.title, [r.tile, r.actions]]));
  same(
    [...cases.map((c, i) => found["c" + i] || null), found["media_player.tv"]],
    [null, null, ["rtile warn", ["Lock"]], ["rtile", []], ["rtile warn", ["Dock"]], ["rtile", []]],
    "nothing while idle, a jam or an error warns, and buttons only where Home Assistant offers them"
  );
});

test("DWD and Meteoalarm warnings follow their level, and Meteoalarm's expire", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const warning = (i, headline, level, start) => ({ ["warning_" + i + "_headline"]: headline, ["warning_" + i + "_level"]: level, ["warning_" + i + "_start"]: start });
  const dwd = mount(w, { type: "x", entities: ["sensor.dwd"] }, makeHass({
    "sensor.dwd": st("sensor.dwd", "2", { warning_count: 2, ...warning(1, "Sturm", 3, "2026-09-21T08:00:00+00:00"), ...warning(2, "Glatteis", 2, "2026-09-21T11:00:00+00:00") }),
    "update.router": st("update.router", "on", { title: "RouterOS", latest_version: "7.15" }),
  }));
  same([rows(dwd).map((r) => [r.title, r.tile]), head(dwd)], [[["Sturm", "rtile crit"], ["Glatteis", "rtile warn"], ["RouterOS", "rtile"]], { title: "Sturm", badge: "3" }], "DWD level 3 is critical and goes first, then the newest");
  const card = (state) => mount(w, cfg(["binary_sensor.meteoalarm"]), makeHass({ "binary_sensor.meteoalarm": state }));
  same(["Extreme", "Severe", "Moderate", "Minor"].map((severity) => rows(card(meteoalarm({ severity })))[0].tile), ["rtile crit", "rtile crit", "rtile warn", "rtile"], "Meteoalarm follows its severity");
  const el = mount(w, { type: "x", updates: false, entities: ["binary_sensor.meteoalarm"] }, makeHass({ "binary_sensor.meteoalarm": meteoalarm() }));
  same(
    [rows(el).map((r) => [r.title, r.body, r.icon, r.x]), q(el, ".row").dataset.kind, whens(el)],
    [[["Orange forest-fire", "High grass and heather fire hazard.", "mdi:alert-circle", true]], "warning", ["in 2 hr."]],
    "found on its own, from its onset"
  );
  mock.timers.tick(180 * 60000 + 49);
  same(el.hidden, false, "not before it expires");
  mock.timers.tick(1);
  same(el.hidden, true, "then it goes by itself");
});

/* A NINA warning slot as Home Assistant writes it from 2026.11, with only the id of its warning left, and what
 * get_details answers for a warning. */
const NINA = "binary_sensor.berlin_warning_1";
const ninaSlot = (id, extra = {}) => on(NINA, "Berlin Warning 1", { id, device_class: "safety", ...extra });
const ninaAnswer = (headline, severity) => ({ headline, description: "Hot on Friday.<br/><br/>Less on Saturday.", severity, start: "2026-10-02T10:00:00+02:00", sent: "2026-10-02T09:59:50+02:00" });

test("a NINA warning asks Home Assistant for its details once", async () => {
  const w = makeWindow();
  const answers = { heat: ninaAnswer("HITZE", "Severe"), gusts: ninaAnswer("STURMBÖEN", "Moderate") };
  /* Home Assistant refuses get_details without a request for the response, and answers per entity. */
  const flags = [];
  let hass;
  const reply = (d, s, data, target, notifyOnError, returnResponse) => {
    flags.push([notifyOnError, returnResponse]);
    const answer = answers[hass.states[target.entity_id].attributes.id];
    return returnResponse ? { response: { [target.entity_id]: answer } } : Promise.reject(new Error("service_lacks_response_request"));
  };
  const at = (slot) => (hass = makeHass({ [NINA]: ninaSlot(slot) }, { entities: { [NINA]: { platform: "nina", labels: [] } }, services: { nina: { get_details: {} } }, serviceReply: reply }));
  const asked = () => services(hass).length;
  const el = mount(w, cfg([NINA]), at("heat"));
  same([rows(el).map((r) => [r.title, r.x]), q(el, ".row").dataset.kind, services(hass), flags], [[["Berlin Warning 1", false]], "warning", [["nina.get_details", {}, { entity_id: NINA }]], [[false, true]]], "found by its platform, it shows its name while Home Assistant looks it up");
  await tick();
  same([rows(el).map((r) => [r.title, r.body, r.tile]), q(el, ".row .when").dateTime], [[["HITZE", "Hot on Friday.\n\nLess on Saturday.", "rtile crit"]], "2026-10-02T08:00:00.000Z"], "then the warning, as plain text, from its start");
  el.hass = at("heat");
  same([titles(mount(w, cfg([NINA]), hass)), asked()], [["HITZE"], 0], "the same warning is not asked again");
  el.hass = at("gusts");
  same([titles(el), asked()], [["Berlin Warning 1"], 1], "a slot that switches to another warning asks again");
  await tick();
  same(rows(el).map((r) => [r.title, r.tile]), [["STURMBÖEN", "rtile warn"]]);
});

/* A weather entity as Home Assistant writes it, with an hourly forecast unless told otherwise. */
const weatherAt = (state = "cloudy", attributes = {}, id = "weather.home") =>
  st(id, state, { friendly_name: "Home", temperature: 12, temperature_unit: "°C", precipitation_unit: "mm", supported_features: 2, ...attributes });
/* An hourly forecast from the top of the mocked hour on, one entry per argument. */
const hourly = (...hours) => hours.map((h, i) => ({ datetime: new Date(NOW + i * 3600000).toISOString(), condition: "cloudy", temperature: 10, ...h }));
const windowOn = (id, state = "on") => ({ [id]: st(id, state, { device_class: "window", friendly_name: id.split(".")[1] }) });
/* A card with only the weather, and the forecast subscription it opened. Cards in one window share
 * the forecast of an entity, so a card that needs its own takes another entity. */
const weatherCard = (w, id, states = {}, opts = {}) => {
  const subs = [];
  const hass = makeHass({ [id]: weatherAt("cloudy", {}, id), ...states }, { subs, ...opts });
  hass.formatEntityAttributeValue = (s, attribute, value) => (value === undefined ? s.attributes[attribute] : value) + " " + s.attributes.temperature_unit;
  const el = mount(w, cfg([], { weather: id }), hass);
  return [el, subs.find((s) => s.msg && s.msg.type === "weather/subscribe_forecast"), hass];
};
const shownRows = (el) => rows(el).map((r) => [r.title, r.body, r.tile, r.icon]);

test("rain, snow and frost ahead show the hour they start", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const [el, sub] = weatherCard(w, "weather.home");
  same(sub.msg, { type: "weather/subscribe_forecast", entity_id: "weather.home", forecast_type: "hourly" }, "the card asks for the hourly forecast");
  sub.cb({ type: "hourly", forecast: hourly({}, {}, {}, { condition: "rainy", precipitation_probability: 70 }) });
  same([shownRows(el), q(el, ".row").dataset.kind, q(el, ".row .when").dateTime], [[["Rain from 3 PM", "70% chance", "rtile", "mdi:weather-rainy"]], "weather", new Date(NOW + 3 * 3600000).toISOString()], "the first wet hour, with its chance");
  const of = (...hours) => {
    sub.cb({ type: "hourly", forecast: hourly(...hours) });
    return titles(el)[0] || null;
  };
  same(
    [of({}, { condition: "snowy" }), of({}, { condition: "lightning-rainy" }), of({}, { condition: "rainy", temperature: 1 }), of({}, { precipitation: 0.2 }), of({}, {}, {}, {}, {}, {}, { condition: "pouring" }), of({ precipitation: 0.1, precipitation_probability: 59 })],
    ["Snow from 1 PM", "Thunderstorms from 1 PM", "Snow from 1 PM", "Rain from 1 PM", null, null],
    "snow and thunder by name, and nothing beyond six hours or below the marks"
  );
  const [frost, fsub] = weatherCard(w, "weather.cold", { "weather.cold": weatherAt("clear-night", { temperature: 3 }, "weather.cold") });
  fsub.cb({ type: "hourly", forecast: hourly({ temperature: 3 }, { temperature: 1 }, { temperature: -1 }, { temperature: -3 }, { temperature: -2 }) });
  same(shownRows(frost), [["Frost from 2 PM", "Low of -3 °C", "rtile", "mdi:snowflake-thermometer"]], "frost with its hour and low");
});

test("rain with an open window is a warning", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const all = { "binary_sensor.all": on("binary_sensor.all", "All", { device_class: "window", entity_id: ["binary_sensor.kitchen"] }) };
  const two = { ...windowOn("binary_sensor.kitchen"), ...windowOn("cover.roof", "open"), ...all };
  const [el, sub, hass] = weatherCard(w, "weather.home", two);
  const windows = (states) => (el.hass = { ...hass, states: { "weather.home": weatherAt(), ...states } });
  sub.cb({ type: "hourly", forecast: hourly({}, { condition: "rainy", precipitation_probability: 90 }) });
  same(shownRows(el), [["Rain from 1 PM", "2 windows open", "rtile warn", "mdi:weather-rainy"]], "a warning that counts the open windows");
  const one = { ...two, ...windowOn("cover.roof", "closed"), ...windowOn("cover.attic", "unavailable") };
  const shut = { ...one, ...windowOn("binary_sensor.kitchen", "off") };
  windows(shut);
  same(rows(el).map((r) => [r.body, r.tile]), [["90% chance", "rtile"]], "a closed or unavailable window does not count");
  dismiss(el);
  windows(one);
  same(rows(el).map((r) => r.body), ["1 window open"], "a dismissed hint comes back as a warning");
  windows(shut);
  same(rows(el).map((r) => r.body), ["90% chance"], "and the hint is back once it is closed");
});

/* Window sensors with the rooms Home Assistant's registries give them. The kitchen window has a room of
 * its own, the bath window that of its device, and the office window none. */
const windowAt = (id, name, changed) => ({ ...on(id, name, { device_class: "window" }), last_changed: changed });
const KITCHEN = windowAt("binary_sensor.kitchen_window", "Kitchen window", "2026-09-21T10:00:00+00:00");
const BATH = windowAt("binary_sensor.bath_window", "Bath window", "2026-09-21T10:30:00+00:00");
const OFFICE = windowAt("binary_sensor.office_window", "Office window", "2026-09-21T11:00:00+00:00");
const ROOMS = {
  entities: { "binary_sensor.kitchen_window": { area_id: "kitchen", device_id: "kitchen_contact" }, "binary_sensor.bath_window": { device_id: "bath_contact" } },
  devices: { kitchen_contact: { area_id: "hall" }, bath_contact: { area_id: "bath" } },
  areas: { kitchen: { name: "Kitchen" }, bath: { name: "Bath" }, hall: { name: "Hall" } },
};
const statesOf = (...list) => Object.fromEntries(list.map((s) => [s.entity_id, s]));
const WINDOWS = cfg([KITCHEN, BATH, OFFICE].map((s) => s.entity_id));

test("open windows become one entry with their rooms, and its dismissal covers each window", () => {
  const w = makeWindow();
  const hass = makeHass(statesOf(KITCHEN, BATH, OFFICE), { entities: ROOMS.entities });
  const later = mount(w, WINDOWS, hass);
  same(rows(later).map((r) => [r.title, r.body]), [["3 windows open", "Office window, Bath window, Kitchen window"]], "until the rooms are there, each goes by its name");
  later.hass = { ...hass, areas: ROOMS.areas, devices: ROOMS.devices };
  same(rows(later)[0].body, "Office window, Bath, Kitchen", "then by its room, its own before its device's");
  const el = mount(w, WINDOWS, makeHass(statesOf(KITCHEN, BATH), ROOMS));
  same(
    [rows(el).map((r) => [r.title, r.body, r.icon]), q(el, ".row").dataset.kind, q(el, ".row .when").dateTime, head(el).badge],
    [[["2 windows open", "Bath, Kitchen", "mdi:google-circles-communities"]], "group", "2026-09-21T10:30:00.000Z", "1"],
    "one entry, newest first"
  );
  alone(el);
  dismiss(el);
  same(Object.keys(JSON.parse(w.localStorage.getItem("origami-notifications-ack"))).sort(), ["g:binary_sensor.bath_window", "g:binary_sensor.kitchen_window"], "a dismissal keeps one for each window");
  el.hass = makeHass(statesOf(KITCHEN, BATH, OFFICE), ROOMS);
  same([rows(el).map((r) => [r.title, r.body]), q(el, ".row").dataset.kind], [[["Office window", "on"]], "generic"], "a window that opens later shows alone and new");
  el.hass = makeHass(statesOf({ ...KITCHEN, last_changed: "2026-09-21T12:00:00+00:00" }, BATH, OFFICE), ROOMS);
  same(rows(el).map((r) => r.body), ["Kitchen, Office window"], "a window that opens again joins the next group");
});

test("a label adds every entity that carries it, and attributes and pictures describe an entry", () => {
  const w = makeWindow();
  const labelled = { "binary_sensor.door": { labels: ["notify"] }, "binary_sensor.window": { labels: [] } };
  const doors = { "binary_sensor.door": on("binary_sensor.door", "Door"), "binary_sensor.window": on("binary_sensor.window", "Window") };
  same(titles(mount(w, { type: "x", updates: false, label: "notify" }, makeHass(doors, { entities: labelled }))), ["Door"], "a label adds the entities that carry it");
  const hass = makeHass({
    "sensor.dinner": st("sensor.dinner", "Lasagne", { friendly_name: "Dinner", recipe: { name: "Lasagne", image: "/local/lasagne.jpg" } }),
    "sensor.book": st("sensor.book", "Dune", { friendly_name: "Book", cover: "https://img.test/dune.jpg", shelf: { title: "Sci-fi" } }),
    "sensor.bins": st("sensor.bins", "1", { friendly_name: "Bins", next: "2026-10-05T06:00:00+00:00" }),
    "sensor.parcel": st("sensor.parcel", "1", { friendly_name: "Parcel", item: { name: "Shoes", description: { text: "x" } } }),
    "binary_sensor.hall": on("binary_sensor.hall", "Hall door", { zone: { name: "Hall" } }),
  });
  hass.formatEntityAttributeValue = (s, attr, value) => (attr === "next" ? "October 5" : String(value));
  const config = cfg([
    { entity: "sensor.dinner", background: true },
    { entity: "sensor.book", type: "picture", image: "cover" },
    { entity: "sensor.bins", attribute: "next" },
    { entity: "sensor.parcel", attribute: "item" },
    "binary_sensor.hall",
  ]);
  const el = mount(w, config, hass);
  same(
    Object.fromEntries(rows(el).map((r) => [r.title, r.body])),
    { Lasagne: "Dinner", Dune: "Book", "October 5": "Bins", Shoes: "Parcel", "Hall door": "on" },
    "an attribute describes the entry, formatted by Home Assistant"
  );
  same(["Lasagne", "Dune"].map((title) => rowOf(el, title).querySelector(".rtile img").getAttribute("src")), ["http://ha.local/local/lasagne.jpg", "https://img.test/dune.jpg"], "pictures from an attribute, local or not");
  const backdrop = (id) => picture(mount(w, config, { ...hass, states: { ...hass.states, [id]: { ...hass.states[id], last_changed: "2026-09-21T11:00:00+00:00" } } }), ".backdrop");
  same([backdrop("sensor.dinner"), backdrop("sensor.book")], ["http://ha.local/local/lasagne.jpg", null], "the background comes from the entry on top");
});

test("audience rules show a source only to the people they name", () => {
  const w = makeWindow();
  const subs = [];
  const states = {
    "person.anna": st("person.anna", "home", { user_id: "u1" }),
    "update.router": st("update.router", "on", { title: "RouterOS", latest_version: "7.15" }),
    "update.nas": st("update.nas", "on", { title: "NAS", latest_version: "2" }),
    "binary_sensor.door": on("binary_sensor.door", "Door"),
  };
  const anna = { user: { id: "u1" } };
  const except = { except: ["person.anna"] };
  const system = mount(w, cfg([], { audience: { system: except } }), makeHass(states, { subs, ...anna }));
  notes(subs[0], { notification_id: "n1", message: "hi" });
  same(rows(system).length, 0, "system notifications except for Anna");
  same(rows(mount(w, { type: "x", entities: ["update.router"], audience: { updates: except } }, makeHass(states, anna))).length, 0, "the updates rule covers listed and found updates");
  same(titles(mount(w, { type: "x", audience: { "update.nas": except } }, makeHass(states, anna))), ["RouterOS"], "a rule for one update covers that one");
  const only = cfg(["binary_sensor.door"], { audience: { "binary_sensor.door": { only: ["person.anna"] } } });
  same([anna, { user: { id: "u2" } }].map((user) => rows(mount(w, only, makeHass(states, user))).length), [1, 0], "an only rule shows a source to the listed people alone");
});

test("a dismissal hides an entry in every card of this browser until it happens again", () => {
  const w = makeWindow();
  const door = (state, at) => ({ ...st("binary_sensor.door", state, { friendly_name: "Door" }), last_changed: at });
  const states = { "binary_sensor.door": door("on", "2026-09-21T10:00:00+00:00"), "binary_sensor.window": on("binary_sensor.window", "Window") };
  const config = cfg(Object.keys(states));
  const a = mount(w, config, makeHass(states));
  const b = mount(w, config, makeHass(states));
  q(a, ".head").click();
  const x = rowOf(a, "Door").querySelector(".x");
  x.focus();
  x.click();
  const focused = a.shadowRoot.activeElement;
  same([titles(a), focused && focused.closest(".row").querySelector(".title").textContent], [["Window"], "Window"], "gone at once, and keyboard focus moves to the next row");
  same([titles(b), titles(mount(w, config, makeHass(states)))], [["Window"], ["Window"]], "also in another card, and in one that comes later");
  a.hass = makeHass({ ...states, "binary_sensor.door": door("off", "2026-09-21T10:05:00+00:00") });
  a.hass = makeHass({ ...states, "binary_sensor.door": door("on", "2026-09-21T11:00:00+00:00") });
  same(titles(a), ["Door", "Window"], "back when the door opens again");
  const bins = (next) => makeHass({ "sensor.bins": st("sensor.bins", "1", { friendly_name: "Bins", next }) });
  const paper = { name: "Paper", description: "Put it out tonight" };
  const once = mount(w, cfg(["sensor.bins"]), bins(paper));
  dismiss(once);
  once.hass = bins(paper);
  same(rows(once).length, 0, "an attribute row has no time, so it stays away");
  once.hass = bins(null);
  once.hass = bins(paper);
  same(rows(once).length, 1, "until its attribute was empty");
});

test("Home Assistant confirms a dismissal later, clear all dismisses everything, and blocked storage still dismisses", async () => {
  const w = makeWindow();
  const warnings = [];
  w.console.warn = (...args) => warnings.push(args.join(" "));
  const subs = [];
  const hass = makeHass({}, { subs });
  const answers = [];
  hass.callService = () => new Promise((resolve, reject) => answers.push({ resolve, reject }));
  const el = mount(w, cfg([]), hass);
  const note = (id) => ({ notification_id: id, title: "Backup " + id, message: "done" });
  notes(subs[0], note("n1"), note("n2"));
  dismiss(el);
  same([rows(el).length, answers.length], [1, 1], "gone before Home Assistant answers");
  answers[0].reject(new Error("refused"));
  await tick();
  same([rows(el).length, warnings.length], [2, 1], "back when Home Assistant refuses");
  dismiss(el);
  answers[1].resolve();
  await tick();
  same(rows(el).length, 1, "still away once confirmed");
  const all = [];
  const states = statesOf(KITCHEN, BATH, on("binary_sensor.door", "Door"));
  const busy = makeHass(states, { subs: all, ...ROOMS });
  const full = mount(w, cfg(Object.keys(states)), busy);
  notes(all[0], note("a"), note("b"));
  q(full, ".clear").click();
  same(
    [rows(full).length, services(busy).length, Object.keys(JSON.parse(w.localStorage.getItem("origami-notifications-ack"))).sort()],
    [0, 2, ["g:binary_sensor.bath_window", "g:binary_sensor.door", "g:binary_sensor.kitchen_window"]],
    "clear all dismisses every entry"
  );
  const blocked = makeWindow();
  blocked.Storage.prototype.setItem = () => {
    throw new blocked.DOMException("blocked", "QuotaExceededError");
  };
  const door = { "binary_sensor.door": on("binary_sensor.door", "Door") };
  const page = mount(blocked, cfg(["binary_sensor.door"]), makeHass(door));
  dismiss(page);
  page.hass = makeHass(door);
  same(rows(page).length, 0, "a dismissal holds where storage is blocked");
});

/* DWD warns ahead of time, so its warnings bring times that lie ahead. Each warning is a title and
 * its start in minutes from NOW. */
const dwdAt = (...warnings) => {
  const attributes = { warning_count: warnings.length };
  warnings.forEach(([headline, minutes], i) => {
    attributes["warning_" + (i + 1) + "_headline"] = headline;
    attributes["warning_" + (i + 1) + "_level"] = 2;
    attributes["warning_" + (i + 1) + "_start"] = new Date(NOW + minutes * 60000).toISOString();
  });
  return { "sensor.dwd": st("sensor.dwd", warnings.length ? "2" : "0", attributes) };
};

test("times read like Home Assistant's, and the entry closest to now comes first", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const subs = [];
  const behind = { "binary_sensor.door": changedAt("binary_sensor.door", "Door", 600), "binary_sensor.gate": changedAt("binary_sensor.gate", "Gate", -1000) };
  const ahead = mount(w, cfg(Object.keys(behind)), makeHass(behind, { subs }));
  same([titles(ahead), whens(ahead), ahead._clock], [["Door", "Gate"], ["just now", "just now"], null], "the past stays behind when the server clock runs ahead");
  const dwd = mount(w, cfg(["sensor.dwd"]), makeHass(dwdAt(["a", -20], ["b", 5], ["c", -120], ["d", 180])));
  same([titles(dwd), head(dwd).title], [["b", "a", "c", "d"], "b"], "closest first, ahead or behind");
  const states = { "binary_sensor.door": changedAt("binary_sensor.door", "Door", -120000), ...dwdAt(["Frost", 10]) };
  const swap = mount(w, cfg(Object.keys(states), { rotate: 0 }), makeHass(states));
  mock.timers.tick(4 * 60000 + 49);
  same(head(swap).title, "Door", "behind comes first until both are as close");
  mock.timers.tick(1);
  same(titles(swap), ["Frost", "Door"], "then the entry ahead comes first");
  const when = (state) => whens(mount(w, cfg(Object.keys(state)), makeHass(state)))[0];
  const ago = (s) => ({ "binary_sensor.door": { ...on("binary_sensor.door", "Door"), last_changed: new Date(Date.now() - s * 1000).toISOString() } });
  const soon = (s) => ({ "sensor.dwd": st("sensor.dwd", "1", { warning_count: 1, warning_1_headline: "Frost", warning_1_level: 2, warning_1_start: new Date(Date.now() + s * 1000).toISOString() }) });
  same([when(ago(3580)), when(ago(23.8 * 3600)), when(soon(30)), when(soon(120))], ["1 hr. ago", "yesterday", "in a moment", "in 2 min."], "a time rounds before it picks a unit");
});

test("the clock runs on the minute while a time lies ahead or the list is open", () => {
  useClock(NOW + 15000);
  const w = makeWindow({ clock: true });
  const hass = makeHass(dwdAt(["past", -5]));
  const el = mount(w, { type: "x", updates: false, entities: ["sensor.dwd"] }, hass);
  const when = () => whens(el)[0];
  same(el._clock, null, "nothing changes on a closed card");
  el.hass = { ...hass, states: dwdAt(["past", -5], ["ahead", 3]) };
  const row = q(el, ".row");
  mock.timers.tick(44999);
  same(when(), "in 3 min.", "not before the minute");
  mock.timers.tick(1);
  same([when(), q(el, ".row") === row], ["in 2 min.", true], "on the minute, in place");
  el.hass = hass;
  same(el._clock, null, "it stops once nothing lies ahead");
  q(el, ".head").click();
  same([when(), Boolean(el._clock)], ["6 min. ago", true], "and runs while the list is open");
  el._io.fire(false);
  mock.timers.tick(120000);
  same([when(), el._clock], ["6 min. ago", null], "but not off screen");
  el._io.fire(true);
  same(when(), "8 min. ago", "and catches up back on screen");
  el.remove();
  same([el._clock, el._io.disconnected], [null, true], "it stops with the card gone");
});

test("an entry for a day reads today or tomorrow, and turns at midnight", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const subs = [];
  const states = { "todo.shopping": st("todo.shopping", "1", { friendly_name: "Shopping" }), "todo.chores": st("todo.chores", "1", { friendly_name: "Chores" }) };
  const el = mount(w, cfg([{ entity: "todo.shopping", type: "todo", before: "36:00:00" }, { entity: "todo.chores", type: "todo" }]), utcHass(states, { subs }));
  const [shopping, chores] = todoSubs(subs);
  shopping.cb({ items: [todoItem("1", "Milk", "2026-10-03"), todoItem("3", "Tea", "2026-10-04")] });
  chores.cb({ items: [todoItem("2", "Bins", "2026-10-03")] });
  const date = el.shadowRoot.querySelectorAll(".row .when")[1];
  same([titles(el), whens(el), date.dateTime, date.title], [["Milk", "Tea"], ["tomorrow", "on 10/04"], "2026-10-04", "Oct 4, 2026"], "a date on the server, without a time");
  /* Off screen nothing ticks, so only the rebuild after midnight changes what a day says. */
  el._io.fire(false);
  mock.timers.tick(12 * 3600000 - 1);
  same(whens(el), ["tomorrow", "on 10/04"], "not before midnight");
  mock.timers.tick(51);
  same([titles(el).sort(), whens(el)], [["Bins", "Milk", "Tea"], ["today", "today", "tomorrow"]], "after midnight it is today");
});

test("the closed card turns through what needs attention, and critical entries hold it alone", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const states = threeOn();
  const hass = makeHass(states);
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, hass);
  const seen = [head(el).title];
  for (let i = 0; i < 3; i++) {
    mock.timers.tick(8000);
    seen.push(head(el).title);
  }
  same([seen, head(el).badge], [["Door", "Garage", "Gate", "Door"], "3"], "every 8 seconds the next, with a count");
  const smoke = { ...on("binary_sensor.smoke", "Smoke", { device_class: "smoke" }), last_changed: new Date(Date.now()).toISOString() };
  el.setConfig({ type: "x", updates: false, entities: [...Object.keys(states), "binary_sensor.smoke"] });
  el.hass = { ...hass, states: { ...states, "binary_sensor.smoke": smoke } };
  mock.timers.tick(60000);
  same([head(el).title, head(el).badge], ["Smoke", "4"], "something critical holds the card alone");
  const still = mount(w, { type: "x", updates: false, rotate: 0, entities: Object.keys(states) }, makeHass(states));
  mock.timers.tick(60000);
  same(head(still).title, "Door", "with rotate 0 the card holds still on the first");
  const single = mount(w, { type: "x", updates: false, entities: ["binary_sensor.a"] }, makeHass(states));
  same([head(single).title, q(single, ".badge").hidden], ["Door", true], "one entry needs no count");
});

test("the second line is quieter than the first, and several entries come in on load", () => {
  const w = makeWindow();
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(threeOn()) }, makeHass(threeOn()));
  const msg = cssRules(el).find((r) => r.selectorText === ".msg, .eta");
  same(msg.style.color, "var(--ha-tile-info-secondary-color, var(--secondary-text-color))");
  same(el.classList.contains("intro"), true, "the first entry waits for its way in");
  const one = mount(w, { type: "x", updates: false, entities: ["binary_sensor.a"] }, makeHass(threeOn()));
  same(one.classList.contains("intro"), false, "a single entry just shows");
  return new Promise((resolve) => w.requestAnimationFrame(() => w.requestAnimationFrame(() => w.requestAnimationFrame(resolve)))).then(() => {
    same(el.classList.contains("intro"), false, "and comes in once the card settles");
  });
});

test("news comes forward and is read out, and what was there before is not news", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const subs = [];
  const states = threeOn();
  const hass = makeHass(states, { subs });
  const el = mount(w, { type: "x", updates: false, entities: [...Object.keys(states), "binary_sensor.smoke"] }, hass);
  const say = (card = el) => q(card, ".say").textContent;
  notes(subs[0], { notification_id: "n1", title: "Backup", message: "done", created_at: "2026-09-21T09:00:00+00:00" });
  same([say(), head(el).title], ["", "Door"], "notifications from before the page loaded are not news");
  const smoke = () => ({ ...on("binary_sensor.smoke", "Smoke", { device_class: "smoke" }), last_changed: new Date(Date.now()).toISOString() });
  el.hass = { ...hass, states: { ...states, "binary_sensor.smoke": smoke() } };
  same([say(), head(el).title], ["Smoke. on", "Smoke"], "an alarm that just went off is read out");
  el.hass = { ...hass, states };
  same([say(), head(el).title], ["Smoke. on", "Door"], "the entries it held back are not news when it ends");
});

test("a swipe or an arrow key turns the card by hand and stops the turns", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const states = threeOn();
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, makeHass(states));
  const h = q(el, ".head");
  const isOpen = () => q(el, "ha-card").classList.contains("open");
  const pointer = (type, x, y = 10) => h.dispatchEvent(new w.PointerEvent(type, { pointerId: 7, isPrimary: true, pointerType: "touch", buttons: 1, clientX: x, clientY: y, bubbles: true }));
  const swipe = (from, to, y) => ["pointerdown", "pointermove", "pointerup"].forEach((type, i) => pointer(type, i ? to : from, i ? y : 10));
  swipe(200, 120, 10);
  h.click();
  same([head(el).title, isOpen()], ["Garage", false], "a swipe to the left shows the next");
  swipe(100, 170, 12);
  h.click();
  swipe(100, 104, 60);
  same(head(el).title, "Door", "a swipe to the right shows the one before");
  h.dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
  same(head(el).title, "Gate", "an arrow key turns it too, around the end");
  mock.timers.tick(60000);
  same(head(el).title, "Gate", "turning by hand stops the turns");
  h.click();
  same(isOpen(), true, "a tap still opens the list");
});

test("the turns wait while a pointer rests on the card, while it is open and while it is out of sight", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const states = threeOn();
  const hass = makeHass(states);
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, hass);
  const h = q(el, ".head");
  h.dispatchEvent(new w.PointerEvent("pointerenter", { pointerType: "mouse" }));
  mock.timers.tick(30000);
  same(head(el).title, "Door", "a mouse over the card holds it");
  h.dispatchEvent(new w.PointerEvent("pointerleave", { pointerType: "mouse" }));
  mock.timers.tick(8000);
  same(head(el).title, "Garage", "and lets go");
  h.matches = (s) => s === ":focus-visible";
  h.dispatchEvent(new w.FocusEvent("focusin", { bubbles: true }));
  mock.timers.tick(30000);
  same(head(el).title, "Garage", "keyboard focus holds it");
  h.dispatchEvent(new w.FocusEvent("focusout", { bubbles: true }));
  el._io.fire(false);
  mock.timers.tick(30000);
  same(head(el).title, "Garage", "out of sight nothing turns");
  el._io.fire(true);
  h.click();
  mock.timers.tick(30000);
  same(head(el).title, "Garage", "nor while the list is open");
  q(el, ".ebar").click();
  for (let i = 0; i < 7; i++) {
    mock.timers.tick(1000);
    el.hass = { ...hass, states: { ...states, "binary_sensor.a": { ...states["binary_sensor.a"], last_updated: new Date(Date.now()).toISOString() } } };
  }
  mock.timers.tick(1000);
  same(head(el).title, "Gate", "new states do not push the next turn back");
});

test("vertical puts the icon above the text, like a tile with vertical content", () => {
  const w = makeWindow();
  const el = mount(w, { type: "x", hide_when_empty: false, vertical: true }, makeHass({}));
  const rules = cssRules(el);
  const rule = rules.find((r) => r.selectorText === ":host(.vertical) .head");
  same(
    [el.classList.contains("vertical"), rule.style.getPropertyValue("flex-direction"), rule.style.getPropertyValue("text-align"), el.getGridOptions().min_columns, el.getCardSize()],
    [true, "column", "center", 3, 2]
  );
  el.setConfig({ type: "x", hide_when_empty: false });
  same([el.classList.contains("vertical"), el.getGridOptions().min_columns, el.getCardSize()], [false, 6, 1], "and is off unless set");
});

const quietStates = () => ({
  "weather.home": st("weather.home", "rainy", { friendly_name: "Home", temperature: 14 }),
  "sun.sun": st("sun.sun", "below_horizon", { friendly_name: "Sun", next_rising: "2026-10-03T05:31:00+00:00", elevation: -5 }),
  "sensor.energy": st("sensor.energy", "4.2", { friendly_name: "Energy", unit_of_measurement: "kWh" }),
  "sensor.gone": st("sensor.gone", "unavailable", { friendly_name: "Gone" }),
});
const quietHass = (states, opts = {}) => {
  const hass = makeHass(states, { formatEntityState: (s) => (s.state === "rainy" ? "Rainy" : s.state + (s.attributes.unit_of_measurement ? " " + s.attributes.unit_of_measurement : "")), ...opts });
  hass.formatEntityAttributeValue = (s, a) => (a === "temperature" ? s.attributes.temperature + " °C" : String(s.attributes[a]));
  return hass;
};
const shownInfo = (el) => [head(el).title, q(el, ".head .msg .t").textContent];

test("the head is a button only while what it shows does something", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const el = mount(w, { type: "x", updates: false, infos: ["sun.sun", { entity: "sensor.energy", tap_action: "none" }] }, quietHass(quietStates()));
  const state = () => [head(el).title, q(el, "ha-card").classList.contains("tappable"), q(el, ".head").getAttribute("aria-disabled")];
  same(state(), ["Sun", true, "false"], "the sun opens its entity");
  mock.timers.tick(8000);
  same(state(), ["Energy", false, "true"], "after a turn the energy info does nothing");
});

test("infos fill a quiet card in their order, and leave it to what needs attention", async () => {
  useClock();
  const w = makeWindow({ clock: true });
  const subs = [];
  const states = quietStates();
  const infos = [{ entity: "weather.home", name: "Weather", state_content: ["temperature", "state"] }, "sensor.gone", { entity: "sun.sun", name: "Sunrise", color: "red" }, "sensor.energy"];
  const el = mount(w, { type: "x", updates: false, infos }, quietHass(states, { subs }));
  const color = () => q(el, "ha-card").style.getPropertyValue("--tile-color");
  same([el.hidden, shownInfo(el)], [false, ["Weather", "14 °C · Rainy"]], "a quiet card shows its first info, like a tile");
  mock.timers.tick(8000);
  same([shownInfo(el), color()], [["Sunrise", "below_horizon"], "var(--red-color)"], "an unavailable info is left out, and its color shows");
  mock.timers.tick(8000);
  same([shownInfo(el), q(el, ".badge").hidden], [["Energy", "4.2 kWh"], true], "no count for infos");
  notes(subs[0], { notification_id: "n1", title: "Backup", message: "done", created_at: "2026-09-21T09:00:00+00:00" });
  mock.timers.tick(30000);
  same(shownInfo(el), ["Backup", "done"], "a notification takes the card, and the infos wait");
  subs[0].cb({ type: "removed", notifications: { n1: {} } });
  same(shownInfo(el), ["Weather", "14 °C · Rainy"], "and come back once it is gone");
  w.customElements.define("state-display", class extends w.HTMLElement {});
  await Promise.resolve();
  await Promise.resolve();
  const sd = q(el, ".head .msg state-display");
  same(
    [sd.stateObj.entity_id, sd.content, sd.name, q(el, ".head .msg .t").hidden],
    ["weather.home", ["temperature", "state"], "Weather", true],
    "the info uses Home Assistant's state text once it is there"
  );
});

/* A weather info on an entity with a daily and an hourly forecast, and the card's subscription to it. */
const forecastCard = (w, info) => {
  const subs = [];
  const id = info.entity || "weather.home";
  const names = { sunny: "Sunny", rainy: "Rainy", cloudy: "Cloudy", partlycloudy: "Partly cloudy" };
  const hass = makeHass({ [id]: weatherAt("rainy", { supported_features: 7 }, id) }, { subs, formatEntityState: (s) => names[s.state] || s.state });
  const el = mount(w, { type: "x", updates: false, rotate: 0, infos: [{ entity: id, ...info }] }, hass);
  return { el, hass, forecast: () => subs.find((s) => s.msg && s.msg.type === "weather/subscribe_forecast") };
};
const dayAt = (d, rest) => ({ datetime: new Date(Date.parse("2026-10-02T00:00:00Z") + d * 86400000).toISOString(), condition: "sunny", temperature: 16, templow: 9, ...rest });
const arrow = (w, el) => q(el, ".head").dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

test("a weather info shows its forecast a day at a time, after the current weather unless it asks otherwise", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const both = forecastCard(w, { entity: "weather.both", forecast_type: "daily" });
  same(shownInfo(both.el), ["Home", "Rainy"], "the current weather shows while the forecast loads");
  both.forecast().cb({ type: "daily", forecast: [dayAt(0)] });
  same(shownInfo(both.el), ["Home", "Rainy"], "and comes first, like on Home Assistant's forecast card");
  arrow(w, both.el);
  same(shownInfo(both.el), ["Today", "16° / 9° · Sunny"], "then the forecast");
  const { el, forecast } = forecastCard(w, { forecast_type: "daily", forecast_slots: 2, show_current: false });
  same([forecast().msg.forecast_type, el.hidden], ["daily", true], "only the forecast waits for it");
  forecast().cb({ type: "daily", forecast: [dayAt(-1), dayAt(0), dayAt(1, { condition: "rainy", temperature: 12.5, templow: 7 }), dayAt(2)] });
  same([el.hidden, shownInfo(el)], [false, ["Today", "16° / 9° · Sunny"]], "today comes first, and a day already gone is left out");
  arrow(w, el);
  same(shownInfo(el), ["Tomorrow", "12.5° / 7° · Rainy"], "then tomorrow");
  arrow(w, el);
  same(shownInfo(el)[0], "Today", "two slots, as set");
  const subs = [];
  const states = { "weather.cabin": weatherAt("rainy", { supported_features: 1 }, "weather.cabin"), "sun.sun": quietStates()["sun.sun"] };
  const first = mount(w, { type: "x", updates: false, infos: [{ entity: "weather.cabin", forecast_type: "daily", show_current: false }, "sun.sun"] }, makeHass(states, { subs }));
  same(head(first).title, "Sun", "the sun shows while the forecast loads");
  subs.find((s) => s.msg && s.msg.type === "weather/subscribe_forecast").cb({ type: "daily", forecast: [dayAt(0)] });
  same(head(first).title, "Today", "then the forecast takes the front");
  mock.timers.tick(8000);
  same(head(first).title, "Sun", "and the turns go on from there");
  mock.timers.tick(Date.parse("2026-10-03T00:00:01Z") - Date.now());
  same(shownInfo(el), ["Today", "12.5° / 7° · Rainy"], "at midnight tomorrow becomes today");
});

test("an hourly or twice daily forecast names its hour or its half of the day, in the number format of the profile", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC", stateIcon: true });
  const hour = (h, rest) => ({ datetime: new Date(NOW + h * 3600000).toISOString(), condition: "cloudy", temperature: 11, ...rest });
  const { el, forecast } = forecastCard(w, { forecast_type: "hourly", forecast_slots: 3, show_current: false, name: "Oslo" });
  forecast().cb({ type: "hourly", forecast: [hour(-1), hour(0), hour(12, { condition: "partlycloudy", is_daytime: false })] });
  const icon = () => {
    const i = q(el, ".head .glyph ha-state-icon");
    return [i.stateObj.state, i.icon];
  };
  same([...shownInfo(el), icon()], ["Oslo", "12:00 PM · 11° · Cloudy", ["cloudy", null]], "a name first, the hour second, and the condition's icon");
  arrow(w, el);
  same([...shownInfo(el), icon()], ["Oslo", "Tomorrow at 12:00 AM · 11° · Partly cloudy", ["partlycloudy", "mdi:weather-night-partly-cloudy"]], "an hour after midnight names its day");
  const twice = forecastCard(w, { entity: "weather.twice", forecast_type: "twice_daily", show_current: false });
  twice.forecast().cb({ type: "twice_daily", forecast: [hour(0, { condition: "sunny", temperature: 17, is_daytime: true })] });
  same(shownInfo(twice.el), ["Today", "Day · 17° · Sunny"], "half a day says whether it is day or night");
  const text = (number_format) => {
    const card = forecastCard(w, { forecast_type: "daily", show_current: false });
    card.el.hass = { ...card.hass, locale: { language: "de", number_format } };
    card.forecast().cb({ type: "daily", forecast: [dayAt(0, { temperature: 7.5, templow: 1.5 })] });
    return q(card.el, ".head .msg .t").textContent.split(" · ")[0];
  };
  same(["language", "comma_decimal"].map(text), ["7,5° / 1,5°", "7.5° / 1.5°"], "temperatures follow the number format of the profile");
});

test("an info shows while its conditions hold, checked as Home Assistant checks them", async () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const subs = [];
  const states = { ...quietStates(), "person.anna": st("person.anna", "home", { user_id: "u1" }) };
  const card = (visibility) => mount(w, cfg([], { infos: [{ entity: "sensor.energy", visibility }] }), quietHass(states, { subs }));
  const c = (condition, rest) => ({ condition, ...rest });
  const cases = [
    [c("state", { entity: "sun.sun", state: "below_horizon" }), true],
    [c("state", { entity: "sun.sun", state_not: ["below_horizon", "above_horizon"] }), false],
    [c("user", { users: ["u2"] }), false],
    [c("or", { conditions: [c("user", { users: ["u2"] }), c("user", { users: ["u1"] })] }), true],
    [c("not", { conditions: [c("user", { users: ["u1"] })] }), false],
  ];
  same(cases.map(([condition]) => head(card([condition])).title === "Energy"), cases.map(([, shows]) => shows), "state, numbers, users, places and their mix");
  const timed = [card([c("time", { after: "13:00", before: "14:00" })]), card([c("time", { after: "22:00", before: "06:00" })]), card([c("time", { weekdays: ["fri"] })])];
  const shown = () => timed.map((el) => head(el).title === "Energy");
  same(shown(), [false, false, true], "a time at noon on a Friday, in the zone of the profile");
  mock.timers.tick(3600000 + 50);
  same(shown()[0], true, "the card wakes at one");
  mock.timers.tick(10 * 3600000);
  same(shown(), [false, true, true], "and at eleven at night");
  const mql = { matches: false, onchange: null };
  w.matchMedia = () => mql;
  const screen = card([c("screen", { media_query: "(max-width: 600px)" })]);
  mql.matches = true;
  mql.onchange();
  same(head(screen).title, "Energy", "a screen condition follows the screen");
  const sun = c("sun", { after: "sunset" });
  const late = w.document.createElement("origami-notifications");
  late.setConfig(cfg([], { infos: [{ entity: "sensor.energy", visibility: [sun] }] }));
  late.hass = quietHass(states, { subs });
  const asked = () => subs.filter((s) => s.msg && s.msg.type === "subscribe_condition");
  same(asked().length, 0, "the server is asked once the card is on the page");
  w.document.body.append(late);
  same([asked().map((s) => s.msg.condition), head(late).title], [[sun], "All quiet"], "and the info waits for its answer");
  const sub = asked()[0];
  sub.cb({ result: true });
  same(head(late).title, "Energy");
  sub.cb({ error: { code: "invalid", message: "x" } });
  same(head(late).title, "All quiet", "an error hides it, as it hides a card");
  const core = { condition: "state", entity_id: "sun.sun", state: "below_horizon", for: { minutes: 5 } };
  late.setConfig(cfg([], { infos: [{ entity: "sensor.energy", visibility: [core] }] }));
  await Promise.resolve();
  await Promise.resolve();
  same([sub.closed, asked().map((s) => s.msg.condition)], [true, [sun, core]], "a core condition goes there too, and an old one ends");
});

test("an info does what its actions say, like a tile", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const states = quietStates();
  const hold = { action: "navigate", navigation_path: "/sun" };
  const el = mount(w, { type: "x", updates: false, infos: [{ entity: "sun.sun", hold_action: hold, double_tap_action: { action: "toggle" } }] }, quietHass(states));
  const got = [];
  el.addEventListener("hass-action", (e) => got.push(e.detail));
  const h = el.shadowRoot.querySelector(".head");
  h.click();
  same(got, [], "a tap waits whether a second one follows");
  mock.timers.tick(250);
  same(got, [{ config: { entity: "sun.sun", tap_action: { action: "more-info" }, hold_action: hold, double_tap_action: { action: "toggle" } }, action: "tap" }], "then opens the entity");
  got.length = 0;
  h.click();
  h.click();
  mock.timers.tick(250);
  same(got.map((g) => g.action), ["double_tap"], "two taps make a double tap");
  got.length = 0;
  h.dispatchEvent(new w.PointerEvent("pointerdown", { pointerId: 1, isPrimary: true, pointerType: "touch", clientX: 10, clientY: 10, bubbles: true }));
  mock.timers.tick(500);
  h.dispatchEvent(new w.PointerEvent("pointerup", { pointerId: 1, isPrimary: true, pointerType: "touch", clientX: 10, clientY: 10, bubbles: true }));
  h.click();
  mock.timers.tick(250);
  same(got.map((g) => g.action), ["hold"], "a hold, and no tap after it");

  const quiet = mount(w, { type: "x", updates: false, infos: [{ entity: "sensor.energy", tap_action: "none" }] }, quietHass(states));
  const q = quiet.shadowRoot;
  same([q.querySelector(".head").getAttribute("aria-disabled"), q.querySelector("ha-card").classList.contains("tappable")], ["true", false], "an info without actions is not a button");
});

test("a narrow card opens its list in Home Assistant's dialog", () => {
  useClock();
  const w = makeWindow({ clock: true });
  w.customElements.define("ha-icon-button", class extends w.HTMLElement {});
  const states = threeOn();
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, makeHass(states));
  /* Plays Home Assistant's dialog manager. It makes the element once, hands it hass and calls showDialog. */
  let dialog = null;
  w.addEventListener("show-dialog", (e) => {
    dialog = dialog || w.document.createElement(e.detail.dialogTag);
    dialog.hass = e.detail.dialogParams.card._hass;
    dialog.showDialog(e.detail.dialogParams);
    if (!dialog.isConnected) w.document.body.append(dialog);
  });
  const h = q(el, ".head");
  const unfolds = (card, width) => {
    resize(card, width);
    q(card, ".head").click();
    const open = q(card, "ha-card").classList.contains("open");
    if (open) q(card, ".ebar").click();
    return open;
  };
  same([unfolds(el, 400), unfolds(el, 180), dialog], [true, true, null], "a card unfolds in place until Home Assistant has its dialog");
  w.customElements.define("ha-adaptive-dialog", class extends w.HTMLElement {});
  same(unfolds(mount(w, { type: "x", updates: false, entities: ["binary_sensor.a"] }, makeHass(states)), 180), false, "then a narrow card stays closed");
  const when = () => q(dialog, ".row .when").textContent;
  same(when(), "1 min. ago", "and the dialog shows its rows");
  mock.timers.tick(10 * 60000);
  same(when(), "11 min. ago", "with their times up to date");
  same([unfolds(el, 180), h.getAttribute("aria-haspopup"), h.hasAttribute("aria-expanded")], [false, "dialog", false], "another card takes the dialog over");
  const inner = q(dialog, "ha-adaptive-dialog");
  const shown = () => [...dialog.shadowRoot.querySelectorAll(".row .title")].map((t) => t.textContent);
  same([inner.open, inner.getAttribute("header-title"), shown()], [true, "3 notifications", ["Door", "Garage", "Gate"]], "and shows every row of it");
  const behind = head(el).title;
  mock.timers.tick(20000);
  same(head(el).title, behind, "the card behind the dialog holds still");
  mock.timers.tick(60000);
  same(when(), "12 min. ago", "and the times of its rows keep up");
  const font = cssRules(dialog).find((r) => r.selectorText === ":host" && r.style.getPropertyValue("font-family"));
  same(font.style.getPropertyValue("font-family"), "var(--ha-font-family-body)", "in the font of the theme");
  dismiss(dialog);
  same(shown(), ["Garage", "Gate"], "a dismissal reaches it at once");
  const closed = [];
  dialog.addEventListener("dialog-closed", (e) => closed.push(e.detail.dialog));
  q(dialog, "ha-icon-button").click();
  same([closed, q(dialog, "ha-adaptive-dialog")], [["origami-notifications-dialog"], null], "and it closes");
});

test("editor schema", () => {
  const w = makeWindow();
  const ed = w.document.createElement("origami-notifications-editor");
  ed.setConfig({ type: "x", entities: ["calendar.family"] });
  ed.hass = makeHass({ "calendar.family": st("calendar.family", "off", { friendly_name: "Family" }) });
  const form = ed.querySelector("ha-form");
  same(form.schema.map((s) => s.name || s.type), ["entities", "label", "weather", "infos", "grid", "hide_when_empty", "content_layout", "grid", "options", "audience", "styling"]);
  same(
    form.schema.find((s) => s.name === "options").schema[0].schema.map((s) => s.name || s.type),
    ["type", "attribute", "grid", "image", "background", "before", "tap_action"],
    "entity options"
  );
  same(
    form.schema.find((s) => s.name === "audience").schema.map((s) => s.name),
    ["system", "updates", "repairs", "calendar.family"],
    "audience sources"
  );
});

test("the editor writes only what differs", () => {
  const w = makeWindow();
  const ed = w.document.createElement("origami-notifications-editor");
  const hass = makeHass({ "sensor.dinner": st("sensor.dinner", "Lasagne", { friendly_name: "Dinner", recipe: { name: "Lasagne" } }) });
  ed.setConfig({ type: "custom:origami-notifications", entities: [{ entity: "sensor.dinner", actions: [{ label: "Cook" }] }] });
  ed.hass = hass;
  const form = ed.querySelector("ha-form");
  const schemaBefore = form.schema;
  ed.hass = { ...hass };
  same(form.schema === schemaBefore, true, "a state update does not rebuild the form");
  let written = null;
  ed.addEventListener("config-changed", (e) => (written = e.detail.config));
  const value = JSON.parse(JSON.stringify(form.data));
  value.options["sensor.dinner"].background = true;
  value.options["sensor.dinner"].name = "";
  form.dispatchEvent(new w.CustomEvent("value-changed", { detail: { value } }));
  same(written, { type: "custom:origami-notifications", entities: [{ entity: "sensor.dinner", background: true, actions: [{ label: "Cook" }] }] }, "options merged, defaults left out, YAML only keys kept");
  const turned = edit(w, {}, makeHass({}), (v) => {
    same([v.rotate, v.slide], [8, "up"], "the form shows the default turns");
    Object.assign(v, { rotate: 0, slide: "side" });
  });
  same([turned.written.rotate, turned.written.slide], [0, "side"], "and writes other ones");
  same(Object.keys(edit(w, { rotate: 0, slide: "side" }, makeHass({}), (v) => Object.assign(v, { rotate: 8, slide: "up" })).written), ["type"], "but not the defaults");
});

test("swapping an entity in the editor keeps its options and its rule, and a rule leaves with its entity", () => {
  const w = makeWindow();
  const hass = makeHass({ "person.anna": st("person.anna", "home", { user_id: "u1" }) });
  const only = { only: ["person.anna"] };
  const bare = { type: "custom:origami-notifications" };
  same(edit(w, { entities: ["binary_sensor.door"], audience: { "binary_sensor.door": only } }, hass, (v) => (v.entities = [])).written, bare, "a rule leaves with its entity");
  const door = { entity: "binary_sensor.door", icon: "mdi:door", actions: [{ label: "Open", tap_action: { action: "toggle" } }] };
  same(
    edit(w, { entities: [door], audience: { "binary_sensor.door": only } }, hass, (v) => (v.entities = ["binary_sensor.door_2"])).written,
    { ...bare, entities: [{ ...door, entity: "binary_sensor.door_2" }], audience: { "binary_sensor.door_2": only } },
    "a swapped entity keeps its options and its rule"
  );
  const rule = { "update.nas": only };
  same(edit(w, { entities: ["update.nas"], audience: rule }, hass, (v) => (v.entities = [])).written.audience, rule, "a rule for an update stays");
  const weather = { weather: "weather.home", audience: { "weather.home": only } };
  same(
    [edit(w, weather, hass, (v) => (v.weather = "weather.office")).written, edit(w, weather, hass, (v) => (v.weather = "")).written],
    [{ ...bare, weather: "weather.office", audience: { "weather.office": only } }, bare],
    "another weather keeps the rule, none drops it"
  );
});

test("the editor offers the content layout, a field for your css and the weather", () => {
  const w = makeWindow();
  const ed = w.document.createElement("origami-notifications-editor");
  const written = [];
  ed.addEventListener("config-changed", (e) => written.push(e.detail.config));
  ed.setConfig({ type: "x", entities: ["binary_sensor.a"], css: ":host { --origami-radius: 4px; }" });
  ed.hass = makeHass({ "weather.home": st("weather.home", "rainy", { friendly_name: "Home" }) }, { lang: "de" });
  const form = ed.querySelector("ha-form");
  const field = form.schema.find((s) => s.name === "content_layout").selector.select;
  same(
    [field.mode, field.options.map((o) => o.image.src.split("/").pop()), form.data.content_layout],
    ["box", ["tile_content_layout_horizontal.svg", "tile_content_layout_vertical.svg"], "horizontal"],
    "the content layout, like Home Assistant's tile editor"
  );
  const send = (value) => form.dispatchEvent(new w.CustomEvent("value-changed", { detail: { value: { ...JSON.parse(JSON.stringify(form.data)), ...value } }, bubbles: true }));
  send({ content_layout: "vertical" });
  same([written.at(-1).vertical, "content_layout" in written.at(-1)], [true, false], "written as vertical, as the tile card has it");
  send({ content_layout: "horizontal" });
  same("vertical" in written.at(-1), false, "and dropped when it is the default again");
  const panel = form.schema.find((s) => s.name === "styling");
  same(
    [panel.schema, form.data.css, form.computeLabel({ name: "css" }), form.computeHelper({ name: "css" })],
    [[{ name: "css", selector: { text: { multiline: true } } }], ":host { --origami-radius: 4px; }", "CSS", "Kommt nach den Styles der Karte, so lässt sich jeder Teil ändern."],
    "a field for your css"
  );
  send({ css: "" });
  same("css" in written.at(-1), false, "which drops an empty one");
  send({ weather: "weather.home" });
  same(
    [Object.keys(written.at(-1)), form.schema.find((s) => s.name === "weather").selector],
    [["type", "entities", "weather"], { entity: { filter: { domain: "weather" } } }],
    "the weather is a field of its own"
  );
});

/* The editor on infos, the forms of their panels, and a value that a form or a conditions editor sends. */
const infoEditor = (w, config, hass) => {
  const ed = w.document.createElement("origami-notifications-editor");
  const written = [];
  ed.addEventListener("config-changed", (e) => written.push(e.detail.config));
  ed.setConfig({ type: "custom:origami-notifications", ...config });
  ed.hass = hass;
  return { ed, written, form: ed.querySelector("ha-form") };
};
const infoForms = (ed) => [...ed.querySelectorAll("ha-expansion-panel ha-form")];
const send = (w, target, value) => target.dispatchEvent(new w.CustomEvent("value-changed", { detail: { value }, bubbles: true, composed: true }));

test("each info is edited with the fields of a tile and Home Assistant's visibility editor", () => {
  const w = makeWindow({ stateIcon: true });
  const hass = makeHass({ "sun.sun": st("sun.sun", "above_horizon"), "weather.home": st("weather.home", "rainy"), "sensor.energy": st("sensor.energy", "4.2") });
  const weather = { entity: "weather.home", name: "Weather", icon: "mdi:umbrella" };
  const { ed, written, form } = infoEditor(w, { infos: ["sun.sun", weather] }, hass);
  const leads = [...ed.querySelectorAll("ha-expansion-panel [slot=leading-icon]")].filter((l) => l.stateObj);
  same(
    [form.data.infos, infoForms(ed).map((f) => f.schema.map((s) => s.name || s.type)), leads.map((l) => [l.stateObj.entity_id, l.icon])],
    [["sun.sun", "weather.home"], Array(2).fill(["name", "grid", "state_content", "show_entity_picture", "tap_action", "optional_actions"]), [["sun.sun", null], ["weather.home", "mdi:umbrella"]]],
    "each info has the fields and icon of a tile"
  );
  send(w, infoForms(ed)[0], { entity: "sun.sun", state_content: "next_rising", color: "state", name: "" });
  const sun = { entity: "sun.sun", state_content: "next_rising" };
  same(written.at(-1).infos, [sun, weather], "only what is set is written");
  const conditions = () => ed.querySelectorAll("ha-card-conditions-editor")[1];
  send(w, conditions(), [{ condition: "user", users: ["u1"] }]);
  same(written.at(-1).infos[1].visibility, [{ condition: "user", users: ["u1"] }], "the visibility editor writes the conditions");
  const pick = (infos) => send(w, form, { ...JSON.parse(JSON.stringify(form.data)), infos });
  pick(["sun.sun", "sensor.energy"]);
  pick(["sensor.energy", "sun.sun"]);
  same(written.at(-1).infos, [{ ...weather, entity: "sensor.energy", visibility: [{ condition: "user", users: ["u1"] }] }, sun], "a swapped or moved info keeps its options");
  pick([]);
  same("infos" in written.at(-1), false, "none left");
});

test("a weather info shows the current weather, its forecast or both, chosen as on Home Assistant's forecast card", () => {
  const w = makeWindow();
  const { ed, written } = infoEditor(w, { infos: ["weather.home"] }, makeHass({ "weather.home": st("weather.home", "rainy", { friendly_name: "Home", supported_features: 3 }) }));
  const form = () => infoForms(ed)[0];
  const names = () => form().schema.map((s) => s.name || s.type);
  const options = (name) => form().schema.find((s) => s.name === name).selector.select.options.map((o) => o.value);
  const choose = (value) => send(w, form(), { ...form().data, ...value });
  same([names(), options("forecast"), form().data.forecast], [["name", "grid", "forecast", "state_content", "show_entity_picture", "tap_action", "optional_actions"], ["show_both", "show_current", "show_forecast"], "show_current"], "an info starts with the current weather, like a tile");
  choose({ forecast: "show_forecast" });
  same(
    [written.at(-1).infos, names().slice(2, 5), options("forecast_type")],
    [[{ entity: "weather.home", show_current: false, forecast_type: "daily" }], ["forecast", "forecast_type", "forecast_slots"], ["daily", "hourly"]],
    "only the forecast takes the first type, and asks for type and slots"
  );
  choose({ forecast: "show_both" });
  same(written.at(-1).infos, [{ entity: "weather.home", forecast_type: "daily" }], "both keep the forecast");
  choose({ forecast: "show_current" });
  same(written.at(-1).infos, ["weather.home"], "the current weather alone drops the forecast options");
});

test("your css goes after the card's own, and rows are styled by kind, severity and the state's color", () => {
  const w = makeWindow();
  const css = ".row { border: 1px solid red; }";
  same([...mount(w, { type: "x", css }, makeHass({})).shadowRoot.querySelectorAll("style")].pop().textContent, css, "your css goes last, so it wins");
  const subs = [];
  const states = {
    "alarm_control_panel.house": st("alarm_control_panel.house", "triggered", { friendly_name: "House" }),
    "lock.back": st("lock.back", "unlocked", { friendly_name: "Back" }),
    "binary_sensor.window": on("binary_sensor.window", "Window", { device_class: "window" }),
  };
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, makeHass(states, { subs }));
  notes(subs[0], { notification_id: "n1", title: "Backup", message: "done", created_at: "2026-09-21T09:00:00+00:00" });
  const row = rowOf(el, "House");
  same([row.className, row.dataset.kind, row.getAttribute("role")], ["row crit link", "alarm", "listitem"], "a row names its severity and its kind");
  same(
    Object.fromEntries([...el.shadowRoot.querySelectorAll(".row")].map((r) => [r.querySelector(".title").textContent, r.style.getPropertyValue("--tile-color")])),
    {
      House: "var(--error-color)",
      Back: "var(--state-lock-unlocked-color, var(--state-lock-active-color, var(--state-active-color)))",
      Window: "var(--state-binary_sensor-window-on-color, var(--state-binary_sensor-on-color, var(--state-binary_sensor-active-color, var(--state-active-color))))",
      Backup: "var(--info-color)",
    },
    "colors as Home Assistant gives the state, urgency first"
  );
  const card = q(el, "ha-card");
  same([card.style.getPropertyValue("--tile-color"), card.classList.contains("crit")], ["var(--error-color)", true], "the closed card takes that color and pulses");
  card.style.setProperty("--origami-max-height", "200px");
  q(el, ".head").click();
  same([el.classList.contains("capped"), card.classList.contains("settled")], [true, true], "a height limit makes the list scroll");
});

test("the language follows the profile, and other languages borrow Home Assistant's strings", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const texts = (lang) => {
    const ed = w.document.createElement("origami-notifications-editor");
    ed.setConfig({ type: "x" });
    ed.hass = makeHass({}, { lang });
    return [head(mount(w, cfg([]), makeHass({}, { lang }))).title, ed.querySelector("ha-form").computeLabel({ name: "hide_when_empty" })];
  };
  const english = ["All quiet", "Hide when there is nothing to show"];
  same([texts("en"), texts("en-GB"), texts("de"), texts("nl")], [english, english, ["Alles ruhig", "Ausblenden, wenn nichts anliegt"], english], "German or English");
  const fr = {
    "ui.notification_drawer.empty": "Aucune notification",
    "ui.dialogs.more_info_control.update.install": "Installer",
    "ui.card.persistent_notification.dismiss": "Ignorer",
    "ui.card.timer.actions.cancel": "Annuler",
    "ui.card.lock.lock": "Verrouiller",
  };
  const french = { lang: "fr", localize: (k) => fr[k] || "" };
  const states = { "update.router": st("update.router", "on", { title: "RouterOS", supported_features: 1 }), "lock.front_door": deviceStates()["lock.front_door"], "timer.kitchen": running(300) };
  const el = mount(w, { type: "x", entities: ["lock.front_door", "timer.kitchen"] }, makeHass(states, french));
  same(
    [q(mount(w, cfg([]), makeHass({}, french)), ".msg .t").textContent, Object.fromEntries(rows(el).map((r) => [r.title, r.actions])), q(el, ".row .x").getAttribute("aria-label")],
    ["Aucune notification", { RouterOS: ["Installer"], "Front door": ["Verrouiller"], Kitchen: ["Pause", "Annuler"] }, "Ignorer"],
    "Home Assistant's words, and English where it has none"
  );
});
