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

const resize = (el, width) => {
  const card = el.shadowRoot.querySelector("ha-card");
  for (const ro of card.__ro || []) ro.cb([{ target: card, contentRect: { width } }]);
};

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

test("vertical puts the icon above the text, like a tile with vertical content", () => {
  const w = makeWindow();
  const el = mount(w, { type: "x", hide_when_empty: false, vertical: true }, makeHass({}));
  const rules = cssRules(el);
  const rule = rules.find((r) => r.selectorText === ":host(.vertical) .head");
  same(
    [el.classList.contains("vertical"), rule && rule.style.getPropertyValue("flex-direction"), rule && rule.style.getPropertyValue("text-align"), el.getGridOptions().min_columns, el.getCardSize()],
    [true, "column", "center", 3, 2]
  );
  same(rules.filter((r) => /vertical\).*\.slide/.test(r.selectorText)).length, 0, "the lines keep their width, so a long one ends in an ellipsis");
  el.setConfig({ type: "x", hide_when_empty: false });
  same([el.classList.contains("vertical"), el.getGridOptions().min_columns, el.getCardSize()], [false, 6, 1], "and is off unless set");
  let error = null;
  try {
    w.document.createElement("origami-notifications").setConfig({ type: "x", vertical: "yes" });
  } catch (e) {
    error = e.message;
  }
  same(error, "origami-notifications: vertical must be true or false");
});

test("the editor sets the content layout like Home Assistant's tile editor", () => {
  const w = makeWindow();
  const ed = w.document.createElement("origami-notifications-editor");
  const written = [];
  ed.addEventListener("config-changed", (e) => written.push(e.detail.config));
  ed.setConfig({ type: "x" });
  ed.hass = makeHass({});
  const form = ed.querySelector("ha-form");
  const field = form.schema.find((s) => s.name === "content_layout");
  same(
    [field.selector.select.mode, field.selector.select.options.map((o) => [o.value, o.label, o.image.src]), form.data.content_layout],
    ["box", [["horizontal", "Horizontal", "/static/images/form/tile_content_layout_horizontal.svg"], ["vertical", "Vertical", "/static/images/form/tile_content_layout_vertical.svg"]], "horizontal"]
  );
  const send = (value) => form.dispatchEvent(new w.CustomEvent("value-changed", { detail: { value: { ...JSON.parse(JSON.stringify(form.data)), ...value } }, bubbles: true }));
  send({ content_layout: "vertical" });
  same([written.at(-1).vertical, "content_layout" in written.at(-1)], [true, false], "written as vertical, as the tile card has it");
  send({ content_layout: "horizontal" });
  same("vertical" in written.at(-1), false, "and dropped when it is the default again");
});

test("the editor has a field for your css", () => {
  const w = makeWindow();
  const ed = w.document.createElement("origami-notifications-editor");
  const written = [];
  ed.addEventListener("config-changed", (e) => written.push(e.detail.config));
  ed.setConfig({ type: "x", entities: ["binary_sensor.a"], css: ":host { --origami-radius: 4px; }" });
  ed.hass = makeHass({}, { lang: "de" });
  const form = ed.querySelector("ha-form");
  const panel = form.schema.find((s) => s.name === "styling");
  same(
    [panel.flatten, panel.schema, form.data.css, form.computeLabel({ name: "css" }), form.computeHelper({ name: "css" })],
    [true, [{ name: "css", selector: { text: { multiline: true } } }], ":host { --origami-radius: 4px; }", "CSS", "Kommt nach den Styles der Karte, so lässt sich jeder Teil ändern."]
  );
  const send = (value) => form.dispatchEvent(new w.CustomEvent("value-changed", { detail: { value: { ...JSON.parse(JSON.stringify(form.data)), ...value } }, bubbles: true }));
  send({ css: ".row { opacity: 0.6; }" });
  same(written.at(-1).css, ".row { opacity: 0.6; }", "it writes what you type");
  send({ css: "" });
  same("css" in written.at(-1), false, "and drops an empty one");
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
      const names = { "component.cloud.title": "Home Assistant Cloud", "component.zwave_js.title": "Z-Wave" };
      return Promise.resolve((k) => (k.includes("old_firmware") ? "Z-Wave firmware is out of date" : names[k] || ""));
    },
  });
  const el = mount(w, { type: "x" }, hass);
  await tick();
  same(rows(el).map((r) => [r.title, r.body, r.tile]), [
    ["Legacy", "Home Assistant Cloud", "rtile crit"],
    ["Z-Wave firmware is out of date", "Stops working in 2026.12", "rtile warn"],
  ], "repair rows, named by their integration where nothing else is said");
  same(asked, [["issues", ["zwave_js", "cloud"]], ["title", ["zwave_js", "cloud"]]], "issue translations and integration names are requested");
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
  const q = (sel) => el.shadowRoot.querySelector(sel);
  same([/days ago$/.test(rows(el)[0].body), q(".row .meta .when")], [true, null], "its row shows when it began in place of a message");
  same([q(".head").classList.contains("single"), q(".head .msg").hidden, q(".head .eta").hidden, /days ago$/.test(q(".head .eta").textContent)], [false, true, false, true], "the head shows when it began instead");
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

test("icons take the color Home Assistant gives the state, and urgency comes first", () => {
  const w = makeWindow();
  const subs = [];
  const states = {
    "lock.back": st("lock.back", "unlocked", { friendly_name: "Back" }),
    "binary_sensor.smoke": st("binary_sensor.smoke", "on", { friendly_name: "Smoke", device_class: "smoke" }),
    "binary_sensor.window": st("binary_sensor.window", "on", { friendly_name: "Window", device_class: "window" }),
  };
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, makeHass(states, { subs }));
  subs[0].cb({ type: "current", notifications: { n1: { notification_id: "n1", title: "Backup", message: "done", created_at: "2026-09-21T09:00:00+00:00" } } });
  el.shadowRoot.querySelector(".head").click();
  const colors = Object.fromEntries([...el.shadowRoot.querySelectorAll(".row")].map((r) => [r.querySelector(".title").textContent, r.style.getPropertyValue("--tile-color")]));
  same(colors, {
    Smoke: "var(--error-color)",
    Back: "var(--state-lock-unlocked-color, var(--state-lock-active-color, var(--state-active-color)))",
    Window: "var(--state-binary_sensor-window-on-color, var(--state-binary_sensor-on-color, var(--state-binary_sensor-active-color, var(--state-active-color))))",
    Backup: "var(--info-color)",
  });
  same(el.shadowRoot.querySelector("ha-card").style.getPropertyValue("--tile-color"), "var(--error-color)", "the closed card takes the color of what it shows");
  same(el.shadowRoot.querySelector("ha-card").classList.contains("crit"), true, "and pulses while it is critical");
  const { stateColor } = w.__origamiTest;
  same(
    [
      stateColor(st("sensor.phone_battery", "20", { device_class: "battery" })),
      stateColor(st("person.anna", "home")),
      stateColor(st("weather.home", "unavailable")),
      stateColor(st("sensor.energy", "4.2")),
      stateColor(st("group.lights", "on", { entity_id: ["light.a", "light.b"] })),
      stateColor(st("timer.pizza", "idle")),
    ],
    [
      "var(--state-sensor-battery-low-color)",
      "var(--state-icon-color)",
      "var(--state-unavailable-color)",
      "var(--state-icon-color)",
      "var(--state-light-on-color, var(--state-light-active-color, var(--state-active-color)))",
      "var(--state-timer-idle-color, var(--state-timer-inactive-color, var(--state-inactive-color)))",
    ],
    "the same chain of theme variables as on a tile"
  );
});

test("keyboard focus on a row shows all of its text, like a tap", () => {
  const w = makeWindow();
  const el = mount(w, { type: "x", hide_when_empty: false }, makeHass({}));
  const open = cssRules(el).filter((r) => /\.open\b.*\.(title|body)$/.test(r.selectorText));
  same(open.map((r) => r.selectorText.includes(":has(:focus-visible)")), [true, true]);
});

