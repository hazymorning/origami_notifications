const { describe, test, afterEach, mock } = require("node:test");
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

/* opts.bare leaves the stubs out, opts.stateIcon defines ha-state-icon, and opts.clock hands the card
 * the Date of mock.timers. Timers follow mock.timers anyway. opts.zone is the browser's time zone for
 * every date format that names none. */
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
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.__origamiTest = {};
  if (!opts.bare) addStubs(window, opts);
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

/* Values from the jsdom window belong to another realm, so compare them as plain data. */
const same = (got, want, message) =>
  assert.deepStrictEqual(got === undefined ? got : JSON.parse(JSON.stringify(got)), want, message);

const tick = () => new Promise((r) => setTimeout(r, 0));

const services = (hass) => hass.calls.filter((c) => c[0] !== "ws");

test("empty", () => {
  const w = makeWindow();
  same(mount(w, { type: "x" }, makeHass({})).hidden, true, "hidden when empty");
  const el = mount(w, { type: "x", hide_when_empty: false }, makeHass({}));
  same(el.shadowRoot.querySelector(".head .title").textContent, "All quiet", "idle title");
});

test("registration", () => {
  const w = makeWindow();
  same(w.customCards.map((c) => [c.type, c.name]), [["origami-notifications", "Origami Notifications"]], "picker entry");
  same(Boolean(w.customElements.get("origami-notifications-editor")), true, "editor");
});

test("persistent notification", () => {
  const w = makeWindow();
  const subs = [];
  const hass = makeHass({}, { subs });
  const el = mount(w, { type: "x" }, hass);
  subs[0].cb({
    type: "current",
    notifications: {
      n1: { notification_id: "n1", title: "Backup", message: "Backup done", created_at: "2026-09-21T09:00:00+00:00" },
    },
  });
  same(rows(el).map((r) => [r.title, r.body]), [["Backup", "Backup done"]], "row");
  el.shadowRoot.querySelector(".row .x").click();
  same(services(hass), [["persistent_notification.dismiss", { notification_id: "n1" }]], "dismiss service");
});

test("update entity", () => {
  const w = makeWindow();
  const hass = makeHass({
    "update.router": st("update.router", "on", {
      friendly_name: "Router Update",
      title: "RouterOS",
      latest_version: "7.15",
      supported_features: 1,
    }),
  });
  const el = mount(w, { type: "x" }, hass);
  same(rows(el)[0].title, "RouterOS", "title from attr");
  same(rows(el)[0].body, "Update 7.15 available", "message");
  same(rows(el)[0].actions, ["Install"], "install button");

  const noInstall = makeHass({
    "update.bulb": st("update.bulb", "on", { title: "Bulb firmware", latest_version: "2", supported_features: 0 }),
  });
  same(rows(mount(w, { type: "x" }, noInstall))[0].actions, [], "no install button without the install feature");

  const auto = makeHass({
    "update.addon": st("update.addon", "on", { title: "Add-on", latest_version: "3", supported_features: 1, auto_update: true }),
  });
  const elAuto = mount(w, { type: "x" }, auto);
  elAuto.shadowRoot.querySelector(".row .x").click();
  same(
    [rows(elAuto).length, auto.calls.some((c) => c[0] === "update.skip")],
    [0, false],
    "auto update is dismissed locally, not skipped"
  );

  const busy = makeHass({
    "update.router": st("update.router", "on", {
      title: "RouterOS",
      latest_version: "7.15",
      in_progress: true,
      update_percentage: 42,
    }),
  });
  same(rows(mount(w, { type: "x" }, busy))[0].actions, ["Installing 42%!"], "install progress");
});

test("configured update entity keeps its overrides", () => {
  const w = makeWindow();
  const hass = makeHass({
    "update.router": st("update.router", "on", { title: "RouterOS", latest_version: "7.15" }),
  });
  const el = mount(w, { type: "x", entities: [{ entity: "update.router", name: "Router firmware", icon: "mdi:router" }] }, hass);
  same(rows(el)[0].title, "Router firmware", "name override");
  same(rows(el)[0].icon, "mdi:router", "icon override");
});

test("generic entities use Home Assistant's formatting", () => {
  const w = makeWindow();
  const hass = makeHass(
    {
      "sensor.load": st("sensor.load", "3", { friendly_name: "Load", unit_of_measurement: "%" }),
      "sensor.next_alarm": st("sensor.next_alarm", "2026-09-22T06:30:00+00:00", {
        friendly_name: "Next alarm",
        device_class: "timestamp",
      }),
    },
    { formatEntityState: (s) => (s.entity_id === "sensor.load" ? "3 %" : "September 22, 2026 at 6:30 AM") }
  );
  const el = mount(w, { type: "x", entities: ["sensor.load", { entity: "sensor.next_alarm", type: "generic" }] }, hass);
  same(rows(el).map((r) => [r.title, r.body]), [
    ["Load", "3 %"],
    ["Next alarm", "September 22, 2026 at 6:30 AM"],
  ]);
});

test("alarm panel and alert", () => {
  const w = makeWindow();
  const hass = makeHass(
    {
      "alarm_control_panel.house": st("alarm_control_panel.house", "triggered", { friendly_name: "House" }),
      "alarm_control_panel.shed": st("alarm_control_panel.shed", "disarmed", { friendly_name: "Shed" }),
      "alert.garage": st("alert.garage", "on", { friendly_name: "Garage open too long" }),
    },
    { formatEntityState: () => "Triggered" }
  );
  const el = mount(w, { type: "x", entities: ["alarm_control_panel.house", "alarm_control_panel.shed", "alert.garage"] }, hass);
  same(rows(el).map((r) => [r.title, r.tile]), [
    ["House", "rtile crit"],
    ["Garage open too long", "rtile warn"],
  ], "triggered is critical and pinned");
  same(rows(el).some((r) => r.title === "Shed"), false, "disarmed panel stays silent");
  same(rows(el).map((r) => [r.title, r.x]), [
    ["House", false],
    ["Garage open too long", true],
  ], "alarm has no dismiss, alert has one");
  same(rows(el)[0].icon, "mdi:shield-alert", "alarm icon");
});

test("audience", () => {
  const w = makeWindow();
  const subs = [];
  const hass = makeHass({ "person.anna": st("person.anna", "home", { user_id: "u1" }) }, { subs, user: { id: "u1" } });
  const el = mount(w, { type: "x", audience: { system: { except: ["person.anna"] } } }, hass);
  subs[0].cb({ type: "current", notifications: { n1: { notification_id: "n1", message: "hi" } } });
  same(rows(el).length, 0, "viewer excluded");
});

test("audience: the updates rule covers every update entity", () => {
  const w = makeWindow();
  const hass = makeHass(
    {
      "person.anna": st("person.anna", "home", { user_id: "u1" }),
      "update.router": st("update.router", "on", { title: "RouterOS", latest_version: "7.15" }),
      "update.nas": st("update.nas", "on", { title: "NAS", latest_version: "2" }),
    },
    { user: { id: "u1" } }
  );
  const el = mount(w, { type: "x", hide_when_empty: false, entities: ["update.router"], audience: { updates: { except: ["person.anna"] } } }, hass);
  same(rows(el).length, 0, "listed and found updates are both hidden");
  const el2 = mount(w, { type: "x", hide_when_empty: false, audience: { "update.nas": { except: ["person.anna"] } } }, hass);
  same(rows(el2).map((r) => r.title), ["RouterOS"], "a rule for one found update applies");
});

test("DWD warnings and sorting", () => {
  const w = makeWindow();
  const hass = makeHass({
    "sensor.dwd": st("sensor.dwd", "2", {
      warning_count: 2,
      warning_1_headline: "Sturm",
      warning_1_level: 3,
      warning_1_start: "2026-09-21T08:00:00+00:00",
      warning_2_headline: "Glatteis",
      warning_2_level: 2,
      warning_2_start: "2026-09-21T11:00:00+00:00",
    }),
    "update.router": st("update.router", "on", { title: "RouterOS", latest_version: "7.15" }),
  });
  const el = mount(w, { type: "x", entities: ["sensor.dwd"] }, hass);
  same(rows(el).map((r) => r.title), ["Sturm", "Glatteis", "RouterOS"], "critical first, then newest");
  same(head(el).title, "Sturm", "head shows the top item");
  same(head(el).badge, "3", "badge");
});

test("local dismissal", () => {
  const w = makeWindow();
  const hass = makeHass({ "binary_sensor.door": st("binary_sensor.door", "on", { friendly_name: "Door" }) });
  const el = mount(w, { type: "x", hide_when_empty: false, entities: ["binary_sensor.door"] }, hass);
  same(rows(el).length, 1);
  el.shadowRoot.querySelector(".row .x").click();
  same(rows(el).length, 0);
});

test("editor schema", () => {
  const w = makeWindow();
  const ed = w.document.createElement("origami-notifications-editor");
  ed.setConfig({ type: "x", entities: ["calendar.family"] });
  ed.hass = makeHass({ "calendar.family": st("calendar.family", "off", { friendly_name: "Family" }) });
  const form = ed.querySelector("ha-form");
  same(form.schema.map((s) => s.name || s.type), ["entities", "label", "grid", "hide_when_empty", "options", "audience"]);
  same(
    form.schema.find((s) => s.name === "options").schema[0].schema.map((s) => s.name || s.type),
    ["type", "attribute", "grid", "image", "background", "tap_action"],
    "entity options"
  );
  same(
    form.schema.find((s) => s.name === "audience").schema.map((s) => s.name),
    ["system", "updates", "repairs", "calendar.family"],
    "audience sources"
  );
});

test("hidden the way Home Assistant expects", () => {
  const w = makeWindow();
  const events = [];
  const el = w.document.createElement("origami-notifications");
  el.addEventListener("card-visibility-changed", (e) => events.push(e.detail.value));
  el.setConfig({ type: "x", entities: ["binary_sensor.door"] });
  w.document.body.appendChild(el);
  const off = st("binary_sensor.door", "off", { friendly_name: "Door" });
  el.hass = makeHass({ "binary_sensor.door": off });
  same(el.connectedWhileHidden, true, "stays attached while hidden");
  same(el.hidden, true, "hidden attribute when empty");
  el.hass = makeHass({ "binary_sensor.door": { ...off, state: "on" } });
  same([el.hidden, events], [false, [false, true]], "shown again with content");
  el.preview = true;
  el.hass = makeHass({ "binary_sensor.door": off });
  same(el.hidden, false, "never hidden in the dashboard editor");
});

test("pictures from attributes, the picture type and the background", () => {
  const w = makeWindow();
  const hass = makeHass({
    "sensor.dinner": st("sensor.dinner", "Lasagne", {
      friendly_name: "Dinner",
      recipe: { name: "Lasagne", image: "/local/food/lasagne.jpg" },
    }),
    "sensor.book": st("sensor.book", "Dune", { friendly_name: "Book of the day", cover: "https://img.test/dune.jpg" }),
    "media_player.tv": st("media_player.tv", "playing", {
      friendly_name: "TV",
      entity_picture: "/api/media_player_proxy/media_player.tv",
    }),
  });
  const config = {
    type: "x",
    entities: [
      { entity: "sensor.dinner", background: true },
      { entity: "sensor.book", type: "picture", image: "cover" },
      { entity: "media_player.tv", type: "generic" },
    ],
  };
  const el = mount(w, config, hass);
  const byTitle = Object.fromEntries(rows(el).map((r) => [r.title, r]));
  same(byTitle.Lasagne.body, "Dinner", "recipe falls back to the entity name");
  same(byTitle.Dune.body, "Book of the day", "picture type: the state is the title");
  const img = (title) =>
    [...el.shadowRoot.querySelectorAll(".row")]
      .find((r) => r.querySelector(".title").textContent === title)
      .querySelector(".rtile img")
      .getAttribute("src");
  same([img("Lasagne"), img("Dune"), img("TV")], [
    "http://ha.local/local/food/lasagne.jpg",
    "https://img.test/dune.jpg",
    "http://ha.local/api/media_player_proxy/media_player.tv",
  ], "images from any source");
  const bg = (card) => [...card.shadowRoot.querySelectorAll(".backdrop img")].map((i) => i.getAttribute("src")).filter(Boolean);
  const later = (s) => ({ ...s, last_changed: "2026-09-21T11:00:00+00:00" });
  const onTop = (id) => mount(w, config, makeHass({ ...hass.states, [id]: later(hass.states[id]) }));
  same(bg(onTop("sensor.dinner")), ["http://ha.local/local/food/lasagne.jpg"], "background from the item on top");
  same(bg(onTop("sensor.book")), [], "no background for sources without it");
});

test("any attribute can describe the notification", () => {
  const w = makeWindow();
  const hass = makeHass({
    "sensor.library": st("sensor.library", "3", {
      friendly_name: "Library",
      due: { title: "Dune", summary: "Due back tomorrow", image: "/local/dune.jpg" },
    }),
    "sensor.bins": st("sensor.bins", "2026-10-03", { friendly_name: "Bin day", next: "Paper" }),
    "sensor.parcel": st("sensor.parcel", "0", { friendly_name: "Parcel", item: null }),
    "sensor.dinner": st("sensor.dinner", "Lasagne", { friendly_name: "Dinner", recipe: { name: "Lasagne" } }),
  });
  const el = mount(
    w,
    {
      type: "x",
      updates: false,
      entities: [
        "sensor.library",
        { entity: "sensor.bins", attribute: "next" },
        { entity: "sensor.parcel", attribute: "item" },
        { entity: "sensor.dinner", type: "recipe" },
      ],
    },
    hass
  );
  const byTitle = Object.fromEntries(rows(el).map((r) => [r.title, r]));
  same([byTitle.Dune.body, byTitle.Dune.icon], ["Due back tomorrow", "mdi:card-text-outline"], "an object in any attribute is found on its own");
  same(byTitle.Paper.body, "Bin day", "a plain value becomes the title");
  same(Object.keys(byTitle).includes("Parcel"), false, "an empty attribute shows nothing");
  same(byTitle.Lasagne.body, "Dinner", "type: recipe from 0.2 still works");

  const empty = makeHass({
    "sensor.dinner": st("sensor.dinner", "2", { friendly_name: "Dinner", recipe: null }),
    "sensor.lunch": st("sensor.lunch", "none", { friendly_name: "Lunch", recipe: "none" }),
  });
  const quiet = mount(w, { type: "x", updates: false, hide_when_empty: false, entities: ["sensor.dinner", { entity: "sensor.lunch", type: "recipe" }] }, empty);
  same(rows(quiet).length, 0, "an empty recipe shows nothing, as in 0.2");

  const ed = w.document.createElement("origami-notifications-editor");
  ed.setConfig({ type: "x", entities: [{ entity: "sensor.dinner", type: "recipe" }] });
  ed.hass = hass;
  const opts = ed.querySelector("ha-form").data.options["sensor.dinner"];
  same([opts.type, opts.attribute], ["attribute", "recipe"], "the editor shows type: recipe as an attribute");
});

test("found on its own only where an attribute describes something", () => {
  const w = makeWindow();
  const hass = makeHass({
    "binary_sensor.door": st("binary_sensor.door", "off", { friendly_name: "Door", zone: { name: "Hall" } }),
    "sensor.book": st("sensor.book", "Dune", { friendly_name: "Book", shelf: { title: "Sci-fi", image: "/local/shelf.jpg" } }),
  });
  const el = mount(w, { type: "x", updates: false, hide_when_empty: false, entities: ["binary_sensor.door", { entity: "sensor.book", type: "picture" }] }, hass);
  same(rows(el).some((r) => r.title === "Hall"), false, "a bare name in an attribute does not make a row");
  same(rows(el).map((r) => [r.title, r.body]), [["Dune", "Book"]], "type: picture keeps the state as its title");

  const ed = w.document.createElement("origami-notifications-editor");
  ed.setConfig({ type: "custom:origami-notifications", entities: [{ entity: "sensor.book", type: "recipe" }] });
  ed.hass = hass;
  let written = null;
  ed.addEventListener("config-changed", (e) => (written = e.detail.config));
  const form = ed.querySelector("ha-form");
  const value = JSON.parse(JSON.stringify(form.data));
  value.options["sensor.book"].background = true;
  form.dispatchEvent(new w.CustomEvent("value-changed", { detail: { value } }));
  same(written.entities, [{ entity: "sensor.book", type: "recipe", background: true }], "the editor writes type: recipe back as it was");
});

test("a dismissed entity comes back the next time it happens", () => {
  const w = makeWindow();
  w.localStorage.clear();
  const door = (state, at) => ({ ...st("binary_sensor.door", state, { friendly_name: "Door" }), last_changed: at });
  const config = { type: "x", updates: false, hide_when_empty: false, entities: ["binary_sensor.door"] };
  const el = mount(w, config, makeHass({ "binary_sensor.door": door("on", "2026-09-21T10:00:00+00:00") }));
  el.shadowRoot.querySelector(".row .x").click();
  same(rows(el).length, 0, "gone");
  el.hass = makeHass({ "binary_sensor.door": door("off", "2026-09-21T10:05:00+00:00") });
  el.hass = makeHass({ "binary_sensor.door": door("on", "2026-09-21T11:00:00+00:00") });
  same(rows(el).length, 1, "back when the door opens again");

  const w2 = makeWindow();
  w2.localStorage.setItem("origami-notifications-ack", JSON.stringify({ "g:binary_sensor.door": "Door\u0000on" }));
  const el2 = mount(w2, config, makeHass({ "binary_sensor.door": door("on", "2026-09-21T10:00:00+00:00") }));
  same(rows(el2).length, 0, "a dismissal from 0.2 still holds");
});

test("the card picker", () => {
  const w = makeWindow();
  same(w.customElements.get("origami-notifications").getStubConfig(), {}, "adds the card with the defaults");
  const picker = w.document.createElement("hui-card-picker");
  picker.attachShadow({ mode: "open" });
  w.document.body.appendChild(picker);
  const el = w.document.createElement("origami-notifications");
  el.setConfig({ type: "x", updates: false });
  el.hass = makeHass({});
  picker.shadowRoot.appendChild(el);
  same([el.hidden, el.shadowRoot.querySelector(".head .title").textContent], [false, "All quiet"], "shows an empty card as a preview");
});

test("persistent notifications are Markdown", () => {
  const w = makeWindow();
  const subs = [];
  const el = mount(w, { type: "x" }, makeHass({}, { subs }));
  const actions = [];
  el.addEventListener("hass-action", (e) => actions.push(e.detail.config.tap_action));
  subs[0].cb({
    type: "current",
    notifications: {
      n1: {
        notification_id: "n1",
        title: "**New devices**",
        message: "![logo](/static/logo.png) We found [2 devices](/config/integrations/dashboard).\n\n- Hue\n- `Z-Wave`",
      },
    },
  });
  same(rows(el).map((r) => [r.title, r.body]), [["New devices", "We found 2 devices.\n\nHue\nZ-Wave"]], "plain text");
  el.shadowRoot.querySelector(".row .rtile").click();
  same(actions, [{ action: "navigate", navigation_path: "/config/integrations/dashboard" }], "the link is the tap target");
});

