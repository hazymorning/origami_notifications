const { describe, test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const CODE = fs.readFileSync(path.join(__dirname, "..", "dist", "origami-notifications.js"), "utf8");

/* Closing a window stops its timers, so the test process can exit. */
const windows = [];
afterEach(() => windows.splice(0).forEach((w) => w.close()));

function makeWindow() {
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
  window.eval(CODE);
  windows.push(window);
  return window;
}

function st(entity_id, state, attributes = {}) {
  return { entity_id, state, attributes, last_changed: "2026-09-21T10:00:00+00:00" };
}

function makeHass(states = {}, opts = {}) {
  const calls = [];
  return {
    calls,
    states,
    entities: opts.entities || {},
    locale: { language: opts.lang || "en" },
    user: opts.user || { id: "u1", is_admin: true },
    connection: {
      subscribeMessage: (cb, msg) => {
        (opts.subs || []).push({ cb, msg });
        return Promise.resolve(() => {});
      },
      subscribeEvents: (cb, ev) => {
        (opts.subs || []).push({ cb, ev });
        return Promise.resolve(() => {});
      },
    },
    callService: (d, s, data) => {
      calls.push([d + "." + s, data]);
      return Promise.resolve();
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

test("non-admins can't install or skip updates, they hide them on this device", () => {
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

test("cards on one device share their dismissals", () => {
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
  same(error({ entities: [{ entity: "sensor.door", actions: [null] }] }), "origami-notifications: actions must be a list of buttons, each with a label and a tap_action");
  same(error({ entities: [{ entity: "sensor.door", tap_action: "more-info" }] }), "origami-notifications: tap_action must be an action, like action: more-info");
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

test("a height limit from css makes the open list scroll", () => {
  const w = makeWindow();
  const el = mount(w, { type: "x", updates: false, entities: ["binary_sensor.door"], css: ":host { --origami-max-height: 200px; }" }, makeHass({ "binary_sensor.door": st("binary_sensor.door", "on") }));
  el.style.setProperty("--origami-max-height", "200px");
  el.shadowRoot.querySelector(".head").click();
  same([el.classList.contains("capped"), el.shadowRoot.querySelector("ha-card").classList.contains("settled")], [true, true]);
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