test("the open card folds the head row away completely", () => {
  const w = makeWindow();
  const el = mount(w, { type: "x", hide_when_empty: false }, makeHass({}));
  const rules = cssRules(el);
  const heads = rules.filter((r) => /(^|\s)\.head$/.test(r.selectorText));
  same(heads.map((r) => r.style.getPropertyValue("min-height")).filter(Boolean), [], "a minimum height would keep the folded row open");
  same(rules.find((r) => r.selectorText === ".texts").style.getPropertyValue("min-height"), "var(--row-height, 56px)", "the text block holds the row height");
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

  const HOME = { "weather.home": st("weather.home", "rainy", { friendly_name: "Home" }) };

  test("the weather is a field of its own and a source of its own", () => {
    const w = makeWindow();
    const { form, written } = edit(w, { label: "kitchen", entities: ["binary_sensor.door"] }, makeHass(HOME), (v) => {
      v.weather = "weather.home";
    });
    same(Object.keys(written), ["type", "entities", "label", "weather"], "written after the label");
    same(form.schema.find((s) => s.name === "weather").selector, { entity: { filter: { domain: "weather" } } });
    same(
      form.schema.find((s) => s.name === "audience").schema.map((s) => [s.name, s.title, s.icon]),
      [
        ["system", "System notifications · Everyone", "mdi:bell"],
        ["updates", "Pending updates · Everyone", "mdi:rocket-launch"],
        ["repairs", "Repairs · Everyone", "mdi:wrench"],
        ["weather.home", "Home · Everyone", "mdi:weather-partly-rainy"],
        ["binary_sensor.door", "binary_sensor.door · Everyone", "mdi:information-outline"],
      ]
    );
  });

  test("another weather entity keeps the rule, none drops it", () => {
    const w = makeWindow();
    const config = { weather: "weather.home", audience: { "weather.home": { only: ["person.anna"] } } };
    const swapped = edit(w, config, makeHass(HOME), (v) => {
      v.weather = "weather.office";
    });
    same(swapped.written, { type: "custom:origami-notifications", weather: "weather.office", audience: { "weather.office": { only: ["person.anna"] } } });
    const cleared = edit(w, config, makeHass(HOME), (v) => {
      v.weather = "";
    });
    same(cleared.written, { type: "custom:origami-notifications" });
  });

  test("calendars and to-do lists take a duration ahead, written as it was", () => {
    const w = makeWindow();
    const hass = makeHass({
      "calendar.family": st("calendar.family", "off", { friendly_name: "Family" }),
      "todo.shopping": st("todo.shopping", "2", { friendly_name: "Shopping" }),
      "sensor.power": st("sensor.power", "12", { friendly_name: "Power" }),
    });
    const config = { entities: [{ entity: "calendar.family", before: 30 }, { entity: "todo.shopping", type: "todo" }, "sensor.power"] };
    const fields = (form, id) => form.schema.find((s) => s.name === "options").schema.find((s) => s.name === id).schema.map((s) => s.name);
    const kept = edit(w, config, hass, (v) => {
      v.hide_when_empty = false;
    });
    same(kept.form.data.options["calendar.family"].before, { days: 0, hours: 0, minutes: 30, seconds: 0 }, "a bare number is minutes");
    same(["calendar.family", "todo.shopping", "sensor.power"].map((id) => fields(kept.form, id).includes("before")), [true, true, false]);
    same(kept.written.entities, config.entities, "an untouched duration stays as written");
    const changed = edit(w, config, hass, (v) => {
      v.options["calendar.family"].before = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      v.options["todo.shopping"].before = { days: 1, hours: 0, minutes: 0, seconds: 0 };
    });
    same(
      changed.written.entities,
      ["calendar.family", { entity: "todo.shopping", type: "todo", before: { days: 1, hours: 0, minutes: 0, seconds: 0 } }, "sensor.power"],
      "zero removes it"
    );
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
  const el = mount(w, { type: "x", updates: false, rotate: 0, entities: Object.keys(states) }, makeHass(states));
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
  const quiet = { key: "q", ts: NOW - 60000, past: true };
  same([nextTick([quiet], quiet, false, now), nextTick([{ ...quiet, message: "Open" }], { ...quiet, message: "Open" }, false, now)], [59800, 0], "a time in the head in place of a message changes on the minute");
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
    [[["Berlin Warning 1", "15 days ago", "rtile", false]], "warning", [["nina.get_details", {}, { entity_id: NINA }]], [[false, true]]],
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

/* Window sensors as Home Assistant writes them, and the rooms its registries give them. The kitchen window has a room
 * of its own, apart from its device's. The bath window has the room of its device, and the office window has none. */
const windowAt = (id, name, changed) => ({ ...st(id, "on", { friendly_name: name, device_class: "window" }), last_changed: changed });
const KITCHEN = windowAt("binary_sensor.kitchen_window", "Kitchen window", "2026-09-21T10:00:00+00:00");
const BATH = windowAt("binary_sensor.bath_window", "Bath window", "2026-09-21T10:30:00+00:00");
const OFFICE = windowAt("binary_sensor.office_window", "Office window", "2026-09-21T11:00:00+00:00");
const ROOMS = {
  entities: {
    "binary_sensor.kitchen_window": { entity_id: "binary_sensor.kitchen_window", area_id: "kitchen", device_id: "kitchen_contact", labels: [] },
    "binary_sensor.bath_window": { entity_id: "binary_sensor.bath_window", device_id: "bath_contact", labels: [] },
    "binary_sensor.office_window": { entity_id: "binary_sensor.office_window", labels: [] },
  },
  devices: { kitchen_contact: { id: "kitchen_contact", area_id: "hall" }, bath_contact: { id: "bath_contact", area_id: "bath" } },
  areas: { kitchen: { area_id: "kitchen", name: "Kitchen" }, bath: { area_id: "bath", name: "Bath" }, hall: { area_id: "hall", name: "Hall" } },
};
const statesOf = (...list) => Object.fromEntries(list.map((s) => [s.entity_id, s]));
const WINDOWS = { type: "x", hide_when_empty: false, updates: false, entities: [KITCHEN, BATH, OFFICE].map((s) => s.entity_id) };

test("two open windows become one entry with their rooms", () => {
  const w = makeWindow();
  const el = mount(w, WINDOWS, makeHass(statesOf(KITCHEN, BATH), ROOMS));
  const q = (s) => el.shadowRoot.querySelector(s);
  same(
    [rows(el).map((r) => [r.title, r.body, r.tile, r.icon, r.x]), q(".row").dataset.kind, q(".row .when").dateTime],
    [[["2 windows open", "Bath, Kitchen", "rtile", "mdi:google-circles-communities", true]], "group", "2026-09-21T10:30:00.000Z"],
    "one entry names the rooms newest first, an entity's own room before its device's, and takes the time of the newest"
  );
  same(
    [head(el).title, head(el).badge, q(".head .msg .t").textContent, q(".head .tile ha-icon").getAttribute("icon")],
    ["2 windows open", "1", "Bath, Kitchen", "mdi:google-circles-communities"],
    "the head shows it like any entry"
  );
  const icons = { ...WINDOWS, entities: [{ entity: KITCHEN.entity_id, icon: "mdi:window-closed" }, { entity: BATH.entity_id, icon: "mdi:window-open" }] };
  same(rows(mount(w, icons, makeHass(statesOf(KITCHEN, BATH), ROOMS)))[0].icon, "mdi:window-open", "the icon option of the newest window carries over");
  const sent = [];
  el.addEventListener("hass-action", (e) => sent.push(e.detail));
  el.addEventListener("hass-more-info", (e) => sent.push(e.detail));
  /* jsdom has no layout, so the text says it is cut off. */
  Object.defineProperty(q(".row .body"), "scrollHeight", { configurable: true, value: 100 });
  q(".row").click();
  same([sent, q(".row").classList.contains("open"), q(".row .rtile").getAttribute("role")], [[], true, null], "a tap opens nothing but its text");

  const three = mount(w, WINDOWS, makeHass(statesOf(KITCHEN, BATH, OFFICE), ROOMS));
  same(rows(three).map((r) => [r.title, r.body]), [["3 windows open", "Office window, Bath, Kitchen"]], "a window without a room goes by its name");
  const bare = { ...makeHass(statesOf(KITCHEN, BATH)), entities: undefined, devices: undefined, areas: undefined };
  same(rows(mount(w, WINDOWS, bare))[0].body, "Bath window, Kitchen window", "without the registries of Home Assistant, every window does");
  const twins = [KITCHEN, BATH].map((s) => ({ ...s, attributes: { ...s.attributes, friendly_name: "Contact sensor" } }));
  same(rows(mount(w, WINDOWS, makeHass(statesOf(...twins))))[0].body, "Contact sensor, Contact sensor", "a name shows for each window, so it matches the count");
  const letters = ["a", "b", "c", "d", "e", "f"];
  const many = letters.map((x, i) => windowAt("binary_sensor.window_" + x, "Window " + x, "2026-09-21T10:0" + i + ":00+00:00"));
  const placed = {
    entities: Object.fromEntries(letters.map((x) => ["binary_sensor.window_" + x, { area_id: x === "b" ? "a" : x, labels: [] }])),
    areas: Object.fromEntries(letters.map((x) => [x, { area_id: x, name: "Room " + x.toUpperCase() }])),
  };
  same(
    rows(mount(w, { ...WINDOWS, entities: many.map((s) => s.entity_id) }, makeHass(statesOf(...many), placed)))[0].body,
    "Room F, Room E, Room D, Room C +1",
    "a room shows once, and four at most"
  );

  same(rows(mount(w, WINDOWS, makeHass(statesOf(KITCHEN, BATH), { ...ROOMS, lang: "de" })))[0].title, "2 Fenster offen", "in German");
  const names = { "component.binary_sensor.entity_component.window.name": "Fenêtre", "component.binary_sensor.entity_component.battery_charging.name": "Charging" };
  const localize = (k) => names[k] || "";
  same(rows(mount(w, WINDOWS, makeHass(statesOf(KITCHEN, BATH), { ...ROOMS, lang: "fr", localize })))[0].title, "Fenêtre (2)", "other languages take Home Assistant's name");
  const charging = ["phone", "tablet"].map((x) => st("binary_sensor." + x + "_charging", "on", { friendly_name: x, device_class: "battery_charging" }));
  const chargers = { ...WINDOWS, entities: charging.map((s) => s.entity_id) };
  same(
    [rows(mount(w, chargers, makeHass(statesOf(...charging), { localize })))[0].title, rows(mount(w, chargers, makeHass(statesOf(...charging))))[0].title],
    ["Charging (2)", "Battery charging (2)"],
    "and so do classes without words of their own"
  );
  const { alikeTitle } = w.__origamiTest;
  same(
    [alikeTitle("en", "window", 1), alikeTitle("en-GB", "door", 3), alikeTitle("de", "garage_door", 2), alikeTitle("de", "smoke", 2), alikeTitle("fr", "window", 1, () => "Fenêtre")],
    ["1 window open", "3 doors open", "2 Garagentore offen", "2 Rauchmelder ausgelöst", "Fenêtre (1)"],
    "one or more, in the words of the card or of Home Assistant"
  );
});

test("a group follows the rooms and words Home Assistant loads later", () => {
  const w = makeWindow();
  const charging = ["phone", "tablet"].map((x) => st("binary_sensor." + x + "_charging", "on", { friendly_name: x, device_class: "battery_charging" }));
  const config = { ...WINDOWS, entities: [KITCHEN, BATH, ...charging].map((s) => s.entity_id) };
  /* Only one part changes at a time, and the states stay as they are. */
  let hass = makeHass(statesOf(KITCHEN, BATH, ...charging), { entities: ROOMS.entities });
  const el = mount(w, config, hass);
  const shown = () => rows(el).map((r) => [r.title, r.body]).sort();
  same(shown(), [["2 windows open", "Bath window, Kitchen window"], ["Battery charging (2)", "phone, tablet"]], "before the rooms and words are there");
  hass = { ...hass, areas: ROOMS.areas };
  el.hass = hass;
  same(shown()[0], ["2 windows open", "Bath window, Kitchen"], "rooms that arrive later");
  hass = { ...hass, devices: ROOMS.devices };
  el.hass = hass;
  same(shown()[0], ["2 windows open", "Bath, Kitchen"], "devices that arrive later");
  hass = { ...hass, localize: (k) => (k === "component.binary_sensor.entity_component.battery_charging.name" ? "Charging" : "") };
  el.hass = hass;
  same(shown()[1], ["Charging (2)", "phone, tablet"], "words that arrive later");
});

test("dismissing a group dismisses each window", () => {
  const w = makeWindow();
  const KEY = "origami-notifications-ack";
  const el = mount(w, WINDOWS, makeHass(statesOf(KITCHEN, BATH), ROOMS));
  el.shadowRoot.querySelector(".row .x").click();
  same(rows(el).length, 0, "gone at once");
  same(
    JSON.parse(w.localStorage.getItem(KEY)),
    { "g:binary_sensor.kitchen_window": "#on\u0000" + Date.parse(KITCHEN.last_changed), "g:binary_sensor.bath_window": "#on\u0000" + Date.parse(BATH.last_changed) },
    "each window keeps a dismissal of its own"
  );
  el.hass = makeHass(statesOf(KITCHEN, BATH, OFFICE), ROOMS);
  same(
    [rows(el).map((r) => [r.title, r.body]), el.shadowRoot.querySelector(".row").dataset.kind],
    [[["Office window", "on"]], "generic"],
    "a window that opens later shows alone and new"
  );
  const reload = makeWindow();
  reload.localStorage.setItem(KEY, w.localStorage.getItem(KEY));
  same(rows(mount(reload, WINDOWS, makeHass(statesOf(KITCHEN, BATH, OFFICE), ROOMS))).map((r) => r.title), ["Office window"], "the dismissals hold after a reload");
  el.hass = makeHass(statesOf({ ...KITCHEN, last_changed: "2026-09-21T12:00:00+00:00" }, BATH, OFFICE), ROOMS);
  same(rows(el).map((r) => [r.title, r.body]), [["2 windows open", "Kitchen, Office window"]], "a dismissed window that opens again joins the next group");

  const other = makeWindow();
  const subs = [];
  const card = mount(other, WINDOWS, makeHass(statesOf(KITCHEN, BATH), { ...ROOMS, subs }));
  subs[0].cb({ type: "current", notifications: { n1: { notification_id: "n1", message: "Backup done" } } });
  card.shadowRoot.querySelector(".clear").click();
  same(
    [rows(card).length, Object.keys(JSON.parse(other.localStorage.getItem(KEY))).sort()],
    [0, ["g:binary_sensor.bath_window", "g:binary_sensor.kitchen_window"]],
    "clear all dismisses the windows of a group as well"
  );
});

test("a group entity names its active members", () => {
  const w = makeWindow();
  const light = (id, name, state = "on") => st("light." + id, state, { friendly_name: name });
  const members = ["light.hall", "light.stairs", "light.kitchen", "light.living_room", "light.gone", "light.office", "light.porch"];
  let hass = makeHass(
    {
      "light.downstairs": st("light.downstairs", "on", { friendly_name: "Downstairs", entity_id: members }),
      "light.hall": light("hall", "Hall"),
      "light.stairs": light("stairs", "Stairs", "off"),
      "light.kitchen": light("kitchen", "Kitchen"),
      "light.living_room": light("living_room", "Living room"),
      "light.office": light("office", "Office"),
      "light.porch": light("porch", "Porch"),
    },
    { formatEntityState: capital }
  );
  const config = { type: "x", hide_when_empty: false, updates: false, entities: ["light.downstairs"] };
  const el = mount(w, config, hass);
  same(
    [rows(el).map((r) => [r.title, r.body]), el.shadowRoot.querySelector(".head .msg .t").textContent],
    [[["Downstairs", "Hall, Kitchen, Living room, Office +1"]], "Hall, Kitchen, Living room, Office +1"],
    "the members that are on, four at most, then how many more"
  );
  hass = { ...hass, states: { ...hass.states, "light.office": light("office", "Office", "off"), "light.porch": light("porch", "Porch", "unavailable") } };
  el.hass = hass;
  same(rows(el)[0].body, "Hall, Kitchen, Living room", "a member that turns off goes at once, while the group stays as it was");

  const others = makeHass(
    {
      "group.doors": st("group.doors", "on", { friendly_name: "Doors", entity_id: ["binary_sensor.front", "binary_sensor.back"] }),
      "binary_sensor.front": st("binary_sensor.front", "on", { friendly_name: "Front door" }),
      "binary_sensor.back": st("binary_sensor.back", "off", { friendly_name: "Back door" }),
      "cover.garage_doors": st("cover.garage_doors", "open", { friendly_name: "Garage doors", entity_id: ["cover.left", "cover.right"] }),
      "cover.left": st("cover.left", "open", { friendly_name: "Left door" }),
      "cover.right": st("cover.right", "closed", { friendly_name: "Right door" }),
      "sensor.mean_temperature": st("sensor.mean_temperature", "21.5", { friendly_name: "Mean temperature", entity_id: ["sensor.kitchen_temperature"] }),
      "sensor.kitchen_temperature": st("sensor.kitchen_temperature", "21.5", { friendly_name: "Kitchen temperature" }),
      "switch.pumps": st("switch.pumps", "on", { friendly_name: "Pumps", entity_id: ["switch.pump_1"] }),
      "switch.pump_1": st("switch.pump_1", "unavailable", { friendly_name: "Pump 1" }),
    },
    { formatEntityState: (s) => (s.entity_id.startsWith("sensor.") ? s.state + " °C" : capital(s)) }
  );
  const card = mount(w, { ...config, entities: ["group.doors", "cover.garage_doors", "sensor.mean_temperature", "switch.pumps"] }, others);
  same(
    rows(card).map((r) => [r.title, r.body]).sort(),
    [["Doors", "Front door"], ["Garage doors", "Left door"], ["Mean temperature", "21.5 °C"], ["Pumps", "On"]],
    "an old style group and a group of covers name theirs too, a sensor group keeps its value, and with no member on the state stays"
  );
  const recompute = card._recompute;
  let runs = 0;
  card._recompute = () => {
    runs++;
    recompute.call(card);
  };
  card.hass = { ...others, states: { ...others.states, "sensor.kitchen_temperature": st("sensor.kitchen_temperature", "22", { friendly_name: "Kitchen temperature" }) } };
  same(runs, 0, "a sensor group names no member, so a member's new value changes nothing");
});

test("only plain sensor entries become a group", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const sensor = (id, state, attributes = {}) => st(id, state, { friendly_name: id.split(".")[1], ...attributes });
  const states = {
    "binary_sensor.smoke_hall": sensor("binary_sensor.smoke_hall", "on", { device_class: "smoke" }),
    "binary_sensor.smoke_attic": sensor("binary_sensor.smoke_attic", "on", { device_class: "smoke" }),
    "binary_sensor.front_door": sensor("binary_sensor.front_door", "on", { device_class: "door" }),
    "binary_sensor.back_door": sensor("binary_sensor.back_door", "on", { device_class: "door" }),
    "binary_sensor.side_door": sensor("binary_sensor.side_door", "on", { device_class: "door", entity_picture: "/local/side.jpg" }),
    "binary_sensor.garage_left": sensor("binary_sensor.garage_left", "on", { device_class: "garage_door" }),
    "binary_sensor.garage_right": sensor("binary_sensor.garage_right", "on", { device_class: "garage_door" }),
    "binary_sensor.washer": sensor("binary_sensor.washer", "on", { device_class: "running" }),
    "binary_sensor.doorbell": sensor("binary_sensor.doorbell", "on"),
    "binary_sensor.motion": sensor("binary_sensor.motion", "on"),
    "binary_sensor.kitchen_window": sensor("binary_sensor.kitchen_window", "on", { device_class: "window" }),
    "binary_sensor.all_windows": sensor("binary_sensor.all_windows", "on", { device_class: "window", entity_id: ["binary_sensor.kitchen_window"] }),
    "binary_sensor.leak": sensor("binary_sensor.leak", "on", { device_class: "moisture" }),
    "binary_sensor.pump_problem": sensor("binary_sensor.pump_problem", "on", { device_class: "problem" }),
    "binary_sensor.filter_problem": sensor("binary_sensor.filter_problem", "on", { device_class: "problem" }),
    "sensor.phone_battery": sensor("sensor.phone_battery", "5", { device_class: "battery" }),
    "sensor.tablet_battery": sensor("sensor.tablet_battery", "7", { device_class: "battery" }),
    "lock.front": sensor("lock.front", "unlocked"),
    "lock.back": sensor("lock.back", "unlocked"),
    "binary_sensor.meteoalarm": meteoalarm(),
    "binary_sensor.meteoalarm_wind": { ...meteoalarm({ headline: "Yellow wind for Hedmark" }), entity_id: "binary_sensor.meteoalarm_wind" },
  };
  const ring = { label: "Ring", tap_action: { action: "perform-action", perform_action: "script.ring" } };
  const entities = [
    "binary_sensor.smoke_hall",
    "binary_sensor.smoke_attic",
    "binary_sensor.front_door",
    { entity: "binary_sensor.back_door", actions: [ring] },
    "binary_sensor.side_door",
    { entity: "binary_sensor.garage_left", image: "/local/garage.jpg", background: true },
    "binary_sensor.garage_right",
    "binary_sensor.washer",
    "binary_sensor.doorbell",
    "binary_sensor.motion",
    "binary_sensor.kitchen_window",
    "binary_sensor.all_windows",
    "binary_sensor.leak",
    { entity: "binary_sensor.pump_problem", tap_action: { action: "navigate", navigation_path: "/pump" } },
    "binary_sensor.filter_problem",
    { entity: "sensor.phone_battery", type: "generic" },
    { entity: "sensor.tablet_battery", type: "generic" },
    "lock.front",
    "lock.back",
    "binary_sensor.meteoalarm",
    "binary_sensor.meteoalarm_wind",
  ];
  const el = mount(w, { type: "x", updates: false, entities }, makeHass(states));
  const shown = Object.fromEntries(
    [...el.shadowRoot.querySelectorAll(".row")].map((r) => [r.querySelector(".title").textContent, [r.dataset.kind, r.querySelector(".rtile").className]])
  );
  same(Object.keys(shown).length, 20, "one row for the smoke alarms and one for every other entry");
  same(shown["2 smoke alarms"], ["group", "rtile crit"], "two smoke alarms make one group as urgent as they are");
  same(
    ["front", "back", "Orange forest-fire for Hedmark, Oppland", "Yellow wind for Hedmark", "phone_battery", "tablet_battery"].map((t) => shown[t]),
    [["device", "rtile"], ["device", "rtile"], ["warning", "rtile crit"], ["warning", "rtile crit"], ["generic", "rtile"], ["generic", "rtile"]],
    "devices, warnings and sensors stay alone"
  );
  same(
    ["doorbell", "motion", "kitchen_window", "all_windows", "leak", "washer"].map((t) => shown[t]),
    [["generic", "rtile"], ["generic", "rtile"], ["generic", "rtile"], ["generic", "rtile"], ["generic", "rtile crit"], ["generic", "rtile"]],
    "so do binary sensors without a class, a group entity and the only sensor of its class"
  );
  same(
    ["front_door", "back_door", "side_door", "garage_left", "garage_right"].map((t) => shown[t]),
    Array(5).fill(["generic", "rtile"]),
    "an entry with buttons or a picture stays alone, and so does the other one of its class"
  );
  same(["pump_problem", "filter_problem"].map((t) => shown[t]), Array(2).fill(["generic", "rtile warn"]), "so does an entry with a tap of its own");
  const picture = (title) =>
    [...el.shadowRoot.querySelectorAll(".row")].find((r) => r.querySelector(".title").textContent === title).querySelector(".rtile img").getAttribute("src");
  same([picture("garage_left"), picture("side_door")], ["http://ha.local/local/garage.jpg", "http://ha.local/local/side.jpg"], "and keeps its picture");
});

/* How HomeKit asks to pair a bridge, with its code as a picture. */
const homekitPairing = (secret) => ({
  notification_id: "homekit",
  title: "HomeKit Pairing",
  message: "To set up HASS Bridge in the Home App, scan the QR code or enter the following code:\n### 031-45-154\n![image](/api/homekit/pairingqr?homekit-" + secret + ")",
  created_at: "2026-09-21T09:00:00+00:00",
});

test("the first picture of a notification becomes its picture", () => {
  const w = makeWindow();
  const picture = (card, where = ".row .rtile") => {
    const img = card.shadowRoot.querySelector(where + " img");
    return img && img.getAttribute("src");
  };
  const card = (notification) => {
    const subs = [];
    const el = mount(w, { type: "x", updates: false }, makeHass({}, { subs }));
    subs[0].cb({ type: "current", notifications: { [notification.notification_id]: notification } });
    return [el, subs[0]];
  };
  const [el, sub] = card(homekitPairing("5e1f"));
  const qr = "http://ha.local/api/homekit/pairingqr?homekit-";
  same(
    [rows(el).map((r) => [r.title, r.body]), picture(el), picture(el, ".head .tile")],
    [[["HomeKit Pairing", "To set up HASS Bridge in the Home App, scan the QR code or enter the following code:\n031-45-154"]], qr + "5e1f", qr + "5e1f"],
    "a picture from Home Assistant itself shows in the head and the row, and stays out of the text"
  );
  const row = el.shadowRoot.querySelector(".row");
  sub.cb({ type: "updated", notifications: { homekit: homekitPairing("77aa") } });
  same([el.shadowRoot.querySelector(".row") === row, picture(el), picture(el, ".head .tile")], [true, qr + "77aa", qr + "77aa"], "a new picture shows in place");

  const note = (message, title = "Doorbell") => ({ notification_id: "n", title, message });
  const pictureOf = (message, title) => picture(card(note(message, title))[0]);
  same(
    pictureOf('Someone rang. ![visitor](https://cam.test/snap.jpg "Front door") ![logo](/local/logo.png)'),
    "https://cam.test/snap.jpg",
    "only the first picture counts, also from another host"
  );
  same(
    ["//evil.test/x.png", "javascript:alert(1)", "data:image/png;base64,iVBORw0KGgo=", "snap.jpg"].map((url) => pictureOf("![x](" + url + ") Someone rang.")),
    [null, null, null, null],
    "an address with two slashes, a script, data or a bare file name shows no picture"
  );
  same(pictureOf("![x](//evil.test/x.png) ![y](/local/y.png)"), null, "and a later picture does not take its place");
  same(pictureOf("Someone rang.", "![x](/local/x.png) Doorbell"), null, "a picture in the title does not count, since Home Assistant shows the title as plain text");

  const [linked] = card(note("[![cam](/api/cam.jpg)](/lovelace/cams) Someone rang."));
  const sent = actionsOf(linked);
  linked.shadowRoot.querySelector(".row .rtile").click();
  same(
    [picture(linked), sent],
    ["http://ha.local/api/cam.jpg", [{ tap_action: { action: "navigate", navigation_path: "/lovelace/cams" } }]],
    "a linked picture shows and still leads to its link"
  );

  const { firstPicture } = w.__origamiTest;
  same(
    ['![a]( /local/a.png "A" )', "![a]() ![b](/local/b.png)", "[a](/local/a.png)", "", null].map((md) => firstPicture(md)),
    ["/local/a.png", null, null, null, null],
    "the address may follow spaces and ends at a title, an empty first picture still counts, and a link is no picture"
  );
});

const rowOf = (el, title) => [...el.shadowRoot.querySelectorAll(".row")].find((r) => r.querySelector(".title").textContent === title);

test("entity rows use Home Assistant's state icon", async () => {
  const w = makeWindow({ stateIcon: true });
  const subs = [];
  const states = {
    "lock.front": st("lock.front", "unlocked", { friendly_name: "Front" }),
    "lock.back": st("lock.back", "unlocked", { friendly_name: "Back" }),
    "todo.shopping": st("todo.shopping", "1", { friendly_name: "Shopping" }),
  };
  const hass = makeHass({ ...states, ...statesOf(KITCHEN, BATH) }, { subs, ...ROOMS });
  const entities = ["lock.front", { entity: "lock.back", icon: "mdi:lock-alert" }, KITCHEN.entity_id, BATH.entity_id, { entity: "todo.shopping", type: "todo" }];
  const el = mount(w, { type: "x", updates: false, entities }, hass);
  subs[0].cb({ type: "current", notifications: { n1: { notification_id: "n1", title: "Backup", message: "done", created_at: "2026-09-21T09:00:00+00:00" } } });
  todoSubs(subs, "todo.shopping")[0].cb({ items: [todoItem("1", "Milk", "2020-01-01")] });
  const icon = (title) => rowOf(el, title).querySelector(".rtile ha-state-icon, .rtile ha-icon");
  same(
    [icon("Front").localName, icon("Front").stateObj.entity_id, icon("Front").hass === hass, icon("Front").icon === undefined],
    ["ha-state-icon", "lock.front", true, true],
    "an entity row shows the icon Home Assistant gives its state"
  );
  same([icon("Back").localName, icon("Back").icon], ["ha-state-icon", "mdi:lock-alert"], "the icon option still wins");
  same([icon("2 windows open").localName, icon("2 windows open").stateObj.entity_id], ["ha-state-icon", BATH.entity_id], "a group shows the icon of its newest member");
  same(
    [icon("Backup").localName, icon("Backup").getAttribute("icon"), icon("Milk").localName, icon("Milk").getAttribute("icon")],
    ["ha-icon", "mdi:bell", "ha-icon", "mdi:clipboard-check-outline"],
    "a notification and a to-do keep the icon of their kind"
  );
  const head = el.shadowRoot.querySelector(".head .tile");
  same([...head.children].map((c) => c.localName + "." + c.className), ["div.glyph", "div.badge"], "the head keeps its badge beside the icon");
  same(head.querySelector(".glyph").children.length, 1, "with one icon");
  const row = rowOf(el, "Front");
  const next = { ...states["lock.front"], last_updated: "2026-09-21T10:05:00+00:00" };
  el.hass = { ...hass, states: { ...hass.states, "lock.front": next } };
  same([rowOf(el, "Front") === row, icon("Front").stateObj === next], [true, true], "a new state reaches the icon without building the row again");

  const later = makeWindow();
  const own = {
    "lock.front": st("lock.front", "unlocked", { friendly_name: "Front", icon: "mdi:door" }),
    "lock.side": st("lock.side", "unlocked", { friendly_name: "Side", icon: "mdi:door" }),
    "lock.back": st("lock.back", "unlocked", { friendly_name: "Back" }),
  };
  const registry = { "lock.side": { entity_id: "lock.side", icon: "mdi:gate", labels: [] } };
  const plain = mount(later, { type: "x", updates: false, entities: Object.keys(own) }, makeHass(own, { entities: registry }));
  same(
    rows(plain).map((r) => [r.title, r.icon]),
    [["Back", "mdi:devices"], ["Front", "mdi:door"], ["Side", "mdi:gate"]],
    "until Home Assistant defines its state icon, an entry shows the icon the user picked, the one its entity names, or its kind's"
  );
  later.customElements.define("ha-state-icon", class extends later.HTMLElement {});
  await Promise.resolve();
  await Promise.resolve();
  same(
    [...plain.shadowRoot.querySelectorAll(".row .rtile")].map((t) => t.querySelector("ha-state-icon, ha-icon").localName),
    ["ha-state-icon", "ha-state-icon", "ha-state-icon"],
    "once it is defined, every icon is drawn again"
  );
});


/* A weather entity as Home Assistant writes it, with an hourly forecast unless told otherwise. */
const weatherAt = (state = "cloudy", attributes = {}) =>
  st("weather.home", state, { friendly_name: "Home", temperature: 12, temperature_unit: "°C", precipitation_unit: "mm", supported_features: 2, ...attributes });
/* An hourly forecast from the top of the mocked hour on, one entry per argument. */
const hourly = (...hours) => hours.map((h, i) => ({ datetime: new Date(NOW + i * 3600000).toISOString(), condition: "cloudy", temperature: 10, ...h }));
const windowOn = (id, state = "on") => ({ [id]: st(id, state, { device_class: "window", friendly_name: id.split(".")[1] }) });
/* A card with the weather and nothing else, and the forecast subscription it opened. */
const weatherCard = (w, states, extra = {}, opts = {}) => {
  const subs = [];
  const hass = makeHass(states, { subs, ...opts });
  hass.formatEntityAttributeValue = (s, attribute, value) => (value === undefined ? s.attributes[attribute] : value) + " " + s.attributes.temperature_unit;
  const el = mount(w, { type: "x", hide_when_empty: false, updates: false, weather: "weather.home", ...extra }, hass);
  return [el, subs.find((s) => s.msg && s.msg.type === "weather/subscribe_forecast"), hass];
};
const shownRows = (el) => rows(el).map((r) => [r.title, r.body, r.tile, r.icon]);

test("an hour reads 1 Uhr in German, as people write it", () => {
  useClock(Date.parse("2026-10-02T22:30:00Z"));
  const w = makeWindow({ clock: true, zone: "UTC" });
  const [el, sub] = weatherCard(w, { "weather.home": weatherAt() }, {}, { lang: "de" });
  sub.cb({ type: "hourly", forecast: [{ datetime: "2026-10-03T01:00:00Z", condition: "rainy", temperature: 9 }] });
  same(rows(el).map((r) => r.title), ["Regen ab 1 Uhr"]);
});

test("rain ahead shows the hour it starts", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const [el, sub] = weatherCard(w, { "weather.home": weatherAt() });
  same(sub.msg, { type: "weather/subscribe_forecast", entity_id: "weather.home", forecast_type: "hourly" }, "the card asks Home Assistant for the hourly forecast");
  sub.cb({ type: "hourly", forecast: hourly({}, {}, {}, { condition: "rainy", precipitation_probability: 70 }) });
  same(shownRows(el), [["Rain from 3 PM", "70% chance", "rtile", "mdi:weather-rainy"]], "the first wet hour within six hours, with its chance");
  const row = el.shadowRoot.querySelector(".row");
  same(
    [row.dataset.kind, row.querySelector(".when").dateTime, head(el).title],
    ["weather", new Date(NOW + 3 * 3600000).toISOString(), "Rain from 3 PM"],
    "a weather entry that points to that hour"
  );
  const opened = [];
  el.addEventListener("hass-more-info", (e) => opened.push(e.detail.entityId));
  row.querySelector(".rtile").click();
  same(opened, ["weather.home"], "a tap opens the weather entity");
  const of = (...hours) => {
    sub.cb({ type: "hourly", forecast: hourly(...hours) });
    return rows(el).map((r) => [r.title, r.body]);
  };
  same(
    [
      of({}, { condition: "snowy" }),
      of({}, { condition: "lightning-rainy" }),
      of({}, { condition: "hail" }),
      of({}, { condition: "rainy", temperature: 1 }),
      of({}, { precipitation: 0.2 }),
      of({}, { precipitation_probability: 60 }),
    ],
    [[["Snow from 1 PM", "in 1 hr."]], [["Thunderstorms from 1 PM", "in 1 hr."]], [["Hail from 1 PM", "in 1 hr."]], [["Snow from 1 PM", "in 1 hr."]], [["Rain from 1 PM", "in 1 hr."]], [["Rain from 1 PM", "60% chance"]]],
    "snow, thunder and hail by name, snow at 1 °C, and 0.2 mm or a chance of 60 % make an hour wet"
  );
  same(
    [of({}, {}, {}, {}, {}, {}, { condition: "pouring" }), of({ precipitation: 0.1, precipitation_probability: 59 }), of({ condition: "pouring", datetime: new Date(NOW - 3600000).toISOString() })],
    [[], [], []],
    "nothing beyond six hours, nothing below the marks, and nothing from an hour that has ended"
  );
  const de = makeWindow({ clock: true, zone: "UTC" });
  const [german, gsub] = weatherCard(de, { "weather.home": weatherAt() }, {}, { lang: "de" });
  gsub.cb({ type: "hourly", forecast: hourly({}, {}, {}, {}, {}, { condition: "rainy", precipitation_probability: 80 }) });
  const percent = new Intl.NumberFormat("de", { style: "percent" }).format(0.8);
  same(rows(german).map((r) => [r.title, r.body]), [["Regen ab 17 Uhr", percent + " Wahrscheinlichkeit"]], "in German, with the hour and the percent as German writes them");
  const { isWet, wetKind } = w.__origamiTest;
  same(
    [isWet({ precipitation: 0.01 }, "in"), isWet({ precipitation: 0.009 }, "in"), isWet({ condition: "snowy-rainy" }, "mm"), wetKind("rainy", 34, 34), wetKind("rainy", 35, 34), wetKind("lightning", 0, 1)],
    [true, false, true, "snow", "rain", "thunder"],
    "inches have their own mark, and so has Fahrenheit"
  );
});

test("rain ahead with an open window is a warning", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const all = { "binary_sensor.all_windows": st("binary_sensor.all_windows", "on", { device_class: "window", entity_id: ["binary_sensor.kitchen_window"] }) };
  const states = { "weather.home": weatherAt(), ...windowOn("binary_sensor.kitchen_window"), ...windowOn("cover.roof_window", "open"), ...all };
  const [el, sub] = weatherCard(w, states);
  sub.cb({ type: "hourly", forecast: hourly({}, { condition: "rainy", precipitation_probability: 90 }) });
  same(shownRows(el), [["Rain from 1 PM", "2 windows open", "rtile warn", "mdi:weather-rainy"]], "a warning that counts the open windows instead of the chance, without a group of them");
  const closed = { ...states, ...windowOn("cover.roof_window", "closed"), ...windowOn("binary_sensor.hall_window", "unavailable"), ...windowOn("cover.attic_window", "unavailable") };
  el.hass = { ...el._hass, states: closed };
  same(shownRows(el), [["Rain from 1 PM", "1 window open", "rtile warn", "mdi:weather-rainy"]], "a closed or unavailable window does not count");
});

test("rain now shows only while a window is open", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const rainy = { ...weatherAt("rainy"), last_changed: new Date(NOW - 600000).toISOString() };
  const [el, sub, hass] = weatherCard(w, { "weather.home": rainy, ...windowOn("binary_sensor.kitchen_window", "off") });
  sub.cb({ type: "hourly", forecast: hourly({ condition: "rainy" }, { condition: "rainy" }) });
  same(rows(el), [], "while it rains, an entry for rain ahead would say nothing new");
  el.hass = { ...hass, states: { "weather.home": rainy, ...windowOn("binary_sensor.kitchen_window") } };
  same(shownRows(el), [["It is raining", "1 window open", "rtile warn", "mdi:weather-rainy"]], "with a window open it is a warning");
  same(el.shadowRoot.querySelector(".row .when").dateTime, new Date(NOW - 600000).toISOString(), "since it began to rain");
  const now = (state, temperature = 12) => {
    el.hass = { ...hass, states: { "weather.home": { ...rainy, state, attributes: { ...rainy.attributes, temperature } }, ...windowOn("binary_sensor.kitchen_window") } };
    return rows(el).map((r) => r.title);
  };
  same([now("snowy"), now("lightning"), now("hail"), now("rainy", 0)], [["It is snowing"], ["Thunderstorm"], ["Hail"], ["It is snowing"]], "snow, thunder, hail, and snow at 1 °C or colder");
});