test("a linked picture leads to its link", () => {
  const w = makeWindow();
  const subs = [];
  const el = mount(w, { type: "x" }, makeHass({}, { subs }));
  const actions = [];
  el.addEventListener("hass-action", (e) => actions.push(e.detail.config.tap_action.navigation_path));
  subs[0].cb({ type: "current", notifications: { n1: { notification_id: "n1", message: "[![cam](/api/cam.jpg)](/lovelace/cams) Someone rang." } } });
  el.shadowRoot.querySelector(".row .rtile").click();
  same(actions, ["/lovelace/cams"]);
});

test("a fixed height, also from the older layout_options", () => {
  const w = makeWindow();
  const bounded = (extra) => mount(w, { type: "x", ...extra }, makeHass({})).classList.contains("bounded");
  same(bounded({ grid_options: { rows: 4 } }), true, "grid_options.rows");
  same(bounded({ layout_options: { grid_rows: 4 } }), true, "layout_options.grid_rows");
  same(bounded({ grid_options: { columns: 6 }, layout_options: { grid_rows: 4 } }), false, "grid_options wins, as in Home Assistant");
});

test("tap actions go through Home Assistant", () => {
  const w = makeWindow();
  const hass = makeHass({
    "binary_sensor.door": st("binary_sensor.door", "on", { friendly_name: "Door" }),
    "binary_sensor.window": st("binary_sensor.window", "on", { friendly_name: "Window" }),
  });
  const el = mount(
    w,
    {
      type: "x",
      entities: [
        { entity: "binary_sensor.door", tap_action: { action: "navigate", navigation_path: "/lovelace/doors" } },
        { entity: "binary_sensor.window", tap_action: { action: "none" } },
      ],
    },
    hass
  );
  const actions = [];
  const infos = [];
  el.addEventListener("hass-action", (e) => actions.push(e.detail));
  el.addEventListener("hass-more-info", (e) => infos.push(e.detail.entityId));
  const tiles = Object.fromEntries(
    [...el.shadowRoot.querySelectorAll(".row")].map((r) => [r.querySelector(".title").textContent, r.querySelector(".rtile")])
  );
  tiles.Door.click();
  tiles.Window.click();
  same(actions, [
    { config: { entity: "binary_sensor.door", tap_action: { action: "navigate", navigation_path: "/lovelace/doors" } }, action: "tap" },
  ], "configured action is handed to Home Assistant");
  same([infos, tiles.Window.getAttribute("role")], [[], null], "action none does nothing");
});

test("other languages borrow Home Assistant's strings", () => {
  const w = makeWindow();
  const fr = {
    "ui.notification_drawer.title": "Notifications",
    "ui.notification_drawer.empty": "Aucune notification",
    "ui.dialogs.more_info_control.update.install": "Installer",
  };
  const localize = (k) => fr[k] || "";
  const hass = makeHass({ "update.router": st("update.router", "on", { title: "RouterOS", supported_features: 1 }) }, { lang: "fr", localize });
  same(rows(mount(w, { type: "x" }, hass))[0].actions, ["Installer"], "install in french");
  const idle = mount(w, { type: "x", hide_when_empty: false, updates: false }, makeHass({}, { lang: "fr", localize }));
  same(idle.shadowRoot.querySelector(".msg .t").textContent, "Aucune notification", "idle text in french");
});

test("the language follows the profile, English unless it is German", () => {
  const w = makeWindow();
  const texts = (lang) => {
    const el = mount(w, { type: "x", hide_when_empty: false, updates: false }, makeHass({}, { lang }));
    const ed = w.document.createElement("origami-notifications-editor");
    ed.setConfig({ type: "x" });
    ed.hass = makeHass({}, { lang });
    const form = ed.querySelector("ha-form");
    return [el.shadowRoot.querySelector(".head .title").textContent, form.computeLabel({ name: "hide_when_empty" })];
  };
  same(texts("en"), ["All quiet", "Hide when there is nothing to show"], "English");
  same(texts("en-GB"), ["All quiet", "Hide when there is nothing to show"], "British English");
  same(texts("de"), ["Alles ruhig", "Ausblenden, wenn nichts anliegt"], "German");
  same(texts("nl"), ["All quiet", "Hide when there is nothing to show"], "anything else is English, never German");
});

test("calendar", () => {
  const w = makeWindow();
  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const day = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());
  const hass = makeHass({
    "calendar.family": st("calendar.family", "on", { message: "Holiday", start_time: day + " 00:00:00", all_day: true }),
    "calendar.work": st("calendar.work", "on", { message: "Standup", start_time: day + " 09:30:00", all_day: false }),
  });
  hass.locale.time_format = "24";
  const el = mount(w, { type: "x", entities: ["calendar.family", "calendar.work"] }, hass);
  const byTitle = Object.fromEntries(rows(el).map((r) => [r.title, r.body]));
  same(byTitle.Holiday, "today", "all day events have no time");
  same(byTitle.Standup, "today at 09:30", "24 hour clock from the profile");
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
  same(written, {
    type: "custom:origami-notifications",
    entities: [{ entity: "sensor.dinner", background: true, actions: [{ label: "Cook" }] }],
  }, "options merged, defaults left out, YAML only keys kept");
});

test("loading the file twice", () => {
  const w = makeWindow();
  let error = null;
  try {
    w.eval(CODE);
  } catch (e) {
    error = e.message;
  }
  same([error, w.customCards.length], [null, 1], "no error, one picker entry");
});

test("repairs", async () => {
  const w = makeWindow();
  const issues = [
    {
      domain: "zwave_js",
      issue_id: "old_firmware",
      severity: "warning",
      created: "2026-09-21T08:00:00+00:00",
      translation_key: "old_firmware",
      breaks_in_ha_version: "2026.12",
    },
    { domain: "cloud", issue_id: "legacy", severity: "critical", created: "2026-09-21T07:00:00+00:00" },
    { domain: "hue", issue_id: "ignored_one", severity: "error", created: "2026-09-21T07:00:00+00:00", ignored: true },
  ];
  const asked = [];
  const hass = makeHass({}, {
    wsReply: () => ({ issues }),
    loadBackendTranslation: (category, domains) => {
      asked.push([category, domains]);
      return Promise.resolve((k) => (k.includes("old_firmware") ? "Z-Wave firmware is out of date" : ""));
    },
  });
  const el = mount(w, { type: "x" }, hass);
  await tick();
  same(rows(el).map((r) => [r.title, r.body, r.tile]), [
    ["Legacy", "", "rtile crit"],
    ["Z-Wave firmware is out of date", "Stops working in 2026.12", "rtile warn"],
  ], "repair rows");
  same(asked, [["issues", ["zwave_js", "cloud"]]], "issue translations are requested");
  el.shadowRoot.querySelectorAll(".row .x")[0].click();
  same(hass.calls.filter((c) => c[1] === "repairs/ignore_issue").map((c) => c[2]), [
    { type: "repairs/ignore_issue", domain: "cloud", issue_id: "legacy", ignore: true },
  ], "ignore issue");

  const guest = makeHass({}, { wsReply: () => ({ issues }), user: { id: "u2", is_admin: false } });
  mount(w, { type: "x" }, guest);
  await tick();
  same(guest.calls.some((c) => c[1] === "repairs/list_issues"), false, "no repairs request for non-admins");

  const off = makeHass({}, { wsReply: () => ({ issues }) });
  const el2 = mount(w, { type: "x", repairs: false, hide_when_empty: false }, off);
  await tick();
  same(rows(el2).length, 0, "repairs off");
});

test("a dismissal shows at once, Home Assistant confirms it later", async () => {
  const w = makeWindow();
  const warnings = [];
  w.console.warn = (...args) => warnings.push(args.join(" "));
  const subs = [];
  const hass = makeHass({}, { subs });
  const answers = [];
  hass.callService = (d, s, data) => {
    hass.calls.push([d + "." + s, data]);
    return new Promise((resolve, reject) => answers.push({ resolve, reject }));
  };
  const el = mount(w, { type: "x", hide_when_empty: false }, hass);
  const note = (id) => ({ notification_id: id, title: "Backup " + id, message: "done" });
  subs[0].cb({ type: "current", notifications: { n1: note("n1"), n2: note("n2") } });
  el.shadowRoot.querySelector(".row .x").click();
  const dismissals = () => hass.calls.filter((c) => c[0] === "persistent_notification.dismiss").length;
  same([rows(el).length, dismissals()], [1, 1], "gone before Home Assistant answers");
  answers[0].reject(new Error("refused"));
  await tick();
  same([rows(el).length, warnings.length], [2, 1], "back when Home Assistant refuses");

  el.shadowRoot.querySelector(".row .x").click();
  answers[1].resolve();
  await tick();
  same(rows(el).length, 1, "still away once confirmed");
  const key = [...el._pending.keys()][0];
  el._pending.set(key, Date.now() - 1);
  el._recompute();
  same(rows(el).length, 2, "back when it is still there after the wait");

  el.shadowRoot.querySelector(".row .x").click();
  const gone = [...el._pending.keys()][0].slice(2);
  subs[0].cb({ type: "removed", notifications: { [gone]: { notification_id: gone } } });
  same([el._pending.size, rows(el).length], [0, 1], "nothing pending once Home Assistant removed it");
});

test("clear all", () => {
  const w = makeWindow();
  const subs = [];
  const hass = makeHass({ "binary_sensor.door": st("binary_sensor.door", "on", { friendly_name: "Door" }) }, { subs });
  const el = mount(w, { type: "x", hide_when_empty: false, updates: false, entities: ["binary_sensor.door"] }, hass);
  subs[0].cb({ type: "current", notifications: { n1: { notification_id: "n1", message: "one" }, n2: { notification_id: "n2", message: "two" } } });
  el.shadowRoot.querySelector(".clear").click();
  same([rows(el).length, hass.calls.filter((c) => c[0] === "persistent_notification.dismiss").length], [0, 2]);
});

test("a card that hid itself comes back closed", () => {
  const w = makeWindow();
  const on = st("binary_sensor.door", "on", { friendly_name: "Door" });
  const el = mount(w, { type: "x", updates: false, entities: ["binary_sensor.door"] }, makeHass({ "binary_sensor.door": on }));
  el.shadowRoot.querySelector(".head").click();
  same(el.shadowRoot.querySelector("ha-card").classList.contains("open"), true, "open");
  el.hass = makeHass({ "binary_sensor.door": { ...on, state: "off" } });
  el.hass = makeHass({ "binary_sensor.door": on });
  same([el.hidden, el.shadowRoot.querySelector("ha-card").classList.contains("open")], [false, false], "closed again");
});

test("keyboard focus moves to the next row after a dismissal", () => {
  const w = makeWindow();
  const hass = makeHass({
    "binary_sensor.a": st("binary_sensor.a", "on", { friendly_name: "A" }),
    "binary_sensor.b": st("binary_sensor.b", "on", { friendly_name: "B" }),
  });
  const el = mount(w, { type: "x", updates: false, entities: ["binary_sensor.a", "binary_sensor.b"] }, hass);
  el.shadowRoot.querySelector(".head").click();
  const x = el.shadowRoot.querySelector(".row .x");
  x.focus();
  x.click();
  const focused = el.shadowRoot.activeElement;
  same(focused && focused.closest(".row").querySelector(".title").textContent, "B");
});

test("a calendar shows only while an event runs", () => {
  const w = makeWindow();
  const hass = makeHass({ "calendar.family": st("calendar.family", "off", { message: "Dentist", start_time: "2030-01-01 09:00:00" }) });
  same(rows(mount(w, { type: "x", hide_when_empty: false, updates: false, entities: ["calendar.family"] }, hass)).length, 0);
});

test("calendar times are read in the server's time zone", () => {
  const w = makeWindow();
  const hass = makeHass({
    "calendar.trip": st("calendar.trip", "on", { message: "Flight", start_time: "2020-01-15 09:30:00", all_day: false }),
  });
  hass.config = { time_zone: "Pacific/Auckland" };
  hass.locale = { language: "en", time_format: "24", time_zone: "server" };
  const el = mount(w, { type: "x", entities: ["calendar.trip"] }, hass);
  same(rows(el)[0].body, "on 01/15 at 09:30");
});

test("non-admins can't install or skip updates, they hide them in this browser", () => {
  const w = makeWindow();
  const hass = makeHass(
    { "update.router": st("update.router", "on", { title: "RouterOS", latest_version: "7.15", supported_features: 1 }) },
    { user: { id: "u2", is_admin: false } }
  );
  const el = mount(w, { type: "x" }, hass);
  same(rows(el)[0].actions, [], "no install button");
  el.shadowRoot.querySelector(".row .x").click();
  same([rows(el).length, hass.calls.some((c) => c[0] === "update.skip")], [0, false], "hidden, not skipped");
});

test("a picture URL Home Assistant can't parse costs only the picture", () => {
  const w = makeWindow();
  const hass = makeHass({
    "sensor.cam": st("sensor.cam", "on", { friendly_name: "Camera", entity_picture: "https://:8123/snap.jpg" }),
    "binary_sensor.door": st("binary_sensor.door", "on", { friendly_name: "Door" }),
  });
  hass.hassUrl = (p) => new w.URL(p, "http://ha.local").toString();
  const el = mount(w, { type: "x", updates: false, entities: ["sensor.cam", "binary_sensor.door"] }, hass);
  same(rows(el).map((r) => r.title).sort(), ["Camera", "Door"]);
});

test("a local dismissal survives a new language and a new formatter", () => {
  const w = makeWindow();
  const door = st("binary_sensor.door", "on", { friendly_name: "Door" });
  const config = { type: "x", hide_when_empty: false, updates: false, entities: ["binary_sensor.door"] };
  const el = mount(w, config, makeHass({ "binary_sensor.door": door }, { formatEntityState: () => "Open" }));
  el.shadowRoot.querySelector(".row .x").click();
  el.hass = makeHass({ "binary_sensor.door": door }, { lang: "de", formatEntityState: () => "Offen" });
  same(rows(el).length, 0, "after switching to German");
  el.hass = makeHass({ "binary_sensor.door": door }, { lang: "de", formatEntityState: (s) => s.state });
  same(rows(el).length, 0, "with Home Assistant's placeholder formatter");
});

test("a dismissal from 0.3 still holds", () => {
  const w = makeWindow();
  const door = st("binary_sensor.door", "on", { friendly_name: "Door" });
  const ts = Date.parse(door.last_changed);
  w.localStorage.setItem("origami-notifications-ack", JSON.stringify({ "g:binary_sensor.door": "Door\u0000Open\u0000" + ts }));
  const el = mount(w, { type: "x", hide_when_empty: false, updates: false, entities: ["binary_sensor.door"] }, makeHass({ "binary_sensor.door": door }, { formatEntityState: () => "Open" }));
  same(rows(el).length, 0);
});

test("dismissals from 0.3 of warnings, values and renamed rows still hold", () => {
  const w = makeWindow();
  const start = "2026-09-21T09:00:00+02:00";
  w.localStorage.setItem(
    "origami-notifications-ack",
    JSON.stringify({
      "w:sensor.dwd:1": "Frost\u0000Level 3\u0000" + Date.parse(start),
      "r:sensor.parcels": "1500\u0000Parcels",
      "r:sensor.lunch": "Today's lunch\u0000Hot",
    })
  );
  const hass = makeHass({
    "sensor.dwd": st("sensor.dwd", "1", { warning_count: 1, warning_1_name: "Frost", warning_1_headline: "Frost", warning_1_level: 3, warning_1_start: start }),
    "sensor.parcels": st("sensor.parcels", "x", { friendly_name: "Parcels", count: 1500 }),
    "sensor.lunch": st("sensor.lunch", "x", { friendly_name: "Lunch", recipe: { name: "Soup", description: "Hot" } }),
  });
  hass.formatEntityAttributeValue = () => "1,500";
  const entities = ["sensor.dwd", { entity: "sensor.parcels", attribute: "count" }, { entity: "sensor.lunch", name: "Today's lunch" }];
  const el = mount(w, { type: "x", hide_when_empty: false, updates: false, entities }, hass);
  same(rows(el).length, 0);
});

test("new formatters from Home Assistant are picked up", () => {
  const w = makeWindow();
  const states = { "alarm_control_panel.house": st("alarm_control_panel.house", "triggered", { friendly_name: "House" }) };
  const hass = makeHass(states, { formatEntityState: (s) => s.state });
  const el = mount(w, { type: "x", entities: ["alarm_control_panel.house"] }, hass);
  same(rows(el)[0].body, "triggered", "placeholder");
  el.hass = { ...hass, formatEntityState: () => "Triggered" };
  same(rows(el)[0].body, "Triggered", "real formatter");
});

test("an update whose state arrives after the card loaded shows up", () => {
  const w = makeWindow();
  const entities = { "update.hacs": { entity_id: "update.hacs", labels: [] } };
  const hass = makeHass({}, { entities });
  const el = mount(w, { type: "x", hide_when_empty: false }, hass);
  same(rows(el).length, 0);
  el.hass = { ...hass, states: { "update.hacs": st("update.hacs", "on", { title: "HACS", latest_version: "2.1" }) } };
  same(rows(el).map((r) => r.title), ["HACS"]);
});

test("repairs are fetched again when the card comes back", async () => {
  const w = makeWindow();
  let issues = [];
  const hass = makeHass({}, { wsReply: () => ({ issues }) });
  const el = mount(w, { type: "x", hide_when_empty: false, updates: false }, hass);
  await tick();
  el.remove();
  issues = [{ domain: "hue", issue_id: "bridge_offline", severity: "error", created: "2026-09-21T07:00:00+00:00" }];
  w.document.body.appendChild(el);
  await tick();
  same(rows(el).map((r) => r.title), ["Bridge offline"]);
});

test("repairs are for admins only, also when the user arrives late", async () => {
  const w = makeWindow();
  const issues = [{ domain: "hue", issue_id: "bridge_offline", severity: "error", created: "2026-09-21T07:00:00+00:00" }];
  const hass = makeHass({}, { wsReply: () => ({ issues }) });
  hass.user = null;
  const el = mount(w, { type: "x", hide_when_empty: false, updates: false }, hass);
  await tick();
  same(rows(el).length, 0, "no user yet");
  el.hass = { ...hass, user: { id: "u1", is_admin: true } };
  await tick();
  same(rows(el).length, 1, "an admin");
});

