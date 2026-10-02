const { test, afterEach } = require("node:test");
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
  /* Animations end at once. */
  window.Element.prototype.animate = () => ({
    cancel() {},
    set onfinish(fn) {
      this._f = fn;
      if (fn) fn();
    },
    get onfinish() {
      return this._f;
    },
  });
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
      calls.push(["ws", msg.type]);
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
  same(hass.calls.map((c) => c[0]).includes("persistent_notification.dismiss"), true, "dismiss service");
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
    [elAuto._items.length, auto.calls.some((c) => c[0] === "update.skip")],
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
  const el = mount(
    w,
    {
      type: "x",
      entities: [
        { entity: "sensor.dinner", background: true },
        { entity: "sensor.book", type: "picture", image: "cover" },
        { entity: "media_player.tv", type: "generic" },
      ],
    },
    hass
  );
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
  const bg = () => [...el.shadowRoot.querySelectorAll(".backdrop img")].map((i) => i.getAttribute("src"));
  el._items.sort((a, b) => (a.title === "Lasagne" ? -1 : b.title === "Lasagne" ? 1 : 0));
  el._render();
  same(bg().includes("http://ha.local/local/food/lasagne.jpg"), true, "background from the item on top");
  el._items.sort((a, b) => (a.title === "Dune" ? -1 : b.title === "Dune" ? 1 : 0));
  el._render();
  same(el._bgUrl, null, "no background for sources without it");
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
    w.eval(CODE.replace(/^const /gm, "var "));
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
    { domain: "hue", issue_id: "gone", severity: "error", created: "2026-09-21T07:00:00+00:00", active: false },
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
  same(hass.calls.filter((c) => c[0] === "ws").length > 0, true, "ignore issue");

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
  same(rows(el).length, 2, "back when Home Assistant refuses");

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
  el._toggle();
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
  el._toggle();
  const x = el.shadowRoot.querySelector(".row .x");
  x.focus();
  x.click();
  const focused = el.shadowRoot.activeElement;
  same(focused && focused.closest(".row").querySelector(".title").textContent, "B");
});