test("frost ahead shows the hour and the low", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const [el, sub, hass] = weatherCard(w, { "weather.home": weatherAt("clear-night", { temperature: 3 }) });
  sub.cb({ type: "hourly", forecast: hourly({ temperature: 3 }, { temperature: 1 }, { temperature: -1 }, { temperature: -3 }, { temperature: -2 }) });
  same(shownRows(el), [["Frost from 2 PM", "Low of -3 °C", "rtile", "mdi:snowflake-thermometer"]], "the first hour below 0 °C and the lowest within 18 hours");
  el.hass = { ...hass, states: { "weather.home": weatherAt("clear-night", { temperature: 0 }) } };
  same(rows(el), [], "nothing while it freezes already");
  el.hass = { ...hass, states: { "weather.home": weatherAt("clear-night", { temperature: 3 }) } };
  sub.cb({ type: "hourly", forecast: hourly(...Array.from({ length: 18 }, () => ({ temperature: 2 })), { temperature: -5 }) });
  same(rows(el), [], "nor for frost more than 18 hours ahead");
  const us = makeWindow({ clock: true, zone: "UTC" });
  const [f, fsub] = weatherCard(us, { "weather.home": weatherAt("clear-night", { temperature: 33, temperature_unit: "°F" }) });
  fsub.cb({ type: "hourly", forecast: hourly({ temperature: 33 }, { temperature: 31 }) });
  same(rows(f).map((r) => [r.title, r.body]), [["Frost from 1 PM", "Low of 31 °F"]], "in Fahrenheit below 32");
});