test("a dismissed DWD warning stays dismissed when an earlier one ends", () => {
  const w = makeWindow();
  const warning = (i, name, start) => ({
    ["warning_" + i + "_name"]: name,
    ["warning_" + i + "_headline"]: name,
    ["warning_" + i + "_level"]: 2,
    ["warning_" + i + "_start"]: start,
  });
  const storm = warning(1, "Storm", "2026-09-21T08:00:00+00:00");
  const frost = (i) => warning(i, "Frost", "2026-09-21T09:00:00+00:00");
  const config = { type: "x", hide_when_empty: false, updates: false, entities: ["sensor.dwd"] };
  const el = mount(w, config, makeHass({ "sensor.dwd": st("sensor.dwd", "2", { warning_count: 2, ...storm, ...frost(2) }) }));
  for (const x of el.shadowRoot.querySelectorAll(".row .x")) x.click();
  el.hass = makeHass({ "sensor.dwd": st("sensor.dwd", "1", { warning_count: 1, ...frost(1) }) });
  same(rows(el).length, 0);
});

test("name replaces the entity's name, not what the row is about", () => {
  const w = makeWindow();
  const hass = makeHass({
    "calendar.family": st("calendar.family", "on", { message: "Dentist", start_time: "2020-01-15 09:30:00" }),
    "sensor.dish": st("sensor.dish", "Lasagne", { friendly_name: "Dish of the day" }),
    "binary_sensor.door": st("binary_sensor.door", "on", { friendly_name: "binary_sensor.door" }),
  });
  const el = mount(
    w,
    {
      type: "x",
      updates: false,
      entities: [
        { entity: "calendar.family", name: "Family" },
        { entity: "sensor.dish", type: "picture", name: "Dinner" },
        { entity: "binary_sensor.door", name: "Front door" },
      ],
    },
    hass
  );
  const byTitle = Object.fromEntries(rows(el).map((r) => [r.title, r.body]));
  same(Object.keys(byTitle).sort(), ["Dentist", "Front door", "Lasagne"]);
  same(byTitle.Lasagne, "Dinner");
});

test("a name that resolves to nothing falls back to the entity's own name", () => {
  const w = makeWindow();
  const hass = makeHass({ "binary_sensor.door": st("binary_sensor.door", "on", { friendly_name: "Door" }) });
  hass.formatEntityName = (s, name) => (name ? "" : s.attributes.friendly_name);
  const el = mount(w, { type: "x", updates: false, entities: [{ entity: "binary_sensor.door", name: [{ type: "area" }] }] }, hass);
  same(rows(el)[0].title, "Door");
});

test("cards in one browser share their dismissals", () => {
  const w = makeWindow();
  const states = {
    "binary_sensor.door": st("binary_sensor.door", "on", { friendly_name: "Door" }),
    "binary_sensor.window": st("binary_sensor.window", "on", { friendly_name: "Window" }),
  };
  const config = { type: "x", hide_when_empty: false, updates: false, entities: ["binary_sensor.door", "binary_sensor.window"] };
  const a = mount(w, config, makeHass(states));
  const b = mount(w, config, makeHass(states));
  const x = (el, title) =>
    [...el.shadowRoot.querySelectorAll(".row")].find((r) => r.querySelector(".title").textContent === title).querySelector(".x");
  x(a, "Door").click();
  same(rows(b).map((r) => r.title), ["Window"], "gone in the other card at once");
  x(b, "Window").click();
  same(rows(mount(w, config, makeHass(states))).length, 0, "both stay dismissed after a reload");
});

test("the dismissals of rows that are gone are dropped first", () => {
  const w = makeWindow();
  const door = st("binary_sensor.door", "on", { friendly_name: "Door" });
  const acks = { "g:binary_sensor.door": "on\u0000" + Date.parse(door.last_changed) };
  for (let i = 0; i < 63; i++) acks["g:sensor.gone_" + i] = "x";
  w.localStorage.setItem("origami-notifications-ack", JSON.stringify(acks));
  const states = { "binary_sensor.door": door, "binary_sensor.window": st("binary_sensor.window", "on", { friendly_name: "Window" }) };
  const config = { type: "x", hide_when_empty: false, updates: false, entities: ["binary_sensor.door", "binary_sensor.window"] };
  const el = mount(w, config, makeHass(states));
  same(rows(el).map((r) => r.title), ["Window"], "the door was dismissed long ago");
  el.shadowRoot.querySelector(".row .x").click();
  same(rows(el).length, 0, "the door stays dismissed once there are more than 64");
});

test("a dismissed attribute row comes back after its attribute was empty", () => {
  const w = makeWindow();
  const bins = (next) => st("sensor.bins", "1", { friendly_name: "Bins", next });
  const paper = { name: "Paper", description: "Put it out tonight" };
  const config = { type: "x", hide_when_empty: false, updates: false, entities: ["sensor.bins"] };
  const el = mount(w, config, makeHass({ "sensor.bins": bins(paper) }));
  el.shadowRoot.querySelector(".row .x").click();
  el.hass = makeHass({ "sensor.bins": bins(paper) });
  same(rows(el).length, 0, "still hidden");
  el.hass = makeHass({ "sensor.bins": bins(null) });
  el.hass = makeHass({ "sensor.bins": bins(paper) });
  same(rows(el).length, 1, "back two weeks later");
});

test("type: generic treats 0.0 as off", () => {
  const w = makeWindow();
  const hass = makeHass({ "sensor.rain": st("sensor.rain", "0.0", { friendly_name: "Rain" }) });
  same(rows(mount(w, { type: "x", hide_when_empty: false, updates: false, entities: [{ entity: "sensor.rain", type: "generic" }] }, hass)).length, 0);
});

test("attribute values are formatted by Home Assistant, objects are never shown raw", () => {
  const w = makeWindow();
  const hass = makeHass({
    "sensor.bins": st("sensor.bins", "1", { friendly_name: "Bins", next: "2026-10-05T06:00:00+00:00" }),
    "sensor.parcel": st("sensor.parcel", "1", { friendly_name: "Parcel", item: { name: "Shoes", description: { text: "x" } } }),
  });
  hass.formatEntityAttributeValue = (s, attr, value) => (attr === "next" ? "October 5" : String(value));
  const el = mount(w, { type: "x", updates: false, entities: [{ entity: "sensor.bins", attribute: "next" }, { entity: "sensor.parcel", attribute: "item" }] }, hass);
  same(rows(el).map((r) => [r.title, r.body]).sort(), [["October 5", "Bins"], ["Shoes", "Parcel"]]);
});

test("a broken config gets a clear error", () => {
  const w = makeWindow();
  const error = (config) => {
    try {
      w.document.createElement("origami-notifications").setConfig({ type: "x", ...config });
      return null;
    } catch (e) {
      return e.message;
    }
  };
  same(error({ entities: "sensor.door" }), "origami-notifications: entities must be a list");
  same(error({ entities: [{ entity: "sensor.door", background: "yes" }] }), "origami-notifications: background must be true or false");
});

test("loose configs that worked before still work", () => {
  const w = makeWindow();
  const hass = makeHass({
    "binary_sensor.door": st("binary_sensor.door", "on", { friendly_name: "Door" }),
    "binary_sensor.window": st("binary_sensor.window", "on", { friendly_name: "Window" }),
  });
  const config = {
    type: "x",
    updates: false,
    entities: [
      { entity: "binary_sensor.door", tap_action: "more-info", actions: [null, { label: "Open", tap_action: { action: "toggle" } }] },
      { entity: "binary_sensor.window", tap_action: "none", actions: "Open" },
    ],
  };
  const el = mount(w, config, hass);
  const infos = [];
  el.addEventListener("hass-more-info", (e) => infos.push(e.detail.entityId));
  el.addEventListener("hass-action", (e) => infos.push(e.detail.config.tap_action.action));
  for (const tile of el.shadowRoot.querySelectorAll(".rtile")) tile.click();
  same([rows(el).map((r) => r.actions), infos], [[["Open"], []], ["more-info"]]);
});

test("Home Assistant's failed login notice is left out, nothing else", () => {
  const w = makeWindow();
  const subs = [];
  const el = mount(w, { type: "x", updates: false }, makeHass({}, { subs }));
  subs[0].cb({
    type: "current",
    notifications: {
      "http-login": { notification_id: "http-login", title: "Login attempt failed", message: "Login attempt or request with invalid authentication from 10.0.0.9." },
      n1: { notification_id: "n1", title: "Mail", message: "IMAP login failed: invalid authentication." },
    },
  });
  same(rows(el).map((r) => r.title), ["Mail"]);
});

test("an alert has no text, and the header shows its name once", () => {
  const w = makeWindow();
  const hass = makeHass({ "alert.garage": st("alert.garage", "on", { friendly_name: "Garage open" }) });
  const el = mount(w, { type: "x", updates: false, entities: ["alert.garage"] }, hass);
  same(rows(el)[0].body, "");
  same([el.shadowRoot.querySelector(".head").classList.contains("single"), el.shadowRoot.querySelector(".msg .t").textContent], [true, ""]);
});

test("other languages borrow Home Assistant's word for dismiss", () => {
  const w = makeWindow();
  const localize = (k) => (k === "ui.card.persistent_notification.dismiss" ? "Ignorer" : "");
  const el = mount(w, { type: "x", updates: false, entities: ["binary_sensor.door"] }, makeHass({ "binary_sensor.door": st("binary_sensor.door", "on") }, { lang: "fr", localize }));
  same(el.shadowRoot.querySelector(".row .x").getAttribute("aria-label"), "Ignorer");
});

test("relative times round before they pick a unit", () => {
  const w = makeWindow();
  const ago = (s) => ({ ...st("binary_sensor.door", "on", { friendly_name: "Door" }), last_changed: new Date(Date.now() - s * 1000).toISOString() });
  const when = (s) => {
    const el = mount(w, { type: "x", updates: false, entities: ["binary_sensor.door"] }, makeHass({ "binary_sensor.door": ago(s) }));
    return el.shadowRoot.querySelector(".row .when").textContent;
  };
  same([when(3580), when(23.8 * 3600)], ["1 hr. ago", "yesterday"]);
});

test("an open card that is moved keeps its times up to date", () => {
  const w = makeWindow();
  const el = mount(w, { type: "x", updates: false, entities: ["binary_sensor.door"] }, makeHass({ "binary_sensor.door": st("binary_sensor.door", "on") }));
  el.shadowRoot.querySelector(".head").click();
  el.remove();
  w.document.body.appendChild(el);
  same(Boolean(el._clock), true);
});

test("a new config shows at once, without waiting for Home Assistant", () => {
  const w = makeWindow();
  const states = { "binary_sensor.door": st("binary_sensor.door", "on", { friendly_name: "Door" }) };
  const el = mount(w, { type: "x", hide_when_empty: false, updates: false }, makeHass(states));
  el.setConfig({ type: "x", hide_when_empty: false, updates: false, entities: ["binary_sensor.door"] });
  same(rows(el).map((r) => r.title), ["Door"]);
});

test("rows can be styled by kind and severity", () => {
  const w = makeWindow();
  const hass = makeHass({ "alarm_control_panel.house": st("alarm_control_panel.house", "triggered", { friendly_name: "House" }) });
  const el = mount(w, { type: "x", updates: false, entities: ["alarm_control_panel.house"] }, hass);
  const row = el.shadowRoot.querySelector(".row");
  same([row.className, row.dataset.kind, row.getAttribute("role")], ["row crit link", "alarm", "listitem"]);
});

/* jsdom neither computes styles nor parses sheets inside a shadow root, so these read the card's
 * rules from a copy in the page. */
const cssRules = (el) => {
  const style = el.ownerDocument.createElement("style");
  style.textContent = el.shadowRoot.querySelector("style").textContent;
  el.ownerDocument.head.append(style);
  return [...style.sheet.cssRules].filter((r) => r.selectorText);
};

test("the closed tile has a colour only for warnings and critical rows", () => {
  const w = makeWindow();
  const el = mount(w, { type: "x", hide_when_empty: false }, makeHass({}));
  const background = (selector) => cssRules(el).find((r) => r.selectorText === selector).style.getPropertyValue("background");
  same(background(".tile"), background(".rtile"));
  assert.notEqual(background(".tile.warn"), background(".tile"));
});

test("keyboard focus on a row shows all of its text, like a tap", () => {
  const w = makeWindow();
  const el = mount(w, { type: "x", hide_when_empty: false }, makeHass({}));
  const open = cssRules(el).filter((r) => /\.open\b.*\.(title|body)$/.test(r.selectorText));
  same(open.map((r) => r.selectorText.includes(":has(:focus-visible)")), [true, true]);
});

test("keyboard focus stays on a row that is built again", () => {
  const w = makeWindow();
  const update = (pct) =>
    makeHass({ "update.nas": st("update.nas", "on", { title: "NAS", latest_version: "2", in_progress: true, update_percentage: pct }) });
  const el = mount(w, { type: "x" }, update(10));
  el.shadowRoot.querySelector(".head").click();
  el.shadowRoot.querySelector(".row .x").focus();
  el.hass = update(11);
  same(el.shadowRoot.activeElement && el.shadowRoot.activeElement.className, "x");
});

test("a height limit makes the open list scroll, also when it is set on ha-card", () => {
  const w = makeWindow();
  const el = mount(w, { type: "x", updates: false, entities: ["binary_sensor.door"] }, makeHass({ "binary_sensor.door": st("binary_sensor.door", "on") }));
  el.shadowRoot.querySelector("ha-card").style.setProperty("--origami-max-height", "200px");
  el.shadowRoot.querySelector(".head").click();
  same([el.classList.contains("capped"), el.shadowRoot.querySelector("ha-card").classList.contains("settled")], [true, true]);
});

test("a card that shows an entity another way keeps the other card's dismissal", () => {
  const w = makeWindow();
  const dinner = { "sensor.dinner": st("sensor.dinner", "Lasagne", { friendly_name: "Dinner", recipe: { name: "Lasagne", description: "Pasta" } }) };
  const a = mount(w, { type: "x", hide_when_empty: false, updates: false, entities: ["sensor.dinner"] }, makeHass(dinner));
  mount(w, { type: "x", hide_when_empty: false, updates: false, entities: [{ entity: "sensor.dinner", type: "generic" }] }, makeHass(dinner));
  a.shadowRoot.querySelector(".row .x").click();
  same(rows(a).length, 0);
});

test("dismissing works for the page where storage is blocked", () => {
  const w = makeWindow();
  w.Storage.prototype.setItem = () => {
    throw new w.DOMException("blocked", "QuotaExceededError");
  };
  const states = { "binary_sensor.door": st("binary_sensor.door", "on", { friendly_name: "Door" }) };
  const el = mount(w, { type: "x", hide_when_empty: false, updates: false, entities: ["binary_sensor.door"] }, makeHass(states));
  el.shadowRoot.querySelector(".row .x").click();
  el.hass = makeHass(states);
  same(rows(el).length, 0);
});

test("two warnings of one event and onset are dismissed one by one", () => {
  const w = makeWindow();
  const warning = (i, headline) => ({
    ["warning_" + i + "_name"]: "SNOW",
    ["warning_" + i + "_headline"]: headline,
    ["warning_" + i + "_level"]: 2,
    ["warning_" + i + "_start"]: "2026-09-21T08:00:00+00:00",
  });
  const dwd = () => makeHass({ "sensor.dwd": st("sensor.dwd", "2", { warning_count: 2, ...warning(1, "Snow above 800 m"), ...warning(2, "Snow above 400 m") }) });
  const el = mount(w, { type: "x", hide_when_empty: false, updates: false, entities: ["sensor.dwd"] }, dwd());
  el.shadowRoot.querySelector(".row .x").click();
  el.hass = dwd();
  same(rows(el).length, 1);
});

test("the dismissals another card still shows are dropped last", () => {
  const w = makeWindow();
  const acks = { "r:sensor.dinner": "Lasagne\u0000Pasta" };
  for (let i = 0; i < 63; i++) acks["g:sensor.gone_" + i] = "x";
  w.localStorage.setItem("origami-notifications-ack", JSON.stringify(acks));
  const dinner = { "sensor.dinner": st("sensor.dinner", "Lasagne", { friendly_name: "Dinner", recipe: { name: "Lasagne", description: "Pasta" } }) };
  const b = mount(w, { type: "x", hide_when_empty: false, updates: false, entities: ["sensor.dinner"] }, makeHass(dinner));
  const door = { "binary_sensor.door": st("binary_sensor.door", "on", { friendly_name: "Door" }) };
  const a = mount(w, { type: "x", hide_when_empty: false, updates: false, entities: ["binary_sensor.door"] }, makeHass(door));
  a.shadowRoot.querySelector(".row .x").click();
  b.hass = makeHass(dinner);
  same(rows(b).length, 0);
});

test("repairs are fetched once when the user arrives late", async () => {
  const w = makeWindow();
  const hass = makeHass({});
  hass.user = null;
  const el = mount(w, { type: "x" }, hass);
  el.hass = { ...hass, user: { id: "u1", is_admin: true } };
  await tick();
  same(hass.calls.filter((c) => c[1] === "repairs/list_issues").length, 1);
});

describe("editor", () => {
  const edit = (w, config, hass, change) => {
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

  test("a rule leaves with its entity", () => {
    const w = makeWindow();
    const { written } = edit(w, { entities: ["binary_sensor.door"], audience: { "binary_sensor.door": { only: ["person.anna"] } } }, makeHass({}), (v) => {
      v.entities = [];
    });
    same(written, { type: "custom:origami-notifications" });
  });

  test("swapping an entity keeps its options and its rule", () => {
    const w = makeWindow();
    const door = { entity: "binary_sensor.door", icon: "mdi:door", actions: [{ label: "Open", tap_action: { action: "toggle" } }] };
    const { written } = edit(w, { entities: [door], audience: { "binary_sensor.door": { only: ["person.anna"] } } }, makeHass({}), (v) => {
      v.entities = ["binary_sensor.door_2"];
    });
    same(written, {
      type: "custom:origami-notifications",
      entities: [{ ...door, entity: "binary_sensor.door_2" }],
      audience: { "binary_sensor.door_2": { only: ["person.anna"] } },
    });
  });

  test("rules for updates stay, the card still applies them", () => {
    const w = makeWindow();
    const anna = { "person.anna": st("person.anna", "home", { user_id: "u1" }) };
    const off = edit(w, { entities: ["update.router"], audience: { updates: { except: ["person.anna"] } } }, makeHass(anna), (v) => {
      v.updates = false;
    });
    same(off.written.audience, { updates: { except: ["person.anna"] } }, "updates turned off");
    const rule = { "update.nas": { except: ["person.anna"] } };
    const gone = edit(w, { entities: ["update.nas"], audience: rule }, makeHass(anna), (v) => {
      v.entities = [];
    });
    same(gone.written.audience, rule, "update taken off the list");
    const swapped = edit(w, { entities: ["update.nas"], audience: rule }, makeHass(anna), (v) => {
      v.entities = ["update.other"];
    });
    same(swapped.written.audience, { ...rule, "update.other": rule["update.nas"] }, "update swapped");
  });

  test("duplicate entries show and keep the first, like the card", () => {
    const w = makeWindow();
    const { form, written } = edit(w, { entities: [{ entity: "binary_sensor.door", name: "Front" }, { entity: "binary_sensor.door", name: "Back" }] }, makeHass({}), (v) => {
      v.hide_when_empty = false;
    });
    same(form.data.options["binary_sensor.door"].name, "Front");
    same(written.entities, [{ entity: "binary_sensor.door", name: "Front" }]);
  });

  test("a config the card rejects is rejected by the editor too", () => {
    const w = makeWindow();
    const ed = w.document.createElement("origami-notifications-editor");
    assert.throws(() => ed.setConfig({ type: "x", entities: [{ name: "Washer" }] }), /entities must contain entity ids/);
  });

  test("type: recipe with an attribute is written back as it was", () => {
    const w = makeWindow();
    const meal = { entity: "sensor.meal", type: "recipe", attribute: "dish" };
    const { written } = edit(w, { entities: [meal] }, makeHass({}), (v) => {
      v.repairs = false;
    });
    same(written.entities, [meal]);
  });

  test("a kind without an attribute drops the attribute", () => {
    const w = makeWindow();
    const { written } = edit(w, { entities: [{ entity: "binary_sensor.door", attribute: "zone" }] }, makeHass({}), (v) => {
      v.options["binary_sensor.door"].type = "generic";
    });
    same(written.entities, [{ entity: "binary_sensor.door", type: "generic" }]);
  });

  test("the attribute field explains what it does for a picture", () => {
    const w = makeWindow();
    const { form } = edit(w, { entities: [{ entity: "sensor.book", type: "picture" }] }, makeHass({}), () => {});
    const field = form.schema.find((s) => s.name === "options").schema[0].schema.find((s) => s.name === "attribute");
    assert.notEqual(form.computeHelper(field), form.computeHelper({ name: "attribute" }));
  });
});

test("the version matches package.json", () => {
  const { version } = require("../package.json");
  same(/const VERSION = "([^"]+)"/.exec(CODE)[1], version);
});

test("your css goes into the card, after its own", () => {
  const w = makeWindow();
  const css = ".row { border: 1px solid red; }";
  const el = mount(w, { type: "x", css }, makeHass({}));
  same([...el.shadowRoot.querySelectorAll("style")].pop().textContent, css);
});

test("a label adds every entity that carries it", () => {
  const w = makeWindow();
  const entities = { "binary_sensor.door": { entity_id: "binary_sensor.door", labels: ["notify"] }, "binary_sensor.window": { labels: [] } };
  const states = {
    "binary_sensor.door": st("binary_sensor.door", "on", { friendly_name: "Door" }),
    "binary_sensor.window": st("binary_sensor.window", "on", { friendly_name: "Window" }),
  };
  same(rows(mount(w, { type: "x", updates: false, label: "notify" }, makeHass(states, { entities }))).map((r) => r.title), ["Door"]);
});

test("an only rule shows a source to the listed people alone", () => {
  const w = makeWindow();
  const states = {
    "person.anna": st("person.anna", "home", { user_id: "u1" }),
    "binary_sensor.door": st("binary_sensor.door", "on", { friendly_name: "Door" }),
  };
  const config = { type: "x", hide_when_empty: false, updates: false, entities: ["binary_sensor.door"], audience: { "binary_sensor.door": { only: ["person.anna"] } } };
  same(rows(mount(w, config, makeHass(states, { user: { id: "u1" } }))).length, 1, "Anna");
  same(rows(mount(w, config, makeHass(states, { user: { id: "u2" } }))).length, 0, "someone else");
});

test("buttons and taps go to Home Assistant", () => {
  const w = makeWindow();
  const hass = makeHass({ "binary_sensor.doorbell": st("binary_sensor.doorbell", "on", { friendly_name: "Doorbell" }) });
  const open = { action: "perform-action", perform_action: "lock.open" };
  const el = mount(w, { type: "x", updates: false, entities: [{ entity: "binary_sensor.doorbell", actions: [{ label: "Open", tap_action: open }] }] }, hass);
  const actions = [];
  const infos = [];
  el.addEventListener("hass-action", (e) => actions.push(e.detail.config.tap_action));
  el.addEventListener("hass-more-info", (e) => infos.push(e.detail.entityId));
  el.shadowRoot.querySelector(".row .act").click();
  el.shadowRoot.querySelector(".row .rtile").click();
  same([actions, infos], [[open], ["binary_sensor.doorbell"]]);
});

test("install and skip are calls to Home Assistant", () => {
  const w = makeWindow();
  const hass = makeHass({ "update.router": st("update.router", "on", { title: "RouterOS", latest_version: "7.15", supported_features: 1 }) });
  const el = mount(w, { type: "x" }, hass);
  el.shadowRoot.querySelector(".row .act").click();
  el.shadowRoot.querySelector(".row .x").click();
  same(services(hass), [
    ["update.install", { entity_id: "update.router" }],
    ["update.skip", { entity_id: "update.router" }],
  ]);
});

/* A persistent notification, created this many minutes from NOW. */
const noteAt = (id, minutes, extra = {}) => ({
  notification_id: id,
  title: id,
  message: "",
  created_at: new Date(NOW + minutes * 60000).toISOString(),
  ...extra,
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

/* A state that changed this many milliseconds from NOW. */
const changedAt = (id, name, ms) => ({ ...st(id, "on", { friendly_name: name }), last_changed: new Date(NOW + ms).toISOString() });

const whens = (el) => [...el.shadowRoot.querySelectorAll(".row .when")].map((t) => t.textContent);

test("a future time sorts by how close it is to now", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const hass = makeHass(dwdAt(["a", -20], ["b", 5], ["c", -120], ["d", 180]));
  const el = mount(w, { type: "x", updates: false, entities: ["sensor.dwd"] }, hass);
  same(rows(el).map((r) => r.title), ["b", "a", "c", "d"], "closest first, ahead or behind");
  same(head(el).title, "b", "the head shows the closest");
  const sorted = w.__origamiTest.sortItems(
    [
      { key: "far", ts: NOW + 9000000 },
      { key: "crit", sev: "crit", ts: NOW - 90000000 },
      { key: "behind", ts: NOW - 60000, seq: 1 },
      { key: "ahead", ts: NOW + 60000, seq: 2 },
      { key: "b", ts: NOW + 120000 },
      { key: "a", ts: NOW - 120000 },
    ],
    NOW
  );
  same(sorted.map((it) => it.key), ["crit", "ahead", "behind", "a", "b", "far"], "critical first, a tie goes to the latest arrival, then to the key");
});

test("a time less than a minute away reads in a moment", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const card = (lang, seconds) => mount(w, { type: "x", updates: false, entities: ["sensor.dwd"] }, makeHass(dwdAt(["Frost", seconds / 60]), { lang }));
  const when = (el) => whens(el)[0];
  same([when(card("en", 30)), when(card("de", 30)), when(card("fr", 30))], ["in a moment", "gleich", "maintenant"], "other languages say now");
  same([when(card("en", 0)), when(card("en", 120))], ["just now", "in 2 min."], "now, and minutes ahead");
  const el = card("en", 30);
  mock.timers.tick(60000);
  same(when(el), "just now", "once the moment has passed");
});

test("what happened stays behind when the clock of Home Assistant runs ahead", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const subs = [];
  const states = {
    "binary_sensor.door": changedAt("binary_sensor.door", "Door", 600),
    "binary_sensor.gate": changedAt("binary_sensor.gate", "Gate", -1000),
    "binary_sensor.window": changedAt("binary_sensor.window", "Window", 2000),
  };
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, makeHass(states, { subs }));
  same(rows(el).map((r) => r.title), ["Window", "Door", "Gate"], "the newest first, as before");
  same(whens(el), ["just now", "just now", "just now"], "none of them lies ahead");
  same([el._clock, el._boundaryTimer], [null, null], "nothing ticks or waits on a closed card");
  subs[0].cb({ type: "current", notifications: { n: noteAt("Backup", 0.05) } });
  same([head(el).title, whens(el)[0]], ["Backup", "just now"], "a notification created seconds ahead is the newest");
  same(w.__origamiTest.sortItems([{ key: "b", ts: NOW + 5000 }, { key: "a", ts: NOW + 2000, past: true }], NOW).map((it) => it.key), ["a", "b"]);
});

test("an entry ahead takes the top once it is closer to now", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const states = { "binary_sensor.door": changedAt("binary_sensor.door", "Door", -120000), ...dwdAt(["Frost", 10]) };
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, makeHass(states));
  same(head(el).title, "Door", "two minutes behind is closer than ten ahead");
  mock.timers.tick(4 * 60000 + 49);
  same(head(el).title, "Door", "not before both are as close");
  mock.timers.tick(1);
  same([head(el).title, rows(el).map((r) => r.title)], ["Frost", ["Frost", "Door"]], "then the entry ahead comes first");
  const { nextReorder } = w.__origamiTest;
  const order = (...items) => nextReorder(items.map(([ts, sev], i) => ({ key: String(i), ts: NOW + ts, sev })), NOW);
  same(order([60000], [180000]), NOW + 120000, "two entries ahead swap once the first has passed");
  same(order([60000], [-180000]), null, "an entry behind never moves up");
  same(order([-60000, "crit"], [120000]), null, "nothing passes a critical entry");
  same(order([-60000], [60000]), NOW + 1, "a tie right now");
  same(order([-60000], [600000], [-120000], [240000]), NOW + 60000, "the earliest swap");
});

test("the clock runs on the minute while a time lies ahead or the list is open", () => {
  useClock(NOW + 15000);
  const w = makeWindow({ clock: true });
  let hass = makeHass(dwdAt(["past", -5]));
  const el = mount(w, { type: "x", updates: false, entities: ["sensor.dwd"] }, hass);
  const warnings = (...list) => {
    hass = { ...hass, states: dwdAt(...list) };
    el.hass = hass;
  };
  const when = () => whens(el)[0];
  const setHidden = (hidden) => {
    Object.defineProperty(w.document, "hidden", { configurable: true, get: () => hidden });
    w.document.dispatchEvent(new w.Event("visibilitychange"));
  };
  same(el._clock, null, "nothing changes on a closed card");
  warnings(["past", -5], ["ahead", 3]);
  const row = el.shadowRoot.querySelector(".row");
  same(when(), "in 3 min.");
  mock.timers.tick(44999);
  same(when(), "in 3 min.", "not before the minute");
  mock.timers.tick(1);
  same([when(), el.shadowRoot.querySelector(".row") === row], ["in 2 min.", true], "on the minute, in place");
  warnings(["past", -5]);
  same(el._clock, null, "stops once nothing lies ahead");
  el.shadowRoot.querySelector(".head").click();
  same([when(), Boolean(el._clock)], ["6 min. ago", true], "runs while the list is open");
  el._io.fire(false);
  mock.timers.tick(120000);
  same([when(), el._clock], ["6 min. ago", null], "stops off screen");
  el._io.fire(true);
  same([when(), Boolean(el._clock)], ["8 min. ago", true], "catches up back on screen");
  setHidden(true);
  mock.timers.tick(60000);
  same([when(), el._clock], ["8 min. ago", null], "stops in a hidden tab");
  setHidden(false);
  same([when(), Boolean(el._clock)], ["9 min. ago", true], "catches up when the tab shows again");
  el.remove();
  same([el._clock, el._io.disconnected], [null, true], "stops with the card gone");
  let refreshed = 0;
  el._refreshTimes = () => refreshed++;
  setHidden(false);
  same(refreshed, 0, "a card that is gone no longer follows the tab");
});

test("a countdown in view ticks by the second, in step with its end", () => {
  const w = makeWindow();
  const { nextTick, clockText } = w.__origamiTest;
  const now = NOW + 200;
  const timer = { key: "t", clock: true, ts: NOW + 300000 };
  const later = { key: "l", ts: NOW + 3600000 };
  const ended = { key: "e", clock: true, ts: NOW };
  same(nextTick([timer, later], timer, false, now), 800, "in the head");
  same(nextTick([later, timer], later, false, now), 59800, "out of sight, on the minute");
  same(nextTick([later, timer], later, true, now), 800, "in the open list");
  same(nextTick([ended], ended, false, now), 0, "a countdown that has ended");
  same(nextTick([{ key: "s", ts: NOW + 5000, past: true }], null, false, now), 0, "what happened never lies ahead");
  same(
    [299800, 299000, 59000, 3600000, 3723000, 0, -5, NaN].map((ms) => clockText(ms)),
    ["5:00", "4:59", "0:59", "1:00:00", "1:02:03", "0:00", "0:00", "0:00"],
    "rounded up, with hours from an hour on"
  );
});

test("the card wakes once for the earliest change, at most a day ahead", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const { wakeDelay, dropExpired, waker } = w.__origamiTest;
  same(wakeDelay([NOW + 9000, NOW + 2000, NOW + 5000], NOW), 2050, "the earliest, 50 ms after");
  same(wakeDelay([NOW + 3 * 86400000], NOW), 86400050, "a day at most");
  same(wakeDelay([NOW - 1000], NOW), 50, "a moment missed while the card was away");
  same(wakeDelay([], NOW), null, "nothing to wait for");
  const wakes = [];
  const kept = dropExpired(
    [
      { key: "gone", ts: NOW - 60000, expires: NOW },
      { key: "event", ts: NOW - 60000, expires: NOW + 7000 },
      { key: "countdown", ts: NOW + 3000, live: true },
      { key: "ended", ts: NOW, live: true },
      { key: "plain", ts: NOW + 1000 },
    ],
    NOW,
    waker(wakes, NOW)
  );
  same(
    [kept.map((it) => it.key), wakes],
    [["event", "countdown", "ended", "plain"], [NOW + 7000, NOW + 3000]],
    "an expired entry goes, the others name their next change, and an ended countdown has none"
  );

  const el = mount(w, { type: "x", hide_when_empty: false, updates: false }, makeHass({}));
  const recompute = el._recompute;
  let runs = 0;
  el._recompute = () => {
    runs++;
    recompute.call(el);
  };
  el._scheduleBoundary([NOW + 1000]);
  mock.timers.tick(1049);
  same(runs, 0, "not before the moment");
  mock.timers.tick(1);
  same(runs, 1, "50 ms after it");
  el._scheduleBoundary([Date.now() + 5000]);
  el.remove();
  mock.timers.tick(10000);
  same(runs, 1, "not while the card is away");
  w.document.body.appendChild(el);
  mock.timers.tick(50);
  same(runs, 2, "it catches up once it is back");
});

test("the head shows a running time in place of the message", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const hass = makeHass({ "binary_sensor.door": st("binary_sensor.door", "on", { friendly_name: "Door" }) }, { formatEntityState: () => "Open" });
  const el = mount(w, { type: "x", updates: false, entities: ["binary_sensor.door"] }, hass);
  const q = (s) => el.shadowRoot.querySelector(s);
  same([q(".head .eta").hidden, q(".head .msg").hidden, q(".head .msg .t").textContent], [true, false, "Open"], "an entry without a running time shows its message");
  /* Set by hand, so the test does not depend on a source. */
  el._items = [{ key: "g:washer", kind: "generic", title: "Washer", message: "Running", ts: NOW + 600000, live: true }];
  el._render(NOW);
  same(
    [q(".head .eta").hidden, q(".head .eta").textContent, q(".head .msg").hidden, q(".head").classList.contains("single")],
    [false, "in 10 min.", true, false],
    "a running entry shows its time"
  );
  same(q(".head .eta").getAttribute("aria-live"), "off", "the running time is not read out at every change");
  same(cssRules(el).find((r) => r.selectorText === ".eta").style.getPropertyValue("font-variant-numeric"), "tabular-nums", "digits keep their width");

  el._items = [{ key: "t:pasta", kind: "generic", title: "Pasta", message: "", ts: NOW + 300000, live: true, clock: true }];
  el._render(NOW);
  const row = q(".row");
  const shown = () => [q(".head .eta").textContent, q(".row .when").textContent];
  same(shown(), ["5:00", "5:00"], "a countdown in the head");
  mock.timers.tick(999);
  same(shown(), ["5:00", "5:00"], "not before the second");
  mock.timers.tick(1);
  same(shown(), ["4:59", "4:59"], "on the second");
  mock.timers.tick(1000);
  same([...shown(), q(".row") === row], ["4:58", "4:58", true], "in place");
});

test("an entry for a day reads today, tomorrow or its date", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const card = (language) => {
    const hass = makeHass({});
    hass.config = { time_zone: "Europe/Berlin" };
    hass.locale = { language, time_zone: "server" };
    return mount(w, { type: "x", hide_when_empty: false, updates: false }, hass);
  };
  const day = (n) => ({ key: "d", day: true, ts: NOW + n * 86400000 });
  const en = card("en");
  same([0, 1, 3].map((n) => en._timeText(day(n), NOW)), ["today", "tomorrow", "on 10/05"]);
  same([0, 1, 3].map((n) => card("de")._timeText(day(n), NOW)), ["heute", "morgen", "am 05.10."]);
  same(en._timeText({ clock: true, ts: NOW + 192000 }, NOW), "3:12", "a countdown counts the time left");
  /* Midnight in Berlin is still the day before in UTC. */
  en._items = [{ key: "d:bins", kind: "generic", title: "Bins", message: "", day: true, ts: Date.parse("2026-10-03T22:00:00Z") }];
  en._render(NOW);
  const when = en.shadowRoot.querySelector(".row .when");
  same([when.textContent, when.dateTime, when.title], ["on 10/04", "2026-10-04", "Oct 4, 2026"], "a date on the server without a time of day");
  let runs = 0;
  en._recompute = () => runs++;
  en._items = [day(1)];
  en._scheduleDay();
  mock.timers.tick(10 * 3600000);
  same(runs, 0, "not before midnight in Berlin");
  mock.timers.tick(1000);
  same(runs, 1, "built again after midnight");
});

test("a new time keeps the row and writes the time in place", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const subs = [];
  const el = mount(w, { type: "x", updates: false }, makeHass({}, { subs }));
  subs[0].cb({ type: "current", notifications: { n: noteAt("n", -10, { message: "Done" }) } });
  const row = el.shadowRoot.querySelector(".row");
  subs[0].cb({ type: "updated", notifications: { n: noteAt("n", -2, { message: "Done" }) } });
  const when = el.shadowRoot.querySelector(".row .when");
  same([el.shadowRoot.querySelector(".row") === row, when.textContent, when.dateTime], [true, "2 min. ago", new Date(NOW - 120000).toISOString()]);
});