test("a daily forecast alone gives no weather entries", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const [el, sub] = weatherCard(w, { "weather.home": weatherAt("cloudy", { supported_features: 1, temperature: 3 }) });
  same(sub.msg.forecast_type, "daily");
  sub.cb({ type: "daily", forecast: hourly({ condition: "rainy", temperature: -4 }, { condition: "pouring", temperature: -6 }) });
  same(rows(el), [], "without hours, neither rain nor frost");
  const twice = makeWindow({ clock: true, zone: "UTC" });
  const [el2, sub2] = weatherCard(twice, { "weather.home": weatherAt("cloudy", { supported_features: 5 }) });
  sub2.cb({ type: "twice_daily", forecast: [{ datetime: new Date(NOW + 2 * 3600000).toISOString(), is_daytime: true, condition: "rainy", temperature: 9 }] });
  same([sub2.msg.forecast_type, rows(el2).map((r) => r.title)], ["twice_daily", ["Rain from 2 PM"]], "twice a day is enough");
  const { forecastType } = w.__origamiTest;
  same([2, 4, 1, 7, 6, 0, undefined].map((f) => forecastType({ attributes: { supported_features: f } })), ["hourly", "twice_daily", "daily", "hourly", "hourly", null, null], "hourly first, then twice a day, then daily");
});