test("an entry without a usable time shows without one", () => {
  const w = makeWindow();
  const el = mount(w, { type: "x", hide_when_empty: false, updates: false }, makeHass({}));
  /* Set by hand, since every source falls back to a time it can read. */
  el._items = [
    { key: "g:a", kind: "generic", title: "A", message: "", ts: NaN, live: true },
    { key: "g:b", kind: "generic", title: "B", message: "", ts: NaN, day: true },
  ];
  el._render();
  same([head(el).title, el.shadowRoot.querySelector(".head .eta").textContent], ["A", ""]);
  same([rows(el).map((r) => r.title), whens(el)], [["A", "B"], ["", ""]]);
});

test("without an IntersectionObserver the card counts as in view", () => {
  const w = makeWindow({ bare: true });
  const el = mount(w, { type: "x", updates: false, entities: ["binary_sensor.door"] }, makeHass({ "binary_sensor.door": st("binary_sensor.door", "on") }));
  el.shadowRoot.querySelector(".head").click();
  same([Boolean(el._io), Boolean(el._clock)], [false, true]);
});

/* A timer as Home Assistant writes it. A running one ends this many seconds from NOW, a paused one has
 * the time left. */
const timerAt = (state, attributes = {}) =>
  st("timer.kitchen", state, { friendly_name: "Kitchen", duration: "0:10:00", editable: true, ...attributes });
const running = (seconds) => timerAt("active", { remaining: "0:10:00", finishes_at: new Date(NOW + seconds * 1000).toISOString() });

const actionsOf = (el) => {
  const sent = [];
  el.addEventListener("hass-action", (e) => sent.push(e.detail.config));
  return sent;
};

const perform = (action, entity_id) => ({ entity: entity_id, tap_action: { action: "perform-action", perform_action: action, target: { entity_id } } });

test("a running timer counts down and offers pause and cancel", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const add = { label: "Add a minute", tap_action: { action: "perform-action", perform_action: "timer.change" } };
  const config = { type: "x", hide_when_empty: false, updates: false, entities: [{ entity: "timer.kitchen", actions: [add] }] };
  const el = mount(w, config, makeHass({ "timer.kitchen": running(300) }, { formatEntityState: () => "Active" }));
  const q = (s) => el.shadowRoot.querySelector(s);
  same(
    [head(el).title, q(".head .eta").textContent, q(".head .msg").hidden],
    ["Kitchen", "5:00", true],
    "the head counts down"
  );
  same(
    [rows(el).map((r) => [r.title, r.body, r.icon, r.actions]), q(".row").dataset.kind],
    [[["Kitchen", "Active", "mdi:timer-outline", ["Pause", "Cancel", "Add a minute"]]], "timer"],
    "its own buttons come before the configured ones"
  );
  mock.timers.tick(1000);
  same([q(".head .eta").textContent, whens(el)[0]], ["4:59", "4:59"], "by the second");
  const sent = actionsOf(el);
  const [pause, cancel] = el.shadowRoot.querySelectorAll(".row .act");
  pause.click();
  cancel.click();
  same(sent, [perform("timer.pause", "timer.kitchen"), perform("timer.cancel", "timer.kitchen")], "Home Assistant runs the buttons");
  const de = mount(makeWindow({ clock: true }), config, makeHass({ "timer.kitchen": running(300) }, { lang: "de" }));
  same(rows(de)[0].actions, ["Pause", "Abbrechen", "Add a minute"], "in German");

  q(".row .x").click();
  el.hass = makeHass({ "timer.kitchen": running(300) });
  same(rows(el).length, 0, "dismissed while it runs");
  el.hass = makeHass({ "timer.kitchen": running(600) });
  same(rows(el).length, 1, "back once it starts again");
});

test("a paused timer shows the time left and offers resume", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const paused = { ...timerAt("paused", { remaining: "0:03:12" }), last_changed: new Date(NOW - 120000).toISOString() };
  const config = { type: "x", hide_when_empty: false, updates: false, entities: ["timer.kitchen"] };
  const el = mount(w, config, makeHass({ "timer.kitchen": paused }, { formatEntityState: () => "Paused" }));
  const q = (s) => el.shadowRoot.querySelector(s);
  same(
    [q(".head .msg .t").textContent, q(".head .msg").hidden, q(".head .eta").hidden],
    ["Paused, 3:12 left", false, true],
    "the head shows the time left"
  );
  same([rows(el).map((r) => [r.body, r.actions]), whens(el)], [[["Paused, 3:12 left", ["Resume", "Cancel"]]], ["2 min. ago"]], "the row says when it paused");
  const ahead = { ...paused, last_changed: new Date(NOW + 2000).toISOString() };
  same(whens(mount(makeWindow({ clock: true }), config, makeHass({ "timer.kitchen": ahead }))), ["just now"], "a pause never lies ahead, even by Home Assistant's clock");
  const sent = actionsOf(el);
  q(".row .act").click();
  same(sent, [perform("timer.start", "timer.kitchen")], "resume starts it again");
  same(rows(mount(w, config, makeHass({ "timer.kitchen": paused }, { lang: "de" })))[0].body, "Pausiert, noch 3:12", "in German");

  const fr = {
    "ui.card.timer.actions.start": "Démarrer",
    "ui.card.timer.actions.cancel": "Annuler",
  };
  const french = makeHass({ "timer.kitchen": paused }, { lang: "fr", localize: (k) => fr[k] || "", formatEntityState: () => "En pause" });
  same(
    rows(mount(w, config, french)).map((r) => [r.body, r.actions]),
    [["En pause, 3:12", ["Démarrer", "Annuler"]]],
    "other languages take Home Assistant's words"
  );

  el.shadowRoot.querySelector(".row .x").click();
  el.hass = makeHass({ "timer.kitchen": { ...paused } });
  same(rows(el).length, 0, "dismissed while it waits");
  el.hass = makeHass({ "timer.kitchen": running(192) });
  same(rows(el).length, 1, "back once it runs again");
});

test("an idle timer shows nothing", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const idle = timerAt("idle");
  const config = (entity) => ({ type: "x", updates: false, entities: [entity] });
  const el = mount(w, config("timer.kitchen"), makeHass({ "timer.kitchen": running(300) }));
  same([el.hidden, el.shadowRoot.querySelector(".row").dataset.kind], [false, "timer"], "found on its own as a timer");
  el.hass = makeHass({ "timer.kitchen": idle });
  same(el.hidden, true, "gone once it is idle");
  el.hass = makeHass({ "timer.kitchen": running(300) });
  same(el.hidden, false, "back once it runs");
  el.hass = makeHass({ "timer.kitchen": st("timer.kitchen", "unavailable") });
  same(el.hidden, true, "gone while it is unavailable");
  same(mount(w, config({ entity: "timer.kitchen", type: "timer" }), makeHass({ "timer.kitchen": idle })).hidden, true, "with type: timer");
});

test("a timestamp sensor counts down while it lies ahead", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const at = (ms, attributes = { device_class: "timestamp" }) =>
    st("sensor.next_alarm", new Date(NOW + ms).toISOString(), { friendly_name: "Next alarm", ...attributes });
  const config = { type: "x", hide_when_empty: false, updates: false, entities: ["sensor.next_alarm"] };
  const el = mount(w, config, makeHass({ "sensor.next_alarm": at(25 * 60000) }, { formatEntityState: () => "October 2, 2026 at 12:25 PM" }));
  const q = (s) => el.shadowRoot.querySelector(s);
  same(
    [head(el).title, q(".head .eta").textContent, q(".head .msg").hidden, q(".row").dataset.kind],
    ["Next alarm", "in 25 min.", true, "countdown"],
    "the head counts down to it"
  );
  same(rows(el).map((r) => [r.body, r.icon]), [["October 2, 2026 at 12:25 PM", "mdi:timer-sand"]], "the row tells the time");
  same(q(".row .when").dateTime, new Date(NOW + 25 * 60000).toISOString());
  const uneven = mount(makeWindow({ clock: true }), config, makeHass({ "sensor.next_alarm": at(25 * 60000 + 40000) }));
  same(uneven.shadowRoot.querySelector(".row .when").dateTime, new Date(NOW + 26 * 60000).toISOString(), "to the minute");
  mock.timers.tick(20 * 60000);
  same(q(".head .eta").textContent, "in 5 min.", "on the minute");
  same(rows(mount(w, config, makeHass({ "sensor.next_alarm": at(-60000) }))).length, 0, "a time behind shows nothing");
  same(rows(mount(w, config, makeHass({ "sensor.next_alarm": st("sensor.next_alarm", "unknown", { device_class: "timestamp" }) }))).length, 0, "nor does an unknown one");
  const forced = { ...config, entities: [{ entity: "sensor.next_alarm", type: "countdown" }] };
  same(rows(mount(w, forced, makeHass({ "sensor.next_alarm": at(25 * 60000, {}) }))).length, 1, "type: countdown reads any time");
});

test("a duration sensor ends at its last change plus the time left", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const left = (state, unit, changed = NOW - 10000, attributes = { device_class: "duration" }) => ({
    ...st("sensor.dishwasher", state, { friendly_name: "Dishwasher", ...attributes, unit_of_measurement: unit }),
    last_changed: new Date(changed).toISOString(),
  });
  /* The end reads as a date and time in UTC, on a 24 hour clock. Home Assistant keeps both objects as they are. */
  const server = { time_zone: "UTC" };
  const locale = { language: "en", time_format: "24", time_zone: "server" };
  const format = (s) => s.state + " " + s.attributes.unit_of_measurement;
  const hassOf = (state) => ({ ...makeHass({ "sensor.dishwasher": state }, { formatEntityState: format }), config: server, locale });
  const config = { type: "x", hide_when_empty: false, updates: false, entities: [{ entity: "sensor.dishwasher", type: "countdown" }] };
  const end = (el) => {
    const when = el.shadowRoot.querySelector(".row .when");
    return when ? when.dateTime : null;
  };
  const el = mount(w, config, hassOf(left("25", "min")));
  same([head(el).title, el.shadowRoot.querySelector(".head .eta").textContent], ["Dishwasher", "in 25 min."], "a running countdown");
  same(end(el), new Date(NOW + 25 * 60000).toISOString(), "24 minutes and 50 seconds count as 25");
  same(rows(el)[0].body, "Oct 2, 2026, 12:25", "the row names the end, since the time left goes stale between updates");
  const row = el.shadowRoot.querySelector(".row");
  el.hass = hassOf(left("24", "min", NOW + 50000));
  same([el.shadowRoot.querySelector(".row") === row, end(el)], [true, new Date(NOW + 25 * 60000).toISOString()], "a new estimate of the same end keeps the row");
  /* Cards in one browser share their dismissals, so the others go in a window of their own. */
  const other = makeWindow({ clock: true });
  same(
    [["1.5", "h"], ["90", "min"], ["5400", "s"], ["5400000", "ms"], ["0.0625", "d"], ["5400000000", "μs"]].map(([state, unit]) =>
      end(mount(other, config, makeHass({ "sensor.dishwasher": left(state, unit, NOW) })))
    ),
    Array(6).fill(new Date(NOW + 90 * 60000).toISOString()),
    "every unit Home Assistant allows"
  );
  same([end(mount(other, config, makeHass({ "sensor.dishwasher": left("0", "min") }))), end(mount(other, config, makeHass({ "sensor.dishwasher": left("5", "") })))], [null, null], "nothing at 0 or without a unit");
  const forced = mount(other, config, makeHass({ "sensor.dishwasher": left("25", "min", NOW, {}) }));
  same([end(forced), whens(forced)], [new Date(NOW + 25 * 60000).toISOString(), ["in 25 min."]], "type: countdown reads a number with a time unit as the time left");
  const plain = mount(other, { ...config, entities: ["sensor.dishwasher"] }, hassOf(left("25", "min")));
  same(rows(plain).map((r) => [r.title, r.body]), [["Dishwasher", "25 min"]], "without it, a duration shows its value as in 0.4, since it may count up");

  el.shadowRoot.querySelector(".row .x").click();
  el.hass = hassOf(left("23", "min", NOW + 110000));
  same(rows(el).length, 0, "a new estimate of the same end keeps it dismissed");
  el.hass = hassOf(left("40", "min", NOW + 60000));
  same([rows(el).length, end(el)], [1, new Date(NOW + 41 * 60000).toISOString()], "a new end brings it back");
  const { parseDuration, endOf } = w.__origamiTest;
  const read = (v) => (Number.isNaN(v) ? "none" : v);
  same(
    ["0:05:00", "36:00:00", " 1:02:03 ", "5", "1:2:3", "", null].map((text) => read(parseDuration(text))),
    [300000, 129600000, 3723000, "none", "none", "none", "none"],
    "timer durations"
  );
  same(read(endOf(st("sensor.x", "5", { unit_of_measurement: "%" }))), "none", "a number without a time unit is no time");
});

test("keyboard focus stays in the card when a button ends its row", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const door = st("binary_sensor.door", "on", { friendly_name: "Door" });
  const config = { type: "x", updates: false, entities: ["timer.kitchen", "binary_sensor.door"] };
  const el = mount(w, config, makeHass({ "timer.kitchen": running(300), "binary_sensor.door": door }));
  el.shadowRoot.querySelector(".head").click();
  const timer = el.shadowRoot.querySelector(".row[data-kind=timer]");
  timer.querySelectorAll(".act")[1].focus();
  el.hass = makeHass({ "timer.kitchen": timerAt("idle"), "binary_sensor.door": door });
  const focused = el.shadowRoot.activeElement;
  same([timer.isConnected, focused && focused.className, focused && focused.closest(".row").querySelector(".title").textContent], [false, "x", "Door"]);
});

test("the clock writes the countdown in place and keeps the rows", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const states = { "timer.kitchen": running(65), "binary_sensor.door": st("binary_sensor.door", "on", { friendly_name: "Door" }) };
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, makeHass(states));
  el.shadowRoot.querySelector(".head").click();
  const list = [...el.shadowRoot.querySelectorAll(".list .row")];
  const timer = list.find((r) => r.dataset.kind === "timer");
  const texts = [];
  for (let i = 0; i < 3; i++) {
    texts.push(timer.querySelector(".when").textContent);
    mock.timers.tick(1000);
  }
  same(texts, ["1:05", "1:04", "1:03"], "every second");
  const after = [...el.shadowRoot.querySelectorAll(".list .row")];
  same(after.length === list.length && after.every((row, i) => row === list[i]), true, "the same rows");
  same(el.shadowRoot.querySelector(".head .eta").textContent, "1:02", "and the head");
  mock.timers.tick(62000);
  same([timer.querySelector(".when").textContent, timer.isConnected], ["0:00", true], "until it ends");
});

test("the list changes on its own when a countdown ends", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const states = {
    "sensor.next_alarm": st("sensor.next_alarm", new Date(NOW + 120000).toISOString(), { friendly_name: "Alarm", device_class: "timestamp" }),
    "sensor.dishwasher": {
      ...st("sensor.dishwasher", "5", { friendly_name: "Dishwasher", device_class: "duration", unit_of_measurement: "min" }),
      last_changed: new Date(NOW).toISOString(),
    },
    "binary_sensor.door": st("binary_sensor.door", "on", { friendly_name: "Door" }),
  };
  const entities = ["sensor.next_alarm", { entity: "sensor.dishwasher", type: "countdown" }, "binary_sensor.door"];
  const el = mount(w, { type: "x", updates: false, entities }, makeHass(states));
  same([head(el).title, rows(el).map((r) => r.title)], ["Alarm", ["Alarm", "Dishwasher", "Door"]]);
  mock.timers.tick(120049);
  same(rows(el).length, 3, "not before the end");
  mock.timers.tick(1);
  same([head(el).title, rows(el).map((r) => r.title)], ["Dishwasher", ["Dishwasher", "Door"]], "the alarm goes at its end");
  mock.timers.tick(180000);
  same([head(el).title, rows(el).map((r) => r.title)], ["Door", ["Door"]], "and the dishwasher at its end");
});

test("a dismissal from 0.4 of a running timer still holds", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const timer = { ...running(600), last_changed: new Date(NOW - 60000).toISOString() };
  w.localStorage.setItem("origami-notifications-ack", JSON.stringify({ "g:timer.kitchen": "#active\u0000" + (NOW - 60000) }));
  const el = mount(w, { type: "x", hide_when_empty: false, updates: false, entities: ["timer.kitchen"] }, makeHass({ "timer.kitchen": timer }));
  same(rows(el).length, 0, "0.4 showed it as a plain entity until it stopped");
  el.hass = makeHass({ "timer.kitchen": { ...running(900), last_changed: new Date(NOW).toISOString() } });
  same(rows(el).map((r) => r.title), ["Kitchen"], "a new run brings it back");
});

test("the editor offers timers and countdowns as kinds", () => {
  const w = makeWindow();
  const ed = w.document.createElement("origami-notifications-editor");
  ed.setConfig({ type: "x", entities: ["timer.kitchen"] });
  ed.hass = makeHass({ "timer.kitchen": timerAt("idle") });
  const form = ed.querySelector("ha-form");
  const kinds = form.schema.find((s) => s.name === "options").schema[0];
  const options = kinds.schema.find((s) => s.name === "type").selector.select.options;
  same(options.filter((o) => ["timer", "countdown"].includes(o.value)).map((o) => o.label), ["Timer", "Countdown"]);
  same(kinds.icon, "mdi:timer-outline", "a timer has its icon");
});

/* Times on a server in UTC, read on a 24 hour clock in the server's zone. Updates keep both objects. */
const UTC_CONFIG = { time_zone: "UTC" };
const UTC_LOCALE = { language: "en", time_format: "24", time_zone: "server" };
const utcHass = (states, opts) => ({ ...makeHass(states, opts), config: UTC_CONFIG, locale: UTC_LOCALE });

/* A calendar as Home Assistant writes it. While it is off, its attributes describe the next event. */
const calendarAt = (id, state, message, start, allDay = false) =>
  st(id, state, { friendly_name: id, message, all_day: allDay, start_time: start, end_time: start, location: "", description: "" });

test("a calendar shows its next event ahead of time", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const states = {
    "calendar.waste": calendarAt("calendar.waste", "off", "Paper bin", "2026-10-02 18:00:00"),
    "calendar.family": calendarAt("calendar.family", "off", "Dentist", "2026-10-02 15:00:00"),
    "calendar.holiday": calendarAt("calendar.holiday", "off", "Holiday", "2026-10-03 00:00:00", true),
    "calendar.work": calendarAt("calendar.work", "off", "Standup", "2026-10-03 09:00:00"),
    "calendar.gym": calendarAt("calendar.gym", "off", "Gym", "2026-10-02 12:30:00"),
  };
  const config = {
    type: "x",
    hide_when_empty: false,
    updates: false,
    entities: [
      { entity: "calendar.waste", before: "12:00:00" },
      { entity: "calendar.family", before: 60 },
      { entity: "calendar.holiday", before: { days: 1 } },
      { entity: "calendar.work", before: { hours: 24 } },
      "calendar.gym",
    ],
  };
  const el = mount(w, config, utcHass(states));
  const q = (s) => el.shadowRoot.querySelector(s);
  same(
    [rows(el).map((r) => [r.title, r.body, r.icon]), whens(el)],
    [
      [
        ["Paper bin", "today at 18:00", "mdi:calendar-month"],
        ["Holiday", "tomorrow", "mdi:calendar-month"],
        ["Standup", "tomorrow at 09:00", "mdi:calendar-month"],
      ],
      ["in 6 hr.", "tomorrow", "in 21 hr."],
    ],
    "as far ahead as each one says, as text, minutes or parts, and nothing without before"
  );
  same([head(el).title, q(".head .msg .t").textContent, q(".head .eta").hidden], ["Paper bin", "today at 18:00", true], "the head names the start");
  same(el.shadowRoot.querySelectorAll(".row .when")[1].dateTime, "2026-10-03", "an all-day event is a day");
  mock.timers.tick(2 * 3600000 + 49);
  same(rows(el).length, 3, "not before its time");
  mock.timers.tick(1);
  same(rows(el).map((r) => [r.title, r.body])[0], ["Dentist", "today at 15:00"], "an hour ahead of the dentist");
  mock.timers.tick(10 * 3600000 + 5000);
  same(rows(el).map((r) => [r.title, r.body]), [["Standup", "today at 09:00"]], "after midnight the reminder says today");

  const { parseBefore } = w.__origamiTest;
  const minutes = (v) => (Number.isNaN(v) ? "none" : v / 60000);
  same(
    ["12:00:00", "0:30", "+1:30:30", 90, 0, { days: 1, hours: 2 }, { minutes: "15" }].map((v) => minutes(parseBefore(v))),
    [720, 30, 90.5, 90, 0, 1560, 15],
    "text, a number of minutes, or parts"
  );
  same(
    ["soon", "", "30", "-01:00:00", -5, null, true, {}, { hours: "x" }, { weeks: 1 }, [1]].map((v) => minutes(parseBefore(v))),
    Array(11).fill("none"),
    "anything else is not set"
  );
});

test("a calendar reminder dismissed the evening before comes back when the event starts", () => {
  useClock(Date.parse("2026-10-02T20:00:00Z"));
  const w = makeWindow({ clock: true });
  const dentist = (state, changed) => ({ ...calendarAt("calendar.family", state, "Dentist", "2026-10-03 08:00:00"), last_changed: changed });
  const config = { type: "x", hide_when_empty: false, updates: false, entities: [{ entity: "calendar.family", before: "24:00:00" }] };
  const el = mount(w, config, utcHass({ "calendar.family": dentist("off", "2026-10-01T09:00:00+00:00") }));
  same(rows(el).map((r) => [r.title, r.body]), [["Dentist", "tomorrow at 08:00"]]);
  el.shadowRoot.querySelector(".row .x").click();
  el.hass = utcHass({ "calendar.family": dentist("off", "2026-10-02T23:00:00+00:00") });
  same(rows(el).length, 0, "it stays dismissed overnight, also after a restart");
  mock.timers.tick(12 * 3600000);
  el.hass = utcHass({ "calendar.family": dentist("on", "2026-10-03T08:00:00.000+00:00") });
  same(rows(el).map((r) => [r.title, r.body]), [["Dentist", "today at 08:00"]], "back at the start, even when that is its last change to the millisecond");
});

test("an event shows for a day with a picture from its device", () => {
  useClock();
  const w = makeWindow({ clock: true });
  /* Home Assistant writes the time of the last event in UTC with milliseconds. */
  const rang = (ms) => new Date(NOW + ms).toISOString().replace("Z", "+00:00");
  const bell = (at) => st("event.front_door", at, { friendly_name: "Front door", device_class: "doorbell", event_type: "ring", event_types: ["ring"] });
  const entities = {
    "event.front_door": { entity_id: "event.front_door", device_id: "door", labels: [] },
    "camera.front_door": { entity_id: "camera.front_door", device_id: "door", labels: [] },
    "image.front_door_visitor": { entity_id: "image.front_door_visitor", device_id: "door", labels: [] },
    "camera.garden": { entity_id: "camera.garden", device_id: "garden", labels: [] },
  };
  /* As Home Assistant writes them. An image's state is the time of its picture, and tokens change every few minutes. */
  const lens = (token) => st("camera.front_door", "idle", { access_token: token, entity_picture: "/api/camera_proxy/camera.front_door?token=" + token });
  const visitor = (at, token = "i") =>
    st("image.front_door_visitor", at, { access_token: token, entity_picture: "/api/image_proxy/image.front_door_visitor?token=" + token });
  const proxy = (at, token = "i") => "http://ha.local/api/image_proxy/image.front_door_visitor?token=" + token + "&state=" + encodeURIComponent(at);
  const camera = { "camera.front_door": lens("c") };
  const pictures = {
    ...camera,
    "image.front_door_visitor": visitor(rang(-7199000)),
    "camera.garden": st("camera.garden", "idle", { entity_picture: "/api/camera_proxy/camera.garden?token=g" }),
  };
  const hassOf = (at, others = pictures, reg = entities) => {
    const hass = makeHass({ "event.front_door": bell(at), ...others }, { entities: reg });
    hass.formatEntityAttributeValue = (s, attr, value) => (attr === "event_type" && value === "ring" ? "Ring" : String(value));
    return hass;
  };
  const config = { type: "x", hide_when_empty: false, updates: false, entities: ["event.front_door"] };
  const picture = (card, where = ".row .rtile") => {
    const img = card.shadowRoot.querySelector(where + " img");
    return img && img.getAttribute("src");
  };
  let hass = hassOf(rang(-2 * 3600000));
  const el = mount(w, config, hass);
  same(
    [rows(el).map((r) => [r.title, r.body, r.icon]), el.shadowRoot.querySelector(".row").dataset.kind, whens(el)],
    [[["Front door", "Ring", "mdi:eye-check"]], "event", ["2 hr. ago"]],
    "the event type in Home Assistant's words"
  );
  same(
    [picture(el), picture(el, ".head .tile")],
    Array(2).fill(proxy(rang(-7199000))),
    "the picture of an image entity on the same device, with its state like in Home Assistant's own cards"
  );
  hass = { ...hass, states: { ...hass.states, "image.front_door_visitor": visitor(rang(-60000)) } };
  el.hass = hass;
  same([picture(el), picture(el, ".head .tile")], Array(2).fill(proxy(rang(-60000))), "a new picture of the visitor shows at once");
  hass = { ...hass, states: { ...hass.states, "image.front_door_visitor": visitor(rang(-60000), "j") } };
  el.hass = hass;
  same(picture(el), proxy(rang(-60000), "j"), "and so does a new token");
  /* Cards in one browser share their dismissals, so the others go in a window of their own. */
  const other = makeWindow({ clock: true });
  const cameraHass = hassOf(rang(-2 * 3600000), camera);
  const fromCamera = mount(other, config, cameraHass);
  same(picture(fromCamera), "http://ha.local/api/camera_proxy/camera.front_door?token=c", "else of a camera there");
  fromCamera.hass = { ...cameraHass, states: { ...cameraHass.states, "camera.front_door": lens("d") } };
  same(picture(fromCamera), "http://ha.local/api/camera_proxy/camera.front_door?token=d", "which follows its token");
  const own = { ...config, entities: [{ entity: "event.front_door", image: "/local/bell.png" }] };
  same(picture(mount(other, own, hassOf(rang(-2 * 3600000)))), "http://ha.local/local/bell.png", "the image option wins");
  const bare = hassOf(rang(-2 * 3600000));
  bare.entities = undefined;
  same([rows(mount(other, config, bare)).length, picture(mount(other, config, bare))], [1, null], "without the registry there is no picture");
  same(rows(mount(other, config, hassOf(rang(-86400000 - 1000)))).length, 0, "an event older than a day shows nothing");
  same(rows(mount(other, config, hassOf("unknown"))).length, 0, "nor does one that never happened");
  const parcel = makeHass({
    "event.parcel": st("event.parcel", rang(-60000), { friendly_name: "Parcel", event_type: "delivered", parcel: { name: "Book", description: "At the door" } }),
  });
  const thing = mount(other, { ...config, entities: ["event.parcel"] }, parcel);
  same(
    [rows(thing).map((r) => [r.title, r.body]), thing.shadowRoot.querySelector(".row").dataset.kind],
    [[["Book", "At the door"]], "attribute"],
    "an event that carries a thing keeps the row it had in 0.4"
  );
  const forced = mount(other, { ...config, entities: [{ entity: "event.parcel", type: "event" }] }, parcel);
  same(rows(forced).map((r) => [r.title, r.body]), [["Parcel", "delivered"]], "unless it is set to show as an event");

  el.shadowRoot.querySelector(".row .x").click();
  el.hass = hassOf(rang(-2 * 3600000));
  same(rows(el).length, 0, "dismissed");
  el.hass = hassOf(rang(0));
  same([rows(el).length, whens(el)], [1, ["just now"]], "back with the next ring");
  mock.timers.tick(86400000 + 49);
  same(rows(el).length, 1, "for a day");
  mock.timers.tick(1);
  same(rows(el).length, 0, "then it goes by itself");
});

/* A to-do item as the subscription sends it, and the subscriptions a card made for its lists. */
const todoItem = (uid, summary, due, status = "needs_action") => ({ uid, summary, status, due, description: null, completed: null });
const todoSubs = (subs, id) => subs.filter((s) => s.msg && s.msg.type === "todo/item/subscribe" && (!id || s.msg.entity_id === id));

test("a to-do list shows what is due and marks it done", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const subs = [];
  const states = {
    "todo.shopping": st("todo.shopping", "5", { friendly_name: "Shopping", supported_features: 15 }),
    "todo.chores": st("todo.chores", "2", { friendly_name: "Chores", supported_features: 1 }),
  };
  const config = { type: "x", hide_when_empty: false, updates: false, entities: [{ entity: "todo.shopping", type: "todo" }, { entity: "todo.chores", type: "todo", before: "48:00:00" }] };
  const el = mount(w, config, utcHass(states, { subs }));
  same(
    todoSubs(subs).map((s) => s.msg),
    [{ type: "todo/item/subscribe", entity_id: "todo.shopping" }, { type: "todo/item/subscribe", entity_id: "todo.chores" }],
    "one subscription for each list"
  );
  same(rows(el).length, 0, "the number of open items makes no entry");
  const [shopping, chores] = todoSubs(subs);
  const groceries = [
    todoItem("1", "Milk", "2026-10-02"),
    todoItem("2", "Bread", "2026-10-02T15:00:00+00:00"),
    todoItem("3", "Eggs", "2026-10-01", "completed"),
    todoItem("4", "Cheese", null),
    todoItem("5", "Butter", "2026-10-03T09:00:00+00:00"),
    todoItem("6", "Tea", "2026-09-30"),
  ];
  shopping.cb({ items: groceries });
  chores.cb({ items: [todoItem("a", "Vacuum", "2026-10-04"), todoItem("b", "Taxes", "2026-10-04T15:00:00+00:00")] });
  same(
    [rows(el).map((r) => [r.title, r.body, r.icon, r.actions]), whens(el)],
    [
      [
        ["Bread", "Shopping", "mdi:clipboard-check-outline", ["Done"]],
        ["Milk", "Shopping", "mdi:clipboard-check-outline", ["Done"]],
        ["Vacuum", "Chores", "mdi:clipboard-check-outline", []],
        ["Tea", "Shopping", "mdi:clipboard-check-outline", ["Done"]],
      ],
      ["in 3 hr.", "today", "on 10/04", "on 09/30"],
    ],
    "open items due by tonight, overdue or within before, and Done only where Home Assistant can update an item"
  );
  same(el.shadowRoot.querySelector(".row").dataset.kind, "todo");

  const sent = actionsOf(el);
  el.shadowRoot.querySelector(".row .act").click();
  el.shadowRoot.querySelector(".row .rtile").click();
  same(
    sent,
    [
      {
        entity: "todo.shopping",
        tap_action: { action: "perform-action", perform_action: "todo.update_item", target: { entity_id: "todo.shopping" }, data: { item: "2", status: "completed" } },
      },
      { tap_action: { action: "navigate", navigation_path: "/todo?entity_id=todo.shopping" } },
    ],
    "Done completes the item and a tap opens the list"
  );
  shopping.cb({ items: groceries.map((it) => (it.uid === "2" ? { ...it, status: "completed" } : it)) });
  same(rows(el).map((r) => r.title), ["Milk", "Vacuum", "Tea"], "a completed item goes");

  el.shadowRoot.querySelector(".row .x").click();
  shopping.cb({ items: groceries.slice(0, 1) });
  same(rows(el).map((r) => r.title), ["Vacuum"], "dismissed");
  shopping.cb({ items: [todoItem("1", "Milk", "2026-10-02T18:00:00+00:00")] });
  same(rows(el).map((r) => r.title), ["Milk", "Vacuum"], "back once it is due at another time");
  mock.timers.tick(3 * 3600000 + 49);
  same(rows(el).map((r) => r.title), ["Milk", "Vacuum"], "not before it is due within before");
  mock.timers.tick(1);
  same(rows(el).map((r) => r.title), ["Milk", "Vacuum", "Taxes"], "then it shows by itself");

  const german = [];
  const de = mount(makeWindow({ clock: true }), config, { ...makeHass(states, { subs: german, lang: "de" }), config: UTC_CONFIG });
  todoSubs(german)[0].cb({ items: groceries });
  same(rows(de)[0].actions, ["Erledigt"], "in German");

  const hidden = [];
  const anna = { ...states, "person.anna": st("person.anna", "home", { user_id: "u1" }) };
  const audience = { "todo.shopping": { except: ["person.anna"] } };
  const away = mount(makeWindow({ clock: true }), { ...config, audience }, utcHass(anna, { subs: hidden, user: { id: "u1" } }));
  todoSubs(hidden, "todo.shopping")[0].cb({ items: groceries });
  todoSubs(hidden, "todo.chores")[0].cb({ items: [todoItem("a", "Vacuum", "2026-10-04")] });
  same(rows(away).map((r) => r.title), ["Vacuum"], "an item follows the rule for its list");
});

test("an entry for a day turns from tomorrow to today at midnight", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const subs = [];
  const states = {
    "todo.shopping": st("todo.shopping", "1", { friendly_name: "Shopping" }),
    "todo.chores": st("todo.chores", "1", { friendly_name: "Chores" }),
  };
  const berlin = makeHass(states, { subs });
  berlin.config = { time_zone: "Europe/Berlin" };
  berlin.locale = { language: "en", time_zone: "server" };
  const far = mount(w, { type: "x", updates: false, entities: [{ entity: "todo.shopping", type: "todo", before: "36:00:00" }] }, berlin);
  todoSubs(subs)[0].cb({ items: [todoItem("1", "Milk", "2026-10-04")] });
  const date = far.shadowRoot.querySelector(".row .when");
  same([date.textContent, date.dateTime, date.title], ["on 10/04", "2026-10-04", "Oct 4, 2026"], "a date on the server without a time of day");

  subs.length = 0;
  const el = mount(w, { type: "x", updates: false, entities: [{ entity: "todo.shopping", type: "todo", before: "24:00:00" }, { entity: "todo.chores", type: "todo" }] }, utcHass(states, { subs }));
  const [shopping, chores] = todoSubs(subs);
  shopping.cb({ items: [todoItem("1", "Milk", "2026-10-03")] });
  chores.cb({ items: [todoItem("2", "Bins", "2026-10-03")] });
  same([rows(el).map((r) => r.title), whens(el)], [["Milk"], ["tomorrow"]], "due tomorrow, shown a day ahead");
  /* Off screen nothing ticks, so only the rebuild after midnight changes what a day says. */
  subs.length = 0;
  const away = mount(w, { type: "x", updates: false, entities: [{ entity: "todo.shopping", type: "todo", before: "24:00:00" }] }, utcHass(states, { subs }));
  away._io.fire(false);
  todoSubs(subs)[0].cb({ items: [todoItem("1", "Milk", "2026-10-03"), todoItem("3", "Tea", "2026-10-01")] });
  same(whens(away), ["tomorrow", "yesterday"]);
  mock.timers.tick(12 * 3600000 - 1);
  same([rows(el).map((r) => r.title), whens(el)], [["Milk"], ["tomorrow"]], "not before midnight");
  mock.timers.tick(51);
  same(
    [rows(el).map((r) => r.title).sort(), whens(el)],
    [["Bins", "Milk"], ["today", "today"]],
    "after midnight it is today, and what is due today without before joins"
  );
  mock.timers.tick(949);
  same(whens(away), ["tomorrow", "yesterday"], "a card off screen waits for the rebuild");
  mock.timers.tick(1);
  same(whens(away), ["today", "on 10/01"], "which comes a second after midnight");
});

test("a to-do date is a day on the server and today is the day in the profile", () => {
  useClock();
  /* The server is 14 hours ahead of the browser, so it is October 3 there already. */
  const w = makeWindow({ clock: true, zone: "UTC" });
  const subs = [];
  const states = {
    "todo.chores": st("todo.chores", "2", { friendly_name: "Chores" }),
    "todo.shopping": st("todo.shopping", "1", { friendly_name: "Shopping" }),
  };
  const hass = makeHass(states, { subs });
  hass.config = { time_zone: "Pacific/Kiritimati" };
  hass.locale = { language: "en", time_format: "24", time_zone: "local" };
  const el = mount(w, { type: "x", updates: false, entities: [{ entity: "todo.chores", type: "todo" }, { entity: "todo.shopping", type: "todo", before: "24:00:00" }] }, hass);
  const [chores, shopping] = todoSubs(subs);
  chores.cb({ items: [todoItem("1", "Bins", "2026-10-03"), todoItem("2", "Call", "2026-10-02T23:30:00+00:00")] });
  shopping.cb({ items: [todoItem("3", "Milk", "2026-10-03")] });
  same(
    [rows(el).map((r) => r.title), whens(el)],
    [["Milk", "Call"], ["tomorrow", "in 12 hr."]],
    "a time is due today by its date in the profile, and a date is still tomorrow there"
  );
  mock.timers.tick(12 * 3600000 - 1);
  same(rows(el).map((r) => r.title), ["Call", "Milk"], "not before midnight in the profile");
  mock.timers.tick(51);
  same(
    [rows(el).map((r) => r.title), whens(el)],
    [["Call", "Bins", "Milk"], ["30 min. ago", "today", "today"]],
    "then the date is today"
  );
});