test("cards share one forecast and ignore a repeat", async () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const states = { "weather.home": weatherAt() };
  const [first, sub] = weatherCard(w, states);
  const [second, own] = weatherCard(w, states);
  const counted = (el) => {
    const recompute = el._recompute.bind(el);
    el._count = 0;
    el._recompute = () => {
      el._count++;
      recompute();
    };
  };
  counted(first);
  counted(second);
  const forecast = hourly({ condition: "rainy" });
  sub.cb({ type: "hourly", forecast });
  same([rows(first).length, rows(second).length, first._count, second._count], [1, 1, 1, 1], "news on one subscription reaches every card on the same forecast");
  own.cb({ type: "hourly", forecast: forecast.map((f) => ({ ...f })) });
  sub.cb({ type: "hourly", forecast });
  same([first._count, second._count], [1, 1], "the same forecast again changes nothing");
  const [third] = weatherCard(w, states);
  same(rows(third).map((r) => r.title), ["Rain from 12 PM"], "a card that comes later shows it before its own subscription answers");
  sub.cb({ type: "hourly", forecast: null });
  same([rows(first).length, rows(third).length], [0, 0], "no forecast means no entries");
});

test("the forecast subscription ends when the card goes", async () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const subs = [];
  const states = { "weather.home": weatherAt(), "weather.cabin": { ...weatherAt(), entity_id: "weather.cabin" } };
  const el = mount(w, { type: "x", hide_when_empty: false, updates: false, weather: "weather.home" }, makeHass(states, { subs }));
  const forecasts = () => subs.filter((s) => s.msg && s.msg.type === "weather/subscribe_forecast");
  await Promise.resolve();
  el.setConfig({ type: "x", hide_when_empty: false, updates: false, weather: "weather.cabin" });
  await Promise.resolve();
  same(forecasts().map((s) => [s.msg.entity_id, s.closed]), [["weather.home", true], ["weather.cabin", false]], "a new weather option ends the old subscription and opens one for the new entity");
  el.remove();
  await Promise.resolve();
  same(forecasts().map((s) => s.closed), [true, true], "a card that leaves ends it");
  const ended = [];
  const subscribe = el._hass.connection.subscribeMessage;
  el._hass.connection.subscribeMessage = (cb, msg) => subscribe(cb, msg).then((unsub) => () => ended.push(msg.type) && unsub());
  w.document.body.append(el);
  el.remove();
  await Promise.resolve();
  await Promise.resolve();
  same(forecasts().map((s) => s.closed), [true, true, true], "also one that arrives after the card has gone");
  same(ended.filter((type) => type === "weather/subscribe_forecast").length, 1, "which ends once");

  const refused = makeWindow({ clock: true, zone: "UTC" });
  const restored = weatherAt("unavailable", { restored: true });
  const hass = makeHass({ "weather.home": restored });
  let asked = 0;
  hass.connection.subscribeMessage = (cb, msg) => {
    if (msg.type !== "weather/subscribe_forecast") return Promise.resolve(() => {});
    asked++;
    return Promise.reject({ code: "invalid_entity_id" });
  };
  const quiet = mount(refused, { type: "x", hide_when_empty: false, updates: false, weather: "weather.home" }, hass);
  await Promise.resolve();
  quiet.hass = { ...hass };
  same([asked, rows(quiet).length], [1, 0], "a refusal ends it quietly");
  quiet.hass = { ...hass, states: { "weather.home": weatherAt("sunny") } };
  same(asked, 2, "and the card asks again once the weather has loaded");
});

test("opening a window updates the rain entry at once", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const states = { "weather.home": weatherAt(), ...windowOn("binary_sensor.kitchen_window", "off") };
  const [el, sub, hass] = weatherCard(w, states);
  sub.cb({ type: "hourly", forecast: hourly({}, { condition: "rainy", precipitation_probability: 90 }) });
  el.shadowRoot.querySelector(".row .x").click();
  same(rows(el), [], "a hint dismissed");
  el.hass = { ...hass, states: { ...states, ...windowOn("binary_sensor.kitchen_window") } };
  same(shownRows(el), [["Rain from 1 PM", "1 window open", "rtile warn", "mdi:weather-rainy"]], "comes back as a warning once a window opens, since that is new");
  el.hass = { ...hass, states };
  same(rows(el).map((r) => r.body), ["90% chance"], "once the window is closed, the hint is back, since the warning took the place of the dismissed one");
  sub.cb({ type: "hourly", forecast: hourly({}, {}, {}, {}, {}, {}, {}, { condition: "rainy" }) });
  same(rows(el), [], "rain seven hours ahead is not yet shown");
  mock.timers.tick(3600050);
  same(rows(el).map((r) => r.title), ["Rain from 7 PM"], "the next full hour moves the six hours on");
});

test("a broken weather or lead gets a clear error", () => {
  const w = makeWindow();
  const error = (config) => {
    try {
      w.document.createElement("origami-notifications").setConfig({ type: "x", ...config });
      return null;
    } catch (e) {
      return e.message;
    }
  };
  same(error({ weather: "sensor.rain" }), "origami-notifications: weather must be a weather entity, e.g. weather.home");
  same(error({ entities: [{ entity: "calendar.family", before: "soon" }] }), "origami-notifications: before must be minutes or a duration like 1:30:00");
  same(error({ entities: [{ entity: "calendar.family", before: { weeks: 1 } }] }) !== null, true, "Home Assistant has no weeks in a duration");
  same(
    [30, "1:30:00", "0:45", { hours: 2 }, { days: 1, minutes: "15" }].map((before) => error({ weather: "weather.home", entities: [{ entity: "calendar.family", before }] })),
    [null, null, null, null, null]
  );
});

test("a dismissed weather entry stays away while the weather lasts", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const [el, sub] = weatherCard(w, { "weather.home": weatherAt("cloudy", { temperature: 3 }) });
  const wet = { condition: "rainy", temperature: 2 };
  sub.cb({ type: "hourly", forecast: hourly({ temperature: 3 }, wet, wet, wet, { temperature: -1 }) });
  same(rows(el).map((r) => r.title), ["Rain from 1 PM", "Frost from 4 PM"]);
  for (const x of el.shadowRoot.querySelectorAll(".row .x")) x.click();
  mock.timers.tick(2 * 3600000 + 50);
  same(rows(el), [], "two hours later the rain and the frost still lie ahead, so they stay dismissed");
  sub.cb({ type: "hourly", forecast: hourly({}, {}, {}, {}) });
  sub.cb({ type: "hourly", forecast: hourly({}, {}, {}, wet, { temperature: -1 }) });
  same(rows(el).map((r) => r.title), ["Rain from 3 PM", "Frost from 4 PM"], "once they were gone from the forecast, they are new");
});

test("a forecast hour that has begun counts from now", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const [el, sub] = weatherCard(w, { "weather.home": weatherAt("cloudy", { supported_features: 4, temperature: 3 }) });
  const half = (hours, condition, temperature) => ({ datetime: new Date(NOW + hours * 3600000).toISOString(), condition, temperature });
  sub.cb({ type: "twice_daily", forecast: [half(-6, "rainy", 5), half(6, "clear-night", -2)] });
  same(rows(el).map((r) => r.title), ["Rain from 12 PM", "Frost from 6 PM"], "a half day of rain since 6 AM says from now");
  same(el.shadowRoot.querySelector(".row .when").dateTime, new Date(NOW).toISOString());
  sub.cb({ type: "twice_daily", forecast: [half(-6, "cloudy", -2)] });
  same(rows(el).map((r) => r.title), ["Frost from 12 PM"], "and so does a half day of frost");
});

const threeOn = () => ({
  "binary_sensor.a": changedAt("binary_sensor.a", "Door", -60000),
  "binary_sensor.b": changedAt("binary_sensor.b", "Garage", -120000),
  "binary_sensor.c": changedAt("binary_sensor.c", "Gate", -180000),
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
  same([seen, head(el).badge], [["Door", "Garage", "Gate", "Door"], "3"], "every 8 seconds the next, newest first, with the count beside the icon");
  const smoke = { ...st("binary_sensor.smoke", "on", { friendly_name: "Smoke", device_class: "smoke" }), last_changed: new Date(Date.now()).toISOString() };
  el.setConfig({ type: "x", updates: false, entities: [...Object.keys(states), "binary_sensor.smoke"] });
  el.hass = { ...hass, states: { ...states, "binary_sensor.smoke": smoke } };
  same([head(el).title, el.shadowRoot.querySelector(".say").textContent], ["Smoke", "Smoke. on"], "something critical comes forward at once and is read out");
  mock.timers.tick(60000);
  same([head(el).title, head(el).badge], ["Smoke", "4"], "and holds the card alone");

  const still = mount(w, { type: "x", updates: false, rotate: 0, entities: Object.keys(states) }, makeHass(states));
  mock.timers.tick(60000);
  same(head(still).title, "Door", "with rotate 0 the card holds still on the first");
  const single = mount(w, { type: "x", updates: false, entities: ["binary_sensor.a"] }, makeHass(states));
  same([head(single).title, single.shadowRoot.querySelector(".badge").hidden], ["Door", true], "one entry needs no count");
});

test("news comes forward and is read out, and what was there before is not news", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const subs = [];
  const states = threeOn();
  const hass = makeHass(states, { subs });
  const el = mount(w, { type: "x", updates: false, entities: [...Object.keys(states), "binary_sensor.smoke"] }, hass);
  const say = (card = el) => card.shadowRoot.querySelector(".say").textContent;
  subs[0].cb({ type: "current", notifications: { n1: { notification_id: "n1", title: "Backup", message: "done", created_at: "2026-09-21T09:00:00+00:00" } } });
  same([say(), head(el).title], ["", "Door"], "notifications from before the page loaded are not news");
  const smoke = () => ({ ...st("binary_sensor.smoke", "on", { friendly_name: "Smoke", device_class: "smoke" }), last_changed: new Date(Date.now()).toISOString() });
  el.hass = { ...hass, states: { ...states, "binary_sensor.smoke": smoke() } };
  same([say(), head(el).title], ["Smoke. on", "Smoke"], "an alarm that just went off is");
  el.hass = { ...hass, states };
  same([say(), head(el).title], ["Smoke. on", "Door"], "the entries the alarm held back are not news when it ends");
  const watch = new w.MutationObserver(() => {});
  watch.observe(el.shadowRoot.querySelector(".say"), { childList: true, characterData: true, subtree: true });
  mock.timers.tick(1000);
  el.hass = { ...hass, states: { ...states, "binary_sensor.smoke": smoke() } };
  same([say(), watch.takeRecords().length > 0], ["Smoke. on", true], "the same news again is read out again");

  const hidden = mount(w, { type: "x", updates: false, entities: ["binary_sensor.smoke"] }, makeHass({}));
  hidden.hass = makeHass({ "binary_sensor.smoke": smoke() });
  same([hidden.hidden, say(hidden)], [false, "Smoke. on"], "also on a card that was hidden");

  const still = mount(w, { type: "x", updates: false, rotate: 0, entities: ["binary_sensor.a", "binary_sensor.b"] }, makeHass({ "binary_sensor.a": states["binary_sensor.a"] }));
  still.hass = makeHass({ "binary_sensor.a": states["binary_sensor.a"], "binary_sensor.b": changedAt("binary_sensor.b", "Garage", -90000) });
  same([head(still).title, say(still)], ["Door", "Garage. on"], "a card that holds still keeps its first entry, and still reads the news out");
});