test("to-do subscriptions end with the card and follow the config", async () => {
  const w = makeWindow();
  const subs = [];
  const states = {
    "todo.shopping": st("todo.shopping", "1", { friendly_name: "Shopping" }),
    "todo.chores": st("todo.chores", "1", { friendly_name: "Chores" }),
  };
  const hass = makeHass(states, { subs });
  const open = () => todoSubs(subs).filter((s) => !s.closed).map((s) => s.msg.entity_id);
  const el = mount(w, { type: "x", updates: false, entities: [{ entity: "todo.shopping", type: "todo" }, { entity: "binary_sensor.door", type: "todo" }] }, hass);
  same(open(), ["todo.shopping"], "only to-do lists");
  el.hass = { ...hass };
  same(todoSubs(subs).length, 1, "once, however often Home Assistant updates");
  todoSubs(subs, "todo.shopping")[0].cb({ items: [todoItem("1", "Milk", "2020-01-01")] });
  el.setConfig({ type: "x", updates: false, entities: [{ entity: "todo.chores", type: "todo" }] });
  await tick();
  same(open(), ["todo.chores"], "a new config swaps the lists");
  todoSubs(subs, "todo.chores")[0].cb({ items: [todoItem("1", "Bins", "2020-01-01")] });
  el.remove();
  await tick();
  same(open(), [], "all of them end with the card");
  w.document.body.appendChild(el);
  el.hass = { ...hass, states: { ...states, "todo.chores": st("todo.chores", "2", { friendly_name: "Chores" }) } };
  same(
    [open(), todoSubs(subs, "todo.chores").length, rows(el).map((r) => r.title)],
    [["todo.chores"], 2, ["Bins"]],
    "back with the card, showing the list it had until Home Assistant sends it again"
  );

  let asked = 0;
  const refused = makeHass({ "todo.broken": st("todo.broken", "unavailable") });
  refused.connection.subscribeMessage = (cb, msg) => {
    if (msg.type === "todo/item/subscribe") asked++;
    return Promise.reject(new Error("invalid_entity_id"));
  };
  const broken = mount(w, { type: "x", updates: false, entities: [{ entity: "todo.broken", type: "todo" }] }, refused);
  await tick();
  broken.hass = { ...refused };
  same(asked, 1, "a list Home Assistant refused is not asked again at every update");
  broken.hass = { ...refused, states: { "todo.broken": st("todo.broken", "0") } };
  same(asked, 2, "but once its state changes");

  let ended = false;
  let answer = null;
  const late = makeHass(states);
  late.connection.subscribeMessage = (cb, msg) =>
    msg.type === "todo/item/subscribe" ? new Promise((resolve) => (answer = () => resolve(() => (ended = true)))) : Promise.resolve(() => {});
  const gone = mount(w, { type: "x", updates: false, entities: [{ entity: "todo.chores", type: "todo" }] }, late);
  gone.remove();
  answer();
  await tick();
  same(ended, true, "a subscription that arrives after the card left ends at once");
});

test("a day begins with its first hour, also where the clock skips midnight", () => {
  useClock(Date.parse("2026-09-06T03:30:00Z"));
  const w = makeWindow({ clock: true });
  const subs = [];
  const hass = makeHass({ "todo.chores": st("todo.chores", "1", { friendly_name: "Chores" }) }, { subs });
  hass.config = { time_zone: "America/Santiago" };
  hass.locale = { language: "en", time_zone: "server" };
  const el = mount(w, { type: "x", hide_when_empty: false, updates: false, entities: [{ entity: "todo.chores", type: "todo" }] }, hass);
  todoSubs(subs)[0].cb({ items: [todoItem("1", "Bins", "2026-09-06")] });
  same(rows(el), [], "at 11:30 PM the bins are due tomorrow, and Santiago skips from midnight to 1 AM");
  mock.timers.tick(30 * 60000 + 50);
  same([rows(el).map((r) => r.title), whens(el)], [["Bins"], ["today"]], "at 1 AM they are due today");
});

test("a to-do list without its kind shows how many items are open, as in 0.4", () => {
  const w = makeWindow();
  const subs = [];
  const hass = makeHass({ "todo.shopping": st("todo.shopping", "3", { friendly_name: "Shopping" }) }, { subs });
  const el = mount(w, { type: "x", updates: false, entities: ["todo.shopping"] }, hass);
  same([rows(el).map((r) => [r.title, r.body]), todoSubs(subs).length], [[["Shopping", "3"]], 0]);
});

/* Devices as Home Assistant writes them, and a formatter that gives their state with a capital. */
const deviceStates = (extra = {}) => ({
  "lock.front_door": st("lock.front_door", "unlocked", { friendly_name: "Front door" }),
  "cover.garage": st("cover.garage", "open", { friendly_name: "Garage", supported_features: 15 }),
  "valve.garden": st("valve.garden", "opening", { friendly_name: "Garden", supported_features: 3 }),
  "vacuum.robo": st("vacuum.robo", "cleaning", { friendly_name: "Robo", supported_features: 16 }),
  "lawn_mower.lawn": st("lawn_mower.lawn", "returning", { friendly_name: "Mower", supported_features: 7 }),
  "siren.hall": st("siren.hall", "on", { friendly_name: "Siren", supported_features: 3 }),
  ...extra,
});
const capital = (s) => s.state.charAt(0).toUpperCase() + s.state.slice(1);

test("a lock, a cover, a valve, a vacuum, a mower and a siren show while active", () => {
  const w = makeWindow();
  const hold = { label: "Hold", tap_action: { action: "perform-action", perform_action: "script.hold" } };
  const entities = ["lock.front_door", { entity: "cover.garage", actions: [hold] }, "valve.garden", "vacuum.robo", "lawn_mower.lawn", "siren.hall"];
  const config = { type: "x", hide_when_empty: false, updates: false, entities };
  const el = mount(w, config, makeHass(deviceStates(), { formatEntityState: capital }));
  same(
    rows(el).map((r) => [r.title, r.body, r.tile, r.icon, r.actions]),
    [
      ["Siren", "On", "rtile crit", "mdi:devices", ["Turn off"]],
      ["Garage", "Open", "rtile", "mdi:devices", ["Close", "Hold"]],
      ["Mower", "Returning", "rtile", "mdi:devices", ["Dock"]],
      ["Front door", "Unlocked", "rtile", "mdi:devices", ["Lock"]],
      ["Robo", "Cleaning", "rtile", "mdi:devices", ["Dock"]],
      ["Garden", "Opening", "rtile", "mdi:devices", ["Close"]],
    ],
    "the state in Home Assistant's words, a sounding siren first, and each button before the configured ones"
  );
  same(
    [head(el).title, el.shadowRoot.querySelector(".head .tile").className, [...el.shadowRoot.querySelectorAll(".row")].map((r) => r.dataset.kind)],
    ["Siren", "tile crit", Array(6).fill("device")],
    "found on their own as devices"
  );
  const sent = actionsOf(el);
  for (const row of el.shadowRoot.querySelectorAll(".row")) row.querySelector(".act").click();
  const confirmed = (action, id) => {
    const config = perform(action, id);
    config.tap_action.confirmation = true;
    return config;
  };
  same(
    sent,
    [
      perform("siren.turn_off", "siren.hall"),
      confirmed("cover.close_cover", "cover.garage"),
      perform("lawn_mower.dock", "lawn_mower.lawn"),
      perform("lock.lock", "lock.front_door"),
      perform("vacuum.return_to_base", "vacuum.robo"),
      confirmed("valve.close_valve", "valve.garden"),
    ],
    "Home Assistant runs the buttons and asks before it closes something"
  );
  same(
    rows(mount(makeWindow(), config, makeHass(deviceStates(), { lang: "de" }))).map((r) => r.actions),
    [["Ausschalten"], ["Schließen", "Hold"], ["Zur Station"], ["Abschließen"], ["Zur Station"], ["Schließen"]],
    "in German"
  );

  const shown = (id, state, attributes = {}) =>
    rows(mount(w, { type: "x", hide_when_empty: false, updates: false, entities: [id] }, makeHass({ [id]: st(id, state, attributes) })));
  const idle = [
    ["lock.a", "locked"],
    ["cover.a", "closed"],
    ["valve.a", "closed"],
    ["vacuum.a", "idle"],
    ["vacuum.a", "docked"],
    ["vacuum.a", "paused"],
    ["lawn_mower.a", "docked"],
    ["lawn_mower.a", "paused"],
    ["lawn_mower.a", "idle"],
    ["siren.a", "off"],
    ["lock.a", "unavailable"],
    ["cover.a", "unknown"],
    ["siren.a", "unknown"],
  ];
  same(idle.filter(([id, state]) => shown(id, state).length), [], "nothing while Home Assistant counts them as idle, or while their state is unknown");
  const row = (id, state, attributes) => {
    const r = shown(id, state, attributes)[0];
    return [r.tile, r.actions];
  };
  same(
    [
      row("lock.a", "jammed"),
      row("lock.a", "open"),
      row("lock.a", "locking"),
      row("lock.a", "unlocked", { code_format: "^\\d{4}$" }),
      row("lock.a", "locking", { assumed_state: true }),
      row("cover.a", "opening", { supported_features: 2 }),
      row("cover.a", "open", { supported_features: 1 }),
      row("cover.a", "closing", { supported_features: 15 }),
      row("cover.a", "closing", { supported_features: 15, assumed_state: true }),
      row("valve.a", "open", { supported_features: 1 }),
      row("valve.a", "closing", { supported_features: 1, assumed_state: true }),
      row("vacuum.a", "error", { supported_features: 16 }),
      row("vacuum.a", "returning", { supported_features: 16, assumed_state: true }),
      row("vacuum.a", "cleaning", { supported_features: 15 }),
      row("lawn_mower.a", "error", { supported_features: 4 }),
      row("lawn_mower.a", "mowing", { supported_features: 3 }),
      row("siren.a", "on", { supported_features: 1 }),
    ],
    [
      ["rtile warn", ["Lock"]],
      ["rtile", ["Lock"]],
      ["rtile", []],
      ["rtile", []],
      ["rtile", ["Lock"]],
      ["rtile", ["Close"]],
      ["rtile", []],
      ["rtile", []],
      ["rtile", ["Close"]],
      ["rtile", []],
      ["rtile", []],
      ["rtile warn", ["Dock"]],
      ["rtile", []],
      ["rtile", []],
      ["rtile warn", ["Dock"]],
      ["rtile", []],
      ["rtile crit", []],
    ],
    "a jam or an error is a warning, and a button shows only where Home Assistant would offer it, also for a state it only assumes"
  );

  const other = makeWindow();
  const forced = (entity, state) =>
    rows(mount(other, { type: "x", hide_when_empty: false, updates: false, entities: [entity] }, makeHass({ [entity.entity]: st(entity.entity, state) }))).map((r) => [r.icon, r.actions]);
  same(
    [
      forced({ entity: "media_player.tv", type: "device" }, "playing"),
      forced({ entity: "media_player.tv", type: "device" }, "standby"),
      forced({ entity: "event.bell", type: "device" }, "unknown"),
      forced({ entity: "lock.back", type: "generic" }, "unlocked"),
    ],
    [[["mdi:devices", []]], [], [], [["mdi:information-outline", []]]],
    "type: device follows the same rule for any entity but never shows an unknown state, and a lock set to show as a plain entity stays one"
  );
  const guest = { name: "Cleaner", description: "Code valid until noon" };
  const keyed = mount(other, config, makeHass({ "lock.front_door": st("lock.front_door", "unlocked", { friendly_name: "Front door", guest }) }));
  same(
    [rows(keyed).map((r) => [r.title, r.body]), keyed.shadowRoot.querySelector(".row").dataset.kind],
    [[["Cleaner", "Code valid until noon"]], "attribute"],
    "a lock that carries a thing keeps the row it had in 0.4"
  );
  const { stateActive } = w.__origamiTest;
  same(
    [
      ["event.bell", "unknown"],
      ["event.bell", "unavailable"],
      ["alert.door", "off"],
      ["alert.door", "idle"],
      ["timer.tea", "paused"],
      ["person.anna", "not_home"],
      ["group.locks", "locked"],
      ["switch.pump", "on"],
    ].map(([id, state]) => stateActive(st(id, state))),
    [true, false, true, false, false, false, true, true],
    "Home Assistant's rule for other domains"
  );

  const frontDoor = () => [...el.shadowRoot.querySelectorAll(".row")].find((r) => r.querySelector(".title").textContent === "Front door");
  frontDoor().querySelector(".x").click();
  el.hass = makeHass(deviceStates(), { formatEntityState: capital });
  same(frontDoor(), undefined, "a dismissed lock stays away while it stays open");
  const lock = (state, changed) => ({ ...st("lock.front_door", state, { friendly_name: "Front door" }), last_changed: changed });
  el.hass = makeHass(deviceStates({ "lock.front_door": lock("locked", "2026-09-21T10:30:00+00:00") }), { formatEntityState: capital });
  el.hass = makeHass(deviceStates({ "lock.front_door": lock("unlocked", "2026-09-21T11:00:00+00:00") }), { formatEntityState: capital });
  same(
    [rows(el).find((r) => r.title === "Front door"), frontDoor().querySelector(".when").dateTime],
    [{ title: "Front door", body: "Unlocked", tile: "rtile", icon: "mdi:devices", actions: ["Lock"], x: true }, "2026-09-21T11:00:00.000Z"],
    "and comes back once it is unlocked again, with the time it changed"
  );
});

test("a dismissal from 0.4 of a sounding siren still holds", () => {
  const w = makeWindow();
  const siren = (changed) => ({ ...st("siren.hall", "on", { friendly_name: "Siren", supported_features: 3 }), last_changed: changed });
  const sounding = siren("2026-09-21T10:00:00+00:00");
  const old = { "g:siren.hall": "#on\u0000" + Date.parse(sounding.last_changed) };
  w.localStorage.setItem("origami-notifications-ack", JSON.stringify(old));
  const config = { type: "x", hide_when_empty: false, updates: false, entities: ["siren.hall"] };
  const el = mount(w, config, makeHass({ "siren.hall": sounding }));
  same(rows(el).length, 0, "0.4 showed it as a plain entity, with the same signature");
  const plain = mount(w, { ...config, entities: [{ entity: "siren.hall", type: "generic" }] }, makeHass({ "siren.hall": sounding }));
  same(rows(plain).length, 0, "a card that still shows it as a plain entity keeps the dismissal too");
  el.hass = makeHass({ "siren.hall": siren("2026-09-21T11:00:00+00:00") });
  same(rows(el).map((r) => [r.title, r.tile]), [["Siren", "rtile crit"]], "until it sounds again");
});

test("the editor offers devices as a kind", () => {
  const w = makeWindow();
  const ed = w.document.createElement("origami-notifications-editor");
  ed.setConfig({ type: "x", entities: ["lock.front_door"] });
  ed.hass = makeHass(deviceStates());
  const kinds = ed.querySelector("ha-form").schema.find((s) => s.name === "options").schema[0];
  const options = kinds.schema.find((s) => s.name === "type").selector.select.options;
  same([options.find((o) => o.value === "device").label, kinds.icon], ["Device", "mdi:devices"]);
});

test("smoke is critical and a low battery is a warning", () => {
  const w = makeWindow();
  const sensor = (id, state, device_class, changed = "2026-09-21T10:00:00+00:00") => ({
    ...st(id, state, { friendly_name: id.split(".")[1], device_class }),
    last_changed: changed,
  });
  const states = {
    "binary_sensor.smoke": sensor("binary_sensor.smoke", "on", "smoke"),
    "binary_sensor.battery": sensor("binary_sensor.battery", "on", "battery"),
    "binary_sensor.door": sensor("binary_sensor.door", "on", "door", "2026-09-21T11:00:00+00:00"),
    "binary_sensor.leak": sensor("binary_sensor.leak", "off", "moisture"),
    "sensor.phone_battery": sensor("sensor.phone_battery", "5", "battery"),
  };
  const config = { type: "x", updates: false, entities: [...Object.keys(states).slice(0, 4), { entity: "sensor.phone_battery", type: "generic" }] };
  const el = mount(w, config, makeHass(states));
  same(
    [rows(el).map((r) => [r.title, r.tile, r.x]), head(el).title, el.shadowRoot.querySelector(".head .tile").className],
    [[["smoke", "rtile crit", true], ["door", "rtile", true], ["battery", "rtile warn", true], ["phone_battery", "rtile", true]], "smoke", "tile crit"],
    "smoke goes first although the door opened later, a low battery is a warning, and both can be dismissed"
  );

  const classes = ["smoke", "gas", "carbon_monoxide", "moisture", "safety", "heat", "problem", "tamper", "battery", "sound", "glass_break", "lock", "window"];
  const each = Object.fromEntries(classes.map((dc) => ["binary_sensor." + dc, sensor("binary_sensor." + dc, "on", dc)]));
  const all = mount(w, { type: "x", updates: false, entities: Object.keys(each).map((entity) => ({ entity, type: "generic" })) }, makeHass(each));
  const tiles = Object.fromEntries(rows(all).map((r) => [r.title, r.tile]));
  same(
    classes.map((dc) => tiles[dc]),
    [...Array(6).fill("rtile crit"), ...Array(4).fill("rtile warn"), "rtile", "rtile", "rtile"],
    "these classes, also with type: generic, and nothing for glass_break, lock or window"
  );
  const asDevice = mount(w, { type: "x", updates: false, entities: [{ entity: "binary_sensor.smoke", type: "device" }] }, makeHass(states));
  same(rows(asDevice).map((r) => [r.title, r.tile]), [["smoke", "rtile"]], "a binary sensor set to another kind gets no urgency from its class");
});

/* A time as Meteoalarm and NINA write it, this many minutes from NOW. */
const capTime = (minutes) => new Date(NOW + minutes * 60000).toISOString().replace(".000Z", "+00:00");

/* A warning as Meteoalarm writes it, every text of a CAP info block copied into the attributes. */
const meteoalarm = (extra = {}) =>
  st("binary_sensor.meteoalarm", "on", {
    attribution: "Information provided by MeteoAlarm",
    language: "en-GB",
    category: "Met",
    event: "Severe forest-fire warning",
    responseType: "Monitor",
    urgency: "Immediate",
    severity: "Severe",
    certainty: "Likely",
    effective: capTime(-60),
    onset: capTime(120),
    expires: capTime(180),
    senderName: "Stig Carlsson",
    headline: "Orange forest-fire for Hedmark, Oppland",
    description: "High grass and heather fire hazard.",
    instruction: "Be very careful with open fire.",
    awareness_level: "3; orange; Severe",
    awareness_type: "8; forest-fire",
    device_class: "safety",
    friendly_name: "meteoalarm",
    ...extra,
  });