test("a swipe or an arrow key turns the card by hand and stops the turns", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const states = threeOn();
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, makeHass(states));
  const h = el.shadowRoot.querySelector(".head");
  const key = (k) => h.dispatchEvent(new w.KeyboardEvent("keydown", { key: k, bubbles: true }));
  key("ArrowRight");
  same(head(el).title, "Garage");
  key("ArrowLeft");
  key("ArrowLeft");
  same(head(el).title, "Gate", "and back, around the end");
  mock.timers.tick(60000);
  same(head(el).title, "Gate", "turning by hand stops the turns");
  const rtl = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, makeHass(states));
  rtl._rtl = () => true;
  const rkey = (k) => rtl.shadowRoot.querySelector(".head").dispatchEvent(new w.KeyboardEvent("keydown", { key: k, bubbles: true }));
  rkey("ArrowDown");
  same(head(rtl).title, "Garage", "down is the next one, also right to left");
  rkey("ArrowLeft");
  same(head(rtl).title, "Gate", "where left is the next one too");

  const other = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, makeHass(states));
  const o = other.shadowRoot.querySelector(".head");
  const pointer = (type, x, y = 10) =>
    o.dispatchEvent(new w.PointerEvent(type, { pointerId: 1, isPrimary: true, pointerType: "touch", clientX: x, clientY: y, bubbles: true }));
  const isOpen = () => other.shadowRoot.querySelector("ha-card").classList.contains("open");
  pointer("pointerdown", 200);
  pointer("pointermove", 150);
  pointer("pointermove", 120);
  pointer("pointerup", 120);
  o.click();
  same([head(other).title, isOpen(), other.shadowRoot.querySelector(".slide").style.transform], ["Garage", false, ""], "a swipe to the left shows the next entry and does not open the list");
  pointer("pointerdown", 100);
  pointer("pointermove", 170, 12);
  pointer("pointerup", 170, 12);
  o.click();
  same(head(other).title, "Door", "a swipe to the right shows the one before");
  pointer("pointerdown", 100);
  pointer("pointermove", 104, 60);
  pointer("pointerup", 104, 60);
  same(head(other).title, "Door", "moving up or down leaves the page to scroll");
  o.click();
  same(isOpen(), true, "a tap still opens the list");
});

test("a swipe ends the press on Home Assistant's ripple, and its click goes nowhere", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const got = [];
  w.customElements.define(
    "ha-ripple",
    class extends w.HTMLElement {
      connectedCallback() {
        for (const t of ["pointercancel", "click"]) this.parentNode.addEventListener(t, (e) => got.push(t + ":" + (e.pointerId ?? "")));
      }
    }
  );
  const states = threeOn();
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, makeHass(states));
  const h = el.shadowRoot.querySelector(".head");
  const pointer = (type, x) => h.dispatchEvent(new w.PointerEvent(type, { pointerId: 7, isPrimary: true, pointerType: "mouse", buttons: 1, clientX: x, clientY: 10 }));
  pointer("pointerdown", 200);
  pointer("pointermove", 150);
  same(got, ["pointercancel:7"], "the press ends once the card takes the pointer");
  pointer("pointermove", 120);
  pointer("pointerup", 120);
  h.click();
  same([got, head(el).title, el.shadowRoot.querySelector("ha-card").classList.contains("open")], [["pointercancel:7"], "Garage", false], "the swipe turns the card, and its click neither shows on the ripple nor opens the list");
  h.click();
  same([got.length, el.shadowRoot.querySelector("ha-card").classList.contains("open")], [2, true], "the next click is a tap again");
});

test("a press that ends off the card, or a card that leaves under the pointer, does not hold the turns", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const states = threeOn();
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, makeHass(states));
  const h = el.shadowRoot.querySelector(".head");
  const pointer = (type) => h.dispatchEvent(new w.PointerEvent(type, { pointerId: 3, isPrimary: true, pointerType: "mouse", buttons: 1, clientX: 10, clientY: 10 }));
  pointer("pointerenter");
  pointer("pointerdown");
  pointer("pointerleave");
  mock.timers.tick(8000);
  same(head(el).title, "Garage", "a press that leaves the card lets go of it");
  pointer("pointerenter");
  el.remove();
  w.document.body.append(el);
  mock.timers.tick(8000);
  same(head(el).title, "Gate", "a card that left under the pointer turns again once it is back");
});

test("the turns wait while a pointer rests on the card, while it is open and while it is out of sight", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const states = threeOn();
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, makeHass(states));
  const h = el.shadowRoot.querySelector(".head");
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
  el.shadowRoot.querySelector(".ebar").click();
  mock.timers.tick(8000);
  same(head(el).title, "Gate");
});

test("a broken rotate or slide gets a clear error", () => {
  const w = makeWindow();
  const error = (config) => {
    try {
      w.document.createElement("origami-notifications").setConfig({ type: "x", ...config });
      return null;
    } catch (e) {
      return e.message;
    }
  };
  same(
    [error({ rotate: -1 }), error({ rotate: "fast" }), error({ slide: "down" }), error({ rotate: 0, slide: "side" }), error({ rotate: false })],
    [
      "origami-notifications: rotate must be the seconds between turns, or 0 to turn them off",
      "origami-notifications: rotate must be the seconds between turns, or 0 to turn them off",
      "origami-notifications: slide must be up or side",
      null,
      null,
    ]
  );
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

test("infos fill a quiet card in their order, and leave it to what needs attention", async () => {
  useClock();
  const w = makeWindow({ clock: true });
  const subs = [];
  const states = quietStates();
  const infos = [{ entity: "weather.home", name: "Weather", state_content: ["temperature", "state"] }, "sensor.gone", { entity: "sun.sun", name: "Sunrise", color: "red" }, "sensor.energy"];
  const el = mount(w, { type: "x", updates: false, infos }, quietHass(states, { subs }));
  const shown = () => [head(el).title, el.shadowRoot.querySelector(".head .msg .t").textContent];
  const color = () => el.shadowRoot.querySelector("ha-card").style.getPropertyValue("--tile-color");
  same([el.hidden, shown(), color()], [false, ["Weather", "14 °C · Rainy"], "var(--state-weather-rainy-color, var(--state-weather-active-color, var(--state-active-color)))"], "a quiet card shows its first info, like a tile");
  mock.timers.tick(8000);
  same([shown(), color()], [["Sunrise", "below_horizon"], "var(--red-color)"], "an unavailable info is left out, and an own color shows while the entity is active");
  mock.timers.tick(8000);
  same([shown(), el.shadowRoot.querySelector(".badge").hidden], [["Energy", "4.2 kWh"], true], "no count for infos");
  subs[0].cb({ type: "current", notifications: { n1: { notification_id: "n1", title: "Backup", message: "done", created_at: "2026-09-21T09:00:00+00:00" } } });
  mock.timers.tick(30000);
  same(shown(), ["Backup", "done"], "a notification takes the card, and the infos wait");
  subs[0].cb({ type: "removed", notifications: { n1: {} } });
  same(shown(), ["Weather", "14 °C · Rainy"], "and come back once it is gone");

  class StateDisplay extends w.HTMLElement {}
  w.customElements.define("state-display", StateDisplay);
  await Promise.resolve();
  await Promise.resolve();
  const sd = el.shadowRoot.querySelector(".head .msg state-display");
  same(
    [sd.stateObj.entity_id, sd.content, sd.name, sd.timeFormat === undefined, el.shadowRoot.querySelector(".head .msg .t").hidden],
    ["weather.home", ["temperature", "state"], "Weather", true, true],
    "once Home Assistant has its state text, the info uses it, as a tile does"
  );
});

test("the state text of an info leaves the head with the info", () => {
  const w = makeWindow();
  const el = mount(w, { type: "x", hide_when_empty: false }, makeHass({}));
  const rule = cssRules(el).find((r) => r.selectorText === ".msg state-display[hidden]");
  same(rule && rule.style.getPropertyValue("display"), "none", "a hidden state-display stays hidden, though the card shows it inline");
});

test("an info whose parts say nothing shows its state, as Home Assistant does", () => {
  const w = makeWindow();
  const el = mount(w, { type: "x", updates: false, infos: [{ entity: "sensor.energy", state_content: "missing" }] }, quietHass(quietStates()));
  same([head(el).title, el.shadowRoot.querySelector(".head .msg .t").textContent], ["Energy", "4.2 kWh"]);
});

/* A weather entity with a daily and an hourly forecast, and the card's subscriptions to them. */
const forecastCard = (w, info, extra = {}) => {
  const subs = [];
  const states = { "weather.home": weatherAt("rainy", { supported_features: 7 }) };
  const names = { sunny: "Sunny", rainy: "Rainy", cloudy: "Cloudy", partlycloudy: "Partly cloudy" };
  const hass = makeHass(states, { subs, formatEntityState: (s) => names[s.state] || s.state });
  const el = mount(w, { type: "x", updates: false, rotate: 0, infos: [{ entity: "weather.home", ...info }], ...extra }, hass);
  const forecasts = () => subs.filter((s) => s.msg && s.msg.type === "weather/subscribe_forecast");
  return { el, hass, forecasts };
};
const shownInfo = (el) => [head(el).title, el.shadowRoot.querySelector(".head .msg .t").textContent];
const dayAt = (d, rest) => ({ datetime: new Date(Date.parse("2026-10-02T00:00:00Z") + d * 86400000).toISOString(), condition: "sunny", temperature: 16, templow: 9, ...rest });

test("an info shows the daily forecast in place of the weather, a day at a time", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const { el, forecasts } = forecastCard(w, { forecast_type: "daily", forecast_slots: 2, show_current: false });
  same(forecasts().map((s) => s.msg), [{ type: "weather/subscribe_forecast", entity_id: "weather.home", forecast_type: "daily" }], "the card asks for the daily forecast");
  same(el.hidden, true, "and waits for it, without the current weather in between");
  forecasts()[0].cb({ type: "daily", forecast: [dayAt(-1), dayAt(0), dayAt(1, { condition: "rainy", temperature: 12.5, templow: 7 }), dayAt(2)] });
  same([el.hidden, shownInfo(el)], [false, ["Today", "16° / 9° · Sunny"]], "today comes first, and a day already gone is left out");
  el.shadowRoot.querySelector(".head").dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  same(shownInfo(el), ["Tomorrow", "12.5° / 7° · Rainy"], "then tomorrow");
  el.shadowRoot.querySelector(".head").dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  same(shownInfo(el)[0], "Today", "two slots, as set");
  mock.timers.tick(Date.parse("2026-10-03T00:00:01Z") - Date.now());
  same(shownInfo(el), ["Today", "12.5° / 7° · Rainy"], "at midnight tomorrow becomes today");
});

test("an hourly or twice daily forecast names its hour or its half of the day", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC", stateIcon: true });
  const hour = (h, rest) => ({ datetime: new Date(NOW + h * 3600000).toISOString(), condition: "cloudy", temperature: 11, ...rest });
  const { el, forecasts } = forecastCard(w, { forecast_type: "hourly", forecast_slots: 3, show_current: false, name: "Oslo" });
  forecasts()[0].cb({ type: "hourly", forecast: [hour(-1), hour(0), hour(12, { condition: "partlycloudy", is_daytime: false })] });
  const icon = () => {
    const i = el.shadowRoot.querySelector(".head .glyph ha-state-icon");
    return [i.stateObj.state, i.icon];
  };
  same([...shownInfo(el), icon()], ["Oslo", "12:00 PM · 11° · Cloudy", ["cloudy", null]], "a name of its own comes first, the hour moves to the second line, and the icon is the condition's");
  el.shadowRoot.querySelector(".head").dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  same([...shownInfo(el), icon()], ["Oslo", "Tomorrow at 12:00 AM · 11° · Partly cloudy", ["partlycloudy", "mdi:weather-night-partly-cloudy"]], "an hour after midnight says its day, and a night has a night icon");

  const items = forecastCard(w, { forecast_type: "hourly", show_current: false, name: [{ type: "entity" }] });
  items.hass.formatEntityName = (st, name) => (Array.isArray(name) ? "Home weather" : st.attributes.friendly_name);
  items.forecasts()[0].cb({ type: "hourly", forecast: [hour(0)] });
  same(shownInfo(items.el), ["Home weather", "12:00 PM · 11° · Cloudy"], "a name from name items as well");

  const bare = forecastCard(w, { forecast_type: "hourly", show_current: false });
  bare.forecasts()[0].cb({ type: "hourly", forecast: [{ datetime: new Date(NOW).toISOString(), temperature: 9 }] });
  same(
    [shownInfo(bare.el), bare.el.shadowRoot.querySelector(".head .glyph ha-state-icon").stateObj.state],
    [["12:00 PM", "9°"], "unknown"],
    "an hour without a condition shows no weather of its own"
  );

  const twice = forecastCard(w, { forecast_type: "twice_daily", show_current: false });
  twice.forecasts()[0].cb({ type: "twice_daily", forecast: [hour(0, { condition: "sunny", temperature: 17, is_daytime: true })] });
  same(shownInfo(twice.el), ["Today", "Day · 17° · Sunny"], "half a day says whether it is day or night");
});

test("forecast temperatures follow the number format of the profile, as Home Assistant writes numbers", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const text = (number_format) => {
    const card = forecastCard(w, { forecast_type: "daily", show_current: false });
    card.el.hass = { ...card.hass, locale: { language: "de", number_format } };
    card.forecasts()[0].cb({ type: "daily", forecast: [dayAt(0, { temperature: 7.5, templow: 1.5 })] });
    return card.el.shadowRoot.querySelector(".head .msg .t").textContent.split(" · ")[0];
  };
  same(
    ["language", "decimal_comma", "comma_decimal", "quote_decimal", "none"].map(text),
    ["7,5° / 1,5°", "7,5° / 1,5°", "7.5° / 1.5°", "7.5° / 1.5°", "7.5° / 1.5°"]
  );
});

test("until its first turn the card shows its first info, also one that loads later", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const subs = [];
  const states = { "weather.home": weatherAt("rainy", { supported_features: 1 }), "sun.sun": quietStates()["sun.sun"] };
  const el = mount(w, { type: "x", updates: false, infos: [{ entity: "weather.home", forecast_type: "daily", show_current: false }, "sun.sun"] }, makeHass(states, { subs, formatEntityState: (s) => (s.state === "sunny" ? "Sunny" : s.state) }));
  same(head(el).title, "Sun", "the sun shows while the forecast loads");
  subs.find((s) => s.msg && s.msg.type === "weather/subscribe_forecast").cb({ type: "daily", forecast: [dayAt(0)] });
  same(head(el).title, "Today", "then the forecast takes its place at the front");
  mock.timers.tick(8000);
  same(head(el).title, "Sun", "and the turns go on from there");
});

test("a weather info shows the current weather and its forecast, unless it asks for one of them", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const both = forecastCard(w, { forecast_type: "daily" });
  same(shownInfo(both.el), ["Home", "Rainy"], "the current weather shows while the forecast loads");
  both.forecasts()[0].cb({ type: "daily", forecast: [dayAt(0)] });
  same(shownInfo(both.el), ["Home", "Rainy"], "and comes first, like on Home Assistant's forecast card");
  both.el.shadowRoot.querySelector(".head").dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  same(shownInfo(both.el), ["Today", "16° / 9° · Sunny"], "then the forecast");
  const current = forecastCard(w, { forecast_type: "daily", show_forecast: false });
  same([shownInfo(current.el), current.forecasts().length], [["Home", "Rainy"], 0], "show_forecast: false leaves the forecast out");
  const none = forecastCard(makeWindow({ clock: true, zone: "UTC" }), { forecast_type: "daily", show_current: false });
  same(none.el.hidden, true, "only the forecast waits for it");
  none.forecasts()[0].cb({ type: "daily", forecast: null });
  same(shownInfo(none.el), ["Home", "Rainy"], "and a forecast that came empty shows the current weather, as on Home Assistant's forecast card");
});

test("a forecast the weather entity lacks shows the current weather, as Home Assistant's forecast card does", () => {
  const w = makeWindow();
  const subs = [];
  const states = { "weather.home": weatherAt("rainy", { supported_features: 1 }) };
  const el = mount(w, { type: "x", updates: false, infos: [{ entity: "weather.home", forecast_type: "hourly" }] }, makeHass(states, { subs, formatEntityState: () => "Rainy" }));
  same([shownInfo(el), subs.filter((s) => s.msg && s.msg.type === "weather/subscribe_forecast").length], [["Home", "Rainy"], 0]);
});

test("each weather entity and forecast type has one subscription, which ends with the card", async () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const { el, forecasts } = forecastCard(w, { forecast_type: "daily" }, { weather: "weather.home" });
  same(forecasts().map((s) => s.msg.forecast_type), ["hourly", "daily"], "the weather option reads the hourly forecast, the info the daily one");
  el.setConfig({ type: "x", updates: false, weather: "weather.home", infos: [{ entity: "weather.home", forecast_type: "daily" }, { entity: "weather.home", forecast_type: "hourly" }] });
  same(forecasts().length, 2, "an info on the hourly forecast shares the subscription of the weather option");
  await Promise.resolve();
  el.remove();
  await Promise.resolve();
  same(forecasts().map((s) => s.closed), [true, true], "both end with the card");
});

test("a broken forecast option gets a clear error", () => {
  const w = makeWindow();
  const error = (info) => {
    try {
      w.document.createElement("origami-notifications").setConfig({ type: "x", infos: [{ entity: "weather.home", ...info }] });
      return null;
    } catch (e) {
      return e.message;
    }
  };
  same(
    [
      error({ forecast_type: "weekly" }),
      error({ forecast_type: "daily", forecast_slots: 0 }),
      error({ forecast_type: "daily", forecast_slots: 2.5 }),
      error({ forecast_type: "twice_daily", forecast_slots: 3, show_current: false }),
      error({ forecast_type: "daily", show_current: "no" }),
    ],
    [
      "origami-notifications: forecast_type must be daily, hourly or twice_daily",
      "origami-notifications: forecast_slots must be a whole number above 0",
      "origami-notifications: forecast_slots must be a whole number above 0",
      null,
      "origami-notifications: show_current must be true or false",
    ]
  );
});

test("the head is a button only while what it shows does something", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const el = mount(w, { type: "x", updates: false, infos: ["sun.sun", { entity: "sensor.energy", tap_action: "none" }] }, quietHass(quietStates()));
  const state = () => [head(el).title, el.shadowRoot.querySelector("ha-card").classList.contains("tappable"), el.shadowRoot.querySelector(".head").getAttribute("aria-disabled")];
  same(state(), ["Sun", true, "false"], "the sun opens its entity");
  mock.timers.tick(8000);
  same(state(), ["Energy", false, "true"], "after a turn the energy info does nothing");
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

test("an info shows while its conditions hold, checked as Home Assistant checks them", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const states = {
    ...quietStates(),
    "input_boolean.guests": st("input_boolean.guests", "off", { friendly_name: "Guests" }),
    "person.anna": st("person.anna", "home", { friendly_name: "Anna", user_id: "u1" }),
    "input_text.wanted": st("input_text.wanted", "below_horizon", { friendly_name: "Wanted" }),
  };
  const shows = (visibility) => {
    const el = mount(w, { type: "x", updates: false, hide_when_empty: false, infos: [{ entity: "sensor.energy", visibility }] }, quietHass(states));
    return head(el).title === "Energy";
  };
  const c = (condition, rest) => ({ condition, ...rest });
  same(
    [
      shows([c("state", { entity: "sun.sun", state: "below_horizon" })]),
      shows([c("state", { entity: "sun.sun", state_not: ["below_horizon", "above_horizon"] })]),
      shows([{ entity: "input_boolean.guests", state: "off" }]),
      shows([c("state", { state: "4.2" })]),
      shows([c("state", { entity: "sun.sun", attribute: "elevation", state: "-5" })]),
      shows([c("state", { entity: "sun.sun", state: "input_text.wanted" })]),
      shows([c("state", { entity: "sensor.none", state_not: "on" })]),
      shows([c("numeric_state", { above: 4, below: 5 })]),
      shows([c("numeric_state", { entity: "sun.sun", above: 0 })]),
      shows([c("user", { users: ["u1"] })]),
      shows([c("user", { users: ["u2"] })]),
      shows([c("location", { locations: ["home"] })]),
      shows([c("or", { conditions: [c("user", { users: ["u2"] }), c("state", { entity: "sun.sun", state: "below_horizon" })] })]),
      shows([c("not", { conditions: [c("user", { users: ["u1"] })] })]),
      shows([c("and")]),
      shows([c("user", { users: ["u2"], enabled: false })]),
      shows([c("view_columns", { min: 2 })]),
      shows([c("screen", { media_query: "(max-width: 600px)" })]),
    ],
    [true, false, true, true, true, true, true, true, false, true, false, true, true, false, true, true, true, false]
  );
});

test("a time condition is read in the profile's zone, and the card wakes when it changes", () => {
  useClock();
  const w = makeWindow({ clock: true, zone: "UTC" });
  const states = quietStates();
  const card = (visibility) => mount(w, { type: "x", updates: false, hide_when_empty: false, infos: [{ entity: "sensor.energy", visibility }] }, quietHass(states));
  const lunch = card([{ condition: "time", after: "13:00", before: "14:00" }]);
  const night = card([{ condition: "time", after: "22:00", before: "06:00" }]);
  const friday = card([{ condition: "time", weekdays: ["fri"] }]);
  const saturday = card([{ condition: "time", weekdays: ["sat"] }]);
  const lenient = card([{ condition: "time", after: "8:00 AM" }]);
  const titles = () => [lunch, night, friday, saturday, lenient].map((el) => head(el).title);
  same(titles(), ["All quiet", "All quiet", "Energy", "All quiet", "Energy"], "at noon on a Friday");
  mock.timers.tick(3600000 + 50);
  same(head(lunch).title, "Energy", "the card wakes at one");
  mock.timers.tick(10 * 3600000);
  same(titles(), ["All quiet", "Energy", "Energy", "All quiet", "Energy"], "at eleven at night");
});

test("conditions only the server knows go to it, and its answer decides", async () => {
  const w = makeWindow();
  const subs = [];
  const states = quietStates();
  const sun = { condition: "sun", after: "sunset" };
  const el = mount(w, { type: "x", updates: false, hide_when_empty: false, infos: [{ entity: "sensor.energy", visibility: [sun] }] }, quietHass(states, { subs }));
  const sub = subs.find((s) => s.msg && s.msg.type === "subscribe_condition");
  same([sub.msg.condition, head(el).title], [sun, "All quiet"], "until the server answers, the info waits");
  sub.cb({ result: true });
  same(head(el).title, "Energy");
  sub.cb({ error: { code: "invalid", message: "x" } });
  same(head(el).title, "All quiet", "an error hides it, as it hides a card");
  const core = { condition: "state", entity_id: "sun.sun", state: "below_horizon", for: { minutes: 5 } };
  el.setConfig({ type: "x", updates: false, hide_when_empty: false, infos: [{ entity: "sensor.energy", visibility: [core] }] });
  await Promise.resolve();
  await Promise.resolve();
  same(
    [sub.closed, subs.filter((s) => s.msg && s.msg.type === "subscribe_condition").map((s) => s.msg.condition)],
    [true, [sun, core]],
    "a condition in Home Assistant's own format goes to the server too, and one no longer needed is dropped"
  );
});

test("a server condition is asked for once the card is on the page, in the order Home Assistant mounts cards", () => {
  const w = makeWindow();
  const subs = [];
  const sun = { condition: "sun", after: "sunset" };
  const el = w.document.createElement("origami-notifications");
  el.setConfig({ type: "x", updates: false, hide_when_empty: false, infos: [{ entity: "sensor.energy", visibility: [sun] }] });
  el.hass = quietHass(quietStates(), { subs });
  const asked = () => subs.filter((s) => s.msg && s.msg.type === "subscribe_condition");
  same(asked().length, 0, "not while the card is off the page");
  w.document.body.append(el);
  same(asked().map((s) => s.msg.condition), [sun], "but once it is there");
  asked()[0].cb({ result: true });
  same(head(el).title, "Energy");
});

test("a time condition changes at its time on the days the clock changes", () => {
  useClock(Date.parse("2026-10-25T05:00:00Z"));
  const w = makeWindow({ clock: true, zone: "Europe/Berlin" });
  const el = mount(w, { type: "x", updates: false, hide_when_empty: false, infos: [{ entity: "sensor.energy", visibility: [{ condition: "time", after: "08:00" }] }] }, quietHass(quietStates()));
  same(head(el).title, "All quiet", "at 6 in Berlin, on the day the clock goes back at 3");
  /* One tick at a time, since a long tick runs each timer with the clock at its end. */
  mock.timers.tick(Date.parse("2026-10-25T06:00:01Z") - Date.now());
  same(head(el).title, "All quiet", "at 7 it still waits");
  mock.timers.tick(Date.parse("2026-10-25T07:00:01Z") - Date.now());
  same(head(el).title, "Energy", "at 8 it shows");
});

test("a screen condition follows the screen", () => {
  const w = makeWindow();
  const mql = { matches: false, onchange: null };
  w.matchMedia = () => mql;
  const el = mount(w, { type: "x", updates: false, hide_when_empty: false, infos: [{ entity: "sensor.energy", visibility: [{ condition: "screen", media_query: "(max-width: 600px)" }] }] }, quietHass(quietStates()));
  same(head(el).title, "All quiet");
  mql.matches = true;
  mql.onchange();
  same(head(el).title, "Energy");
});

test("a broken info gets a clear error", () => {
  const w = makeWindow();
  const error = (config) => {
    try {
      w.document.createElement("origami-notifications").setConfig({ type: "x", ...config });
      return null;
    } catch (e) {
      return e.message;
    }
  };
  same(
    [error({ infos: "sun.sun" }), error({ infos: [{ name: "Sun" }] }), error({ infos: [{ entity: "sun.sun", visibility: { condition: "user" } }] }), error({ infos: ["sun.sun", { entity: "weather.home", tap_action: "none" }] })],
    [
      "origami-notifications: infos must be a list",
      'origami-notifications: infos must contain entity ids, got {"name":"Sun"}',
      "origami-notifications: visibility of sun.sun must be a list of conditions",
      null,
    ]
  );
});