test("a Meteoalarm warning follows its severity and expires", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const config = { type: "x", updates: false, entities: ["binary_sensor.meteoalarm"] };
  const el = mount(w, config, makeHass({ "binary_sensor.meteoalarm": meteoalarm() }));
  const q = (s) => el.shadowRoot.querySelector(s);
  same(
    [rows(el).map((r) => [r.title, r.body, r.tile, r.icon, r.x]), q(".row").dataset.kind, whens(el)],
    [[["Orange forest-fire for Hedmark, Oppland", "High grass and heather fire hazard.", "rtile crit", "mdi:alert-circle", true]], "warning", ["in 2 hr."]],
    "found on its own, with its headline, its text and its onset, and severe is critical"
  );
  same([head(el).title, q(".head .tile").className, q(".head .msg .t").textContent], ["Orange forest-fire for Hedmark, Oppland", "tile crit", "High grass and heather fire hazard."]);

  /* Cards in one browser share their dismissals, so the others go in a window of their own. */
  const other = makeWindow({ clock: true });
  const card = (state, entity = "binary_sensor.meteoalarm") =>
    mount(other, { type: "x", hide_when_empty: false, updates: false, entities: [entity] }, makeHass({ "binary_sensor.meteoalarm": state }));
  same(
    ["Extreme", "Severe", "Moderate", "moderate", "Minor", "Unknown"].map((severity) => rows(card(meteoalarm({ severity }))).map((r) => r.tile)),
    [["rtile crit"], ["rtile crit"], ["rtile warn"], ["rtile warn"], ["rtile"], ["rtile"]],
    "extreme and severe are critical, moderate is a warning, and the safety class adds nothing"
  );
  same(
    rows(card(meteoalarm({ severity: "Minor" }), { entity: "binary_sensor.meteoalarm", type: "generic" })).map((r) => [r.title, r.tile]),
    [["meteoalarm", "rtile crit"]],
    "set to show as a plain entity, it is a safety sensor again"
  );
  const bare = card(meteoalarm({ headline: undefined, onset: undefined }));
  same([rows(bare).map((r) => [r.title, r.tile]), whens(bare)], [[["Severe forest-fire warning", "rtile crit"]], ["1 hr. ago"]], "without a headline the event names it, and without an onset it starts when it takes effect");
  const off = st("binary_sensor.meteoalarm", "off", { attribution: "Information provided by MeteoAlarm", device_class: "safety", friendly_name: "meteoalarm" });
  same(rows(card(off)).length, 0, "nothing while it is off");
  const door = (state) => ({ "binary_sensor.door": st("binary_sensor.door", state, { friendly_name: "Door", device_class: "door" }) });
  const forced = (state) =>
    rows(mount(other, { type: "x", hide_when_empty: false, updates: false, entities: [{ entity: "binary_sensor.door", type: "warning" }] }, makeHass(door(state)))).map((r) => [r.title, r.tile]);
  same([forced("on"), forced("off")], [[["Door", "rtile"]], []], "set to show as a warning, any binary sensor shows by its name while it is on");

  q(".row .x").click();
  el.hass = makeHass({ "binary_sensor.meteoalarm": meteoalarm() });
  same(rows(el).length, 0, "dismissed in this browser");
  el.hass = makeHass({ "binary_sensor.meteoalarm": meteoalarm({ severity: "Extreme", headline: "Red forest-fire for Hedmark, Oppland" }) });
  same(rows(el).map((r) => [r.title, r.tile]), [["Red forest-fire for Hedmark, Oppland", "rtile crit"]], "back once the warning changes");
  mock.timers.tick(180 * 60000 + 49);
  same([rows(el).length, el.hidden], [1, false], "not before it expires");
  mock.timers.tick(1);
  same([rows(el).length, el.hidden], [0, true], "then it goes by itself, although Home Assistant has not changed it yet");
});

test("a dismissal from 0.4 of a warning still holds", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const ts = Date.parse(meteoalarm().last_changed);
  w.localStorage.setItem("origami-notifications-ack", JSON.stringify({ "g:binary_sensor.meteoalarm": "#on\u0000" + ts }));
  const config = { type: "x", hide_when_empty: false, updates: false, entities: ["binary_sensor.meteoalarm"] };
  const el = mount(w, config, makeHass({ "binary_sensor.meteoalarm": meteoalarm() }));
  same(rows(el).length, 0, "0.4 showed it as a plain entity, dismissed until its state changes");
  const red = () => makeHass({ "binary_sensor.meteoalarm": meteoalarm({ severity: "Extreme", headline: "Red forest-fire for Hedmark, Oppland" }) });
  el.hass = red();
  same(rows(el).map((r) => r.title), ["Red forest-fire for Hedmark, Oppland"], "now a new warning shows, although the sensor stayed on");
  el.hass = red();
  same(rows(el).length, 1, "and the old dismissal does not hide it again");
  const older = makeWindow({ clock: true });
  older.localStorage.setItem("origami-notifications-ack", JSON.stringify({ "g:binary_sensor.meteoalarm": "meteoalarm\u0000On\u0000" + ts }));
  same(rows(mount(older, config, makeHass({ "binary_sensor.meteoalarm": meteoalarm() }))).length, 0, "a dismissal from 0.3 holds as well");
});

/* A NINA warning slot as Home Assistant writes it from 2026.11, with only the id of its warning left, and what
 * get_details answers for a warning. */
const NINA = "binary_sensor.berlin_warning_1";
const ninaSlot = (id, extra = {}) => st(NINA, "on", { id, device_class: "safety", friendly_name: "Berlin Warning 1", ...extra });
const ninaAnswer = (headline, severity) => ({
  headline,
  description: "Am Freitag wird eine starke Wärmebelastung erwartet.<br/><br/>Am Samstag lässt sie nach.",
  sender: "Deutscher Wetterdienst",
  severity,
  recommended_actions: "",
  affected_areas: "Berlin",
  web: "https://www.dwd.de/warnungen",
  id: "dwd.2.49.0.0.276.0.DWD.PVW." + headline.length,
  sent: "2026-10-02T09:59:50+02:00",
  start: "2026-10-02T10:00:00+02:00",
  expires: "",
});
const NINA_REGISTRY = { [NINA]: { entity_id: NINA, platform: "nina", labels: [] } };

test("a NINA warning without attributes asks Home Assistant once", async () => {
  const w = makeWindow();
  const answers = { heat: ninaAnswer("Amtliche WARNUNG vor HITZE", "Severe"), gusts: ninaAnswer("Amtliche WARNUNG vor STURMBÖEN", "Moderate") };
  /* What Home Assistant has now. It refuses get_details without a request for the response, and answers per entity. */
  let states = { [NINA]: ninaSlot("heat") };
  const flags = [];
  const reply = (d, s, data, target, notifyOnError, returnResponse) => {
    flags.push([notifyOnError, returnResponse]);
    return returnResponse
      ? { context: { id: "c" }, response: { [target.entity_id]: answers[states[target.entity_id].attributes.id] || null } }
      : Promise.reject(new Error("service_lacks_response_request"));
  };
  const opts = { entities: NINA_REGISTRY, services: { nina: { get_details: {} } }, serviceReply: reply };
  let hass = makeHass(states, opts);
  const update = (card, slot) => {
    states = { [NINA]: ninaSlot(slot) };
    hass = { ...hass, states };
    card.hass = hass;
  };
  const config = { type: "x", hide_when_empty: false, updates: false, entities: [NINA] };
  const el = mount(w, config, hass);
  const asked = () => services(hass).filter((c) => c[0] === "nina.get_details");
  const shown = (card = el) => [...rows(card).map((r) => [r.title, r.body, r.tile]), card.shadowRoot.querySelector(".row .when").dateTime];
  same(
    [rows(el).map((r) => [r.title, r.body, r.tile, r.x]), el.shadowRoot.querySelector(".row").dataset.kind, asked(), flags],
    [[["Berlin Warning 1", "", "rtile", false]], "warning", [["nina.get_details", {}, { entity_id: NINA }]], [[false, true]]],
    "found by its platform, it shows its name while Home Assistant looks up the details, without a notice for an error"
  );
  await tick();
  const heat = ["Amtliche WARNUNG vor HITZE", "Am Freitag wird eine starke Wärmebelastung erwartet.\n\nAm Samstag lässt sie nach.", "rtile crit"];
  same([shown(), head(el).title], [[heat, "2026-10-02T08:00:00.000Z"], "Amtliche WARNUNG vor HITZE"], "then the warning, with its text as plain text and its start");
  update(el, "heat");
  const second = mount(w, config, hass);
  same([shown(second), asked().length], [[heat, "2026-10-02T08:00:00.000Z"], 1], "an update of the same warning and another card ask nothing");
  second.remove();
  const earlier = hass;
  update(el, "gusts");
  same([rows(el).map((r) => r.title), asked().length], [["Berlin Warning 1"], 2], "a slot that switches to another warning asks again");
  await tick();
  same(rows(el).map((r) => [r.title, r.tile]), [["Amtliche WARNUNG vor STURMBÖEN", "rtile warn"]]);
  second.hass = { ...earlier, states: { [NINA]: ninaSlot("heat") } };
  await tick();
  same(
    [rows(second).map((r) => r.title), rows(el).map((r) => r.title), asked().length],
    [["Amtliche WARNUNG vor HITZE"], ["Amtliche WARNUNG vor STURMBÖEN"], 2],
    "a card away from the page that still has the earlier warning keeps its answer and asks nothing"
  );

  const refused = makeWindow();
  const warnings = [];
  refused.console.warn = (...args) => warnings.push(args.join(" "));
  states = { [NINA]: ninaSlot("heat") };
  hass = makeHass(states, { ...opts, serviceReply: () => Promise.reject(new Error("home_assistant_error")) });
  const failed = mount(refused, config, hass);
  await tick();
  update(failed, "heat");
  same(
    [rows(failed).map((r) => [r.title, r.x]), asked().length, warnings],
    [[["Berlin Warning 1", true]], 1, []],
    "an error is dropped quietly and not asked again, and the name can be dismissed"
  );

  /* Home Assistant's list of actions is null until it has loaded. */
  hass = { ...makeHass(states, opts), services: null };
  const late = mount(makeWindow(), config, hass);
  same([rows(late).map((r) => [r.title, r.x]), asked().length], [[["Berlin Warning 1", false]], 0], "nothing to ask before Home Assistant has loaded its actions");
  hass = { ...hass, services: opts.services };
  late.hass = hass;
  await tick();
  same([rows(late).map((r) => r.title), asked().length], [["Amtliche WARNUNG vor HITZE"], 1], "asked once it has");
  hass = makeHass(states, { ...opts, services: { nina: {} } });
  same([rows(mount(makeWindow(), config, hass)).map((r) => [r.title, r.x]), asked().length], [[["Berlin Warning 1", false]], 0], "and while the list lacks the action");

  const before = makeWindow();
  const frost = ninaSlot("x", { ...ninaAnswer("Amtliche WARNUNG vor FROST", "Minor"), start: "", sent: "2026-10-02T06:00:00+02:00" });
  hass = makeHass({ [NINA]: frost }, opts);
  same(
    [shown(mount(before, config, hass)), asked().length],
    [[["Amtliche WARNUNG vor FROST", "Am Freitag wird eine starke Wärmebelastung erwartet.\n\nAm Samstag lässt sie nach.", "rtile"], "2026-10-02T04:00:00.000Z"], 0],
    "up to 2026.10 the attributes say it all, and a warning without a start shows when it was sent"
  );
  hass = makeHass({ [NINA]: st(NINA, "off", { device_class: "safety", friendly_name: "Berlin Warning 1" }) }, opts);
  same([rows(mount(before, config, hass)).length, asked().length], [0, 0], "an empty slot shows and asks nothing");

  /* A storm can fill many slots in several regions at once. */
  const slots = {};
  const registry = {};
  for (let i = 1; i <= 51; i++) {
    const id = "binary_sensor.berlin_warning_" + i;
    slots[id] = st(id, "on", { id: "w" + i, device_class: "safety", friendly_name: "Berlin Warning " + i });
    registry[id] = { entity_id: id, platform: "nina", labels: [] };
  }
  /* Each answer comes as a message of its own, like over the websocket. After 100 questions none comes, so a loop
   * of questions fails the test instead of hanging it. */
  let questions = 0;
  const answer = (d, s, data, target) =>
    ++questions > 100
      ? new Promise(() => {})
      : new Promise((resolve) => setTimeout(() => resolve({ response: { [target.entity_id]: ninaAnswer("Warning " + target.entity_id.split("_").pop(), "Minor") } })));
  hass = makeHass(slots, { entities: registry, services: opts.services, serviceReply: answer });
  const storm = mount(makeWindow(), { ...config, entities: Object.keys(slots) }, hass);
  await tick();
  await tick();
  same(
    [asked().length, rows(storm).filter((r) => /^Warning \d+$/.test(r.title)).length],
    [51, 51],
    "every slot is asked once, however many there are"
  );
});

test("a dismissed NINA warning stays dismissed after a reload", async () => {
  const answer = ninaAnswer("Amtliche WARNUNG vor HITZE", "Severe");
  const opts = { entities: NINA_REGISTRY, services: { nina: { get_details: {} } }, serviceReply: (d, s, data, target) => ({ response: { [target.entity_id]: answer } }) };
  const config = { type: "x", hide_when_empty: false, updates: false, entities: [NINA] };
  const KEY = "origami-notifications-ack";
  const first = makeWindow();
  const el = mount(first, config, makeHass({ [NINA]: ninaSlot("heat") }, opts));
  await tick();
  el.shadowRoot.querySelector(".row .x").click();
  const stored = first.localStorage.getItem(KEY);
  /* A new window with the same storage is the page after a reload. */
  const reload = (hass, acks = stored) => {
    const w = makeWindow();
    w.localStorage.setItem(KEY, acks);
    return [mount(w, config, hass), () => w.localStorage.getItem(KEY)];
  };
  const [again, kept] = reload(makeHass({ [NINA]: ninaSlot("heat") }, opts));
  same([rows(again).length, kept()], [0, stored], "hidden while Home Assistant looks up the details");
  await tick();
  same([rows(again).length, kept()], [0, stored], "and still once they are there");

  const early = { ...makeHass({ [NINA]: ninaSlot("heat") }, opts), services: null };
  const [late, lateKept] = reload(early);
  same([rows(late).length, lateKept()], [0, stored], "also before Home Assistant has loaded its actions");
  late.hass = { ...early, services: opts.services };
  await tick();
  same(rows(late).length, 0, "and after");

  const full = makeHass({ [NINA]: ninaSlot("heat", { ...answer, id: "heat" }) }, opts);
  const upgraded = mount(makeWindow(), config, full);
  upgraded.shadowRoot.querySelector(".row .x").click();
  upgraded.hass = { ...full, states: { [NINA]: ninaSlot("heat") } };
  await tick();
  same([rows(upgraded).length, services(full).length], [0, 1], "a dismissal from before 2026.11, when the details were attributes, holds after it");

  const [plain, plainKept] = reload(makeHass({ [NINA]: ninaSlot("heat") }, opts), JSON.stringify({ ["g:" + NINA]: "#on\u0000" + Date.parse(ninaSlot("heat").last_changed) }));
  same(rows(plain).length, 0, "a dismissal from 0.4, when it showed as a plain entity, hides it while it waits");
  await tick();
  same([rows(plain).length, JSON.parse(plainKept())], [0, { ["wn:" + NINA]: JSON.parse(stored)["wn:" + NINA] }], "and then moves to the warning");
});

test("the editor offers warnings as a kind", () => {
  const w = makeWindow();
  const ed = w.document.createElement("origami-notifications-editor");
  /* One of the sensors NINA adds to each slot. */
  const HEADLINE = "sensor.berlin_warning_1_headline";
  ed.setConfig({ type: "x", entities: ["binary_sensor.meteoalarm", NINA, HEADLINE] });
  const registry = { ...NINA_REGISTRY, [HEADLINE]: { entity_id: HEADLINE, platform: "nina", labels: [] } };
  const headline = st(HEADLINE, "Amtliche WARNUNG vor HITZE", { friendly_name: "Berlin Warning 1 Headline" });
  ed.hass = makeHass({ "binary_sensor.meteoalarm": meteoalarm(), [NINA]: ninaSlot("heat"), [HEADLINE]: headline }, { entities: registry });
  const [meteo, nina, sensor] = ed.querySelector("ha-form").schema.find((s) => s.name === "options").schema;
  const options = meteo.schema.find((s) => s.name === "type").selector.select.options;
  same(
    [options.find((o) => o.value === "warning").label, meteo.icon, nina.icon, sensor.icon],
    ["Warning", "mdi:alert-circle", "mdi:alert-circle", "mdi:information-outline"],
    "Meteoalarm by its attributes and NINA by its platform, while the sensors of NINA stay plain entities"
  );
});

test("action labels borrow Home Assistant's words in other languages", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const fr = {
    "ui.card.timer.actions.pause": "Pause",
    "ui.card.timer.actions.cancel": "Annuler",
    "ui.card.timer.actions.start": "Démarrer",
    "ui.card.lock.lock": "Verrouiller",
    "ui.card.cover.close_cover": "Fermer le volet",
    "ui.card.valve.close_valve": "Fermer la vanne",
    "ui.card.vacuum.actions.return_to_base": "Retour à la base",
    "ui.card.lawn_mower.actions.dock": "Retour à la station",
    "ui.card.common.turn_off": "Éteindre",
  };
  const states = deviceStates({
    "timer.kitchen": running(300),
    "timer.oven": st("timer.oven", "paused", { friendly_name: "Oven", duration: "0:10:00", remaining: "0:03:00" }),
  });
  const config = { type: "x", updates: false, entities: Object.keys(states) };
  const labels = (localize) => {
    const el = mount(w, config, makeHass(states, { lang: "fr", localize }));
    return Object.fromEntries(rows(el).map((r) => [r.title, r.actions]));
  };
  same(
    labels((k) => fr[k] || ""),
    {
      Siren: ["Éteindre"],
      Kitchen: ["Pause", "Annuler"],
      Garage: ["Fermer le volet"],
      Mower: ["Retour à la station"],
      "Front door": ["Verrouiller"],
      Robo: ["Retour à la base"],
      Garden: ["Fermer la vanne"],
      Oven: ["Démarrer", "Annuler"],
    },
    "each button in Home Assistant's words for its domain"
  );
  same(
    labels(() => ""),
    {
      Siren: ["Turn off"],
      Kitchen: ["Pause", "Cancel"],
      Garage: ["Close"],
      Mower: ["Dock"],
      "Front door": ["Lock"],
      Robo: ["Dock"],
      Garden: ["Close"],
      Oven: ["Resume", "Cancel"],
    },
    "English where Home Assistant has no words yet"
  );
});