/* Plays Home Assistant's dialog manager. It makes the element once, hands it hass and calls showDialog. */
const dialogHost = (w, hass) => {
  const shown = [];
  let el = null;
  w.addEventListener("show-dialog", (e) => {
    shown.push(e.detail);
    el = el || w.document.createElement(e.detail.dialogTag);
    el.hass = hass;
    el.showDialog(e.detail.dialogParams);
    if (!el.isConnected) w.document.body.append(el);
  });
  return { shown, get el() {
    return el;
  } };
};

test("a narrow card opens its list in Home Assistant's dialog", () => {
  const w = makeWindow();
  w.customElements.define("ha-adaptive-dialog", class extends w.HTMLElement {});
  w.customElements.define("ha-icon-button", class extends w.HTMLElement {});
  const states = threeOn();
  const hass = makeHass(states);
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, hass);
  const host = dialogHost(w, hass);
  const h = el.shadowRoot.querySelector(".head");
  resize(el, 180);
  same([el.classList.contains("narrow"), h.getAttribute("aria-haspopup"), h.hasAttribute("aria-expanded")], [true, "dialog", false]);
  h.click();
  const dialog = host.el;
  const inner = dialog.shadowRoot.querySelector("ha-adaptive-dialog");
  const titles = () => [...dialog.shadowRoot.querySelectorAll(".row .title")].map((t) => t.textContent);
  same(
    [host.shown.length, el.shadowRoot.querySelector("ha-card").classList.contains("open"), inner.open, inner.getAttribute("header-title"), titles()],
    [1, false, true, "3 notifications", ["Door", "Garage", "Gate"]],
    "the card stays closed and the dialog shows every row"
  );
  const infos = [];
  el.addEventListener("hass-more-info", (e) => infos.push(e.detail.entityId));
  dialog.shadowRoot.querySelectorAll(".row .rtile")[1].click();
  same(infos, ["binary_sensor.b"], "a row opens its entity, on top of the dialog");
  dialog.shadowRoot.querySelector(".row .x").click();
  same(titles(), ["Garage", "Gate"], "a dismissal reaches the dialog at once");
  const closed = [];
  dialog.addEventListener("dialog-closed", (e) => closed.push(e.detail.dialog));
  dialog.shadowRoot.querySelector("ha-icon-button").click();
  same([closed, dialog.shadowRoot.querySelector("ha-adaptive-dialog")], [["origami-notifications-dialog"], null], "with nothing left it closes");

  resize(el, 600);
  same(el.classList.contains("narrow"), false);
  const other = makeWindow();
  other.customElements.define("ha-adaptive-dialog", class extends other.HTMLElement {});
  const wide = mount(other, { type: "x", updates: false, entities: Object.keys(states) }, makeHass(threeOn()));
  const asked = [];
  other.addEventListener("show-dialog", (e) => asked.push(e));
  resize(wide, 400);
  wide.shadowRoot.querySelector(".head").click();
  same([asked.length, wide.shadowRoot.querySelector("ha-card").classList.contains("open")], [0, true], "a wide card unfolds in place");
});

test("the dialog keeps its times up to date", () => {
  useClock();
  const w = makeWindow({ clock: true });
  w.customElements.define("ha-adaptive-dialog", class extends w.HTMLElement {});
  const states = { "binary_sensor.a": changedAt("binary_sensor.a", "Door", -60000) };
  const hass = makeHass(states);
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, hass);
  const host = dialogHost(w, hass);
  resize(el, 180);
  el.shadowRoot.querySelector(".head").click();
  const when = () => host.el.shadowRoot.querySelector(".row .when").textContent;
  same(when(), "1 min. ago");
  mock.timers.tick(10 * 60000);
  same(when(), "11 min. ago");
});

test("until Home Assistant has its dialog, a narrow card unfolds in place", () => {
  const w = makeWindow();
  const states = threeOn();
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, makeHass(states));
  const shown = [];
  w.addEventListener("show-dialog", (e) => shown.push(e));
  resize(el, 180);
  el.shadowRoot.querySelector(".head").click();
  same([shown.length, el.shadowRoot.querySelector("ha-card").classList.contains("open")], [0, true]);
});

describe("editor for infos", () => {
  const states = () => ({
    "sun.sun": st("sun.sun", "above_horizon", { friendly_name: "Sun" }),
    "weather.home": st("weather.home", "rainy", { friendly_name: "Home" }),
    "sensor.energy": st("sensor.energy", "4.2", { friendly_name: "Energy" }),
  });
  const open = (w, config) => {
    const ed = w.document.createElement("origami-notifications-editor");
    const written = [];
    ed.addEventListener("config-changed", (e) => written.push(e.detail.config));
    ed.setConfig({ type: "custom:origami-notifications", ...config });
    ed.hass = makeHass(states());
    return { ed, written, form: ed.querySelector("ha-form") };
  };
  const send = (w, target, value) => target.dispatchEvent(new w.CustomEvent("value-changed", { detail: { value }, bubbles: true, composed: true }));
  const infoForms = (ed) => [...ed.querySelectorAll("ha-expansion-panel ha-form")];

  test("each info is edited with the fields of a tile and Home Assistant's visibility editor", () => {
    const w = makeWindow();
    const weather = { entity: "weather.home", name: "Weather", state_content: ["temperature", "state"] };
    const { ed, written, form } = open(w, { infos: ["sun.sun", weather] });
    same(form.data.infos, ["sun.sun", "weather.home"], "the picker lists the infos");
    same(
      infoForms(ed).map((f) => f.schema.map((s) => s.name || s.type)),
      [
        ["name", "grid", "state_content", "show_entity_picture", "tap_action", "optional_actions"],
        ["name", "grid", "state_content", "show_entity_picture", "tap_action", "optional_actions"],
      ]
    );
    same([ed.querySelectorAll("ha-card-conditions-editor").length, infoForms(ed)[1].data], [2, weather]);
    send(w, infoForms(ed)[0], { entity: "sun.sun", state_content: "next_rising", color: "state", name: "" });
    same(written.at(-1).infos, [{ entity: "sun.sun", state_content: "next_rising" }, weather], "only what is set is written");
    same(infoForms(ed)[0].schema.map((s) => s.name || s.type).includes("time_format"), true, "a time offers its format");
    send(w, ed.querySelectorAll("ha-card-conditions-editor")[1], [{ condition: "user", users: ["u1"] }]);
    same(written.at(-1).infos[1].visibility, [{ condition: "user", users: ["u1"] }], "the visibility editor writes the conditions");
    send(w, ed.querySelectorAll("ha-card-conditions-editor")[1], []);
    same("visibility" in written.at(-1).infos[1], false, "and drops an empty list");
  });

  test("a weather info shows the current weather, its forecast or both, chosen as on Home Assistant's forecast card", () => {
    const w = makeWindow();
    const ed = w.document.createElement("origami-notifications-editor");
    const written = [];
    ed.addEventListener("config-changed", (e) => written.push(e.detail.config));
    ed.setConfig({ type: "custom:origami-notifications", infos: ["weather.home"] });
    ed.hass = makeHass({ "weather.home": st("weather.home", "rainy", { friendly_name: "Home", supported_features: 3 }) });
    const form = () => infoForms(ed)[0];
    const names = () => form().schema.map((s) => s.name || s.type);
    const options = (name) => form().schema.find((s) => s.name === name).selector.select.options.map((o) => [o.value, o.label]);
    const choose = (value) => send(w, form(), { ...form().data, ...value });
    same(
      [names(), options("forecast"), form().data.forecast],
      [
        ["name", "grid", "forecast", "state_content", "show_entity_picture", "tap_action", "optional_actions"],
        [["show_both", "Current weather and forecast"], ["show_current", "Only the current weather"], ["show_forecast", "Only the forecast"]],
        "show_current",
      ],
      "an info starts with the current weather, like a tile"
    );
    choose({ forecast: "show_forecast" });
    same(
      [written.at(-1).infos, names(), options("forecast_type")],
      [[{ entity: "weather.home", show_current: false, forecast_type: "daily" }], ["name", "grid", "forecast", "forecast_type", "forecast_slots", "show_entity_picture", "tap_action", "optional_actions"], [["daily", "Daily"], ["hourly", "Hourly"]]],
      "only the forecast takes the first type the entity has, and asks for its type and slots in place of the state content"
    );
    choose({ forecast_slots: 3 });
    same([written.at(-1).infos, form().closest("ha-expansion-panel").secondary], [[{ entity: "weather.home", show_current: false, forecast_type: "daily", forecast_slots: 3 }], "Daily"], "the panel names the forecast it shows");
    choose({ forecast: "show_both" });
    same([written.at(-1).infos, names().includes("state_content")], [[{ entity: "weather.home", forecast_type: "daily", forecast_slots: 3 }], true], "both keep the forecast and offer the state content again");
    choose({ forecast: "show_current" });
    same(written.at(-1).infos, ["weather.home"], "the current weather alone drops the forecast options");
    choose({ forecast: "show_forecast" });
    choose({ forecast: undefined });
    same(written.at(-1).infos, ["weather.home"], "and so does a cleared choice");

    const kept = { entity: "weather.home", show_forecast: false, forecast_type: "hourly", forecast_slots: 4 };
    ed.setConfig({ type: "custom:origami-notifications", infos: [kept] });
    choose({ name: "Garden" });
    same(written.at(-1).infos, [{ entity: "weather.home", name: "Garden", show_forecast: false, forecast_type: "hourly", forecast_slots: 4 }], "an edit elsewhere keeps the forecast keys from YAML");
    choose({ forecast: "show_both" });
    same(written.at(-1).infos, [{ entity: "weather.home", name: "Garden", forecast_type: "hourly", forecast_slots: 4 }], "and a new choice takes them up");
  });

  test("an info panel shows the state icon of its entity, like Home Assistant's row editors", () => {
    const w = makeWindow({ stateIcon: true });
    const { ed } = open(w, { infos: ["sun.sun", { entity: "weather.home", icon: "mdi:umbrella" }] });
    const leads = [...ed.querySelectorAll("ha-expansion-panel")].filter((p) => p.querySelector(":scope > ha-form, :scope > .content > ha-form")).map((p) => p.querySelector(":scope > [slot=leading-icon]"));
    same(leads.map((l) => [l.localName, l.stateObj.entity_id, l.icon]), [["ha-state-icon", "sun.sun", null], ["ha-state-icon", "weather.home", "mdi:umbrella"]]);
  });

  test("moving, swapping and removing infos keeps their options", () => {
    const w = makeWindow();
    const weather = { entity: "weather.home", name: "Weather" };
    const { written, form } = open(w, { infos: ["sun.sun", weather] });
    const pick = (infos) => send(w, form, { ...JSON.parse(JSON.stringify(form.data)), infos });
    pick(["weather.home", "sun.sun"]);
    same(written.at(-1).infos, [weather, "sun.sun"], "moved");
    pick(["sensor.energy", "sun.sun"]);
    same(written.at(-1).infos, [{ entity: "sensor.energy", name: "Weather" }, "sun.sun"], "the picker swapped one in place");
    pick([]);
    same("infos" in written.at(-1), false, "none left");
  });

  test("the turns are written only when they differ from the defaults", () => {
    const w = makeWindow();
    const { written, form } = open(w, {});
    same([form.data.rotate, form.data.slide], [8, "up"]);
    send(w, form, { ...JSON.parse(JSON.stringify(form.data)), rotate: 0, slide: "side" });
    same([written.at(-1).rotate, written.at(-1).slide], [0, "side"]);
    send(w, form, { ...JSON.parse(JSON.stringify(form.data)), rotate: 8, slide: "up" });
    same(["rotate" in written.at(-1), "slide" in written.at(-1)], [false, false]);
  });
});

test("new states from Home Assistant do not push the next turn back", () => {
  useClock();
  const w = makeWindow({ clock: true });
  const states = threeOn();
  const hass = makeHass(states);
  const el = mount(w, { type: "x", updates: false, entities: Object.keys(states) }, hass);
  for (let i = 0; i < 7; i++) {
    mock.timers.tick(1000);
    el.hass = { ...hass, states: { ...states, "binary_sensor.a": { ...states["binary_sensor.a"], last_updated: new Date(Date.now()).toISOString() } } };
  }
  mock.timers.tick(1000);
  same(head(el).title, "Garage");
});
