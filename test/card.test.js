import assert from "node:assert/strict";
import { mock, test } from "node:test";
import pkg from "../package.json" with { type: "json" };
import { actionsOf, CODE, head, same, makeHass, makeWindow, mount, NOW, notifications, on, q, rows, settle, st, statesOf, titles } from "./helpers.js";

const at = (minutes) => new Date(NOW + minutes * 60000).toISOString();
const doors = () => statesOf(on("binary_sensor.door", "Door", {}, at(-1)), on("binary_sensor.garage", "Garage", {}, at(-2)), on("binary_sensor.gate", "Gate", {}, at(-3)));
const card = (entities, extra) => ({ updates: false, repairs: false, entities, ...extra });
const tick = async (el, ms) => {
  mock.timers.tick(ms);
  await settle(el);
};
const key = (el, k) => q(el, ".head").dispatchEvent(new el.ownerDocument.defaultView.KeyboardEvent("keydown", { key: k, bubbles: true }));

test("the card loads once, with its editor, its dialog and the version of package.json", () => {
  const w = makeWindow();
  const logged = [];
  w.console.info = (...args) => logged.push(args.join(" "));
  w.eval(CODE);
  assert.deepEqual(
    ["origami-notifications", "origami-notifications-editor", "origami-notifications-dialog"].map((tag) => Boolean(w.customElements.get(tag))),
    [true, true, true]
  );
  same([w.customCards.map((c) => [c.type, c.preview]), logged], [[["origami-notifications", true]], []], "a second load changes nothing");
  assert.ok(CODE.includes(`"${pkg.version}"`), "the version comes from package.json");
});

test("an empty card hides the way Home Assistant expects, and shows in the editor and the card picker", async () => {
  const w = makeWindow();
  const events = [];
  const states = (state) => statesOf(st("binary_sensor.door", state, { friendly_name: "Door" }));
  const el = w.document.createElement("origami-notifications");
  el.addEventListener("card-visibility-changed", (e) => events.push(e.detail.value));
  el.setConfig({ type: "x", ...card(["binary_sensor.door"]) });
  w.document.body.append(el);
  el.hass = makeHass(states("off"));
  await settle(el);
  assert.deepEqual([el.hidden, el.connectedWhileHidden], [true, true]);
  el.hass = makeHass(states("on"));
  await settle(el);
  assert.deepEqual([el.hidden, events], [false, [false, true]]);
  el.preview = true;
  el.hass = makeHass(states("off"));
  await settle(el);
  assert.equal(el.hidden, false, "never hidden in the editor");
  const picker = w.document.createElement("hui-card-picker");
  picker.attachShadow({ mode: "open" });
  w.document.body.append(picker);
  const shown = await mount(w, w.customElements.get("origami-notifications").getStubConfig(), makeHass({}), picker.shadowRoot);
  assert.deepEqual([shown.hidden, head(shown).title], [false, "All quiet"], "the card picker shows an empty card");
});

test("rows show their entity's icon and color, and urgency colors them first", async () => {
  const w = makeWindow({ define: ["ha-state-icon"] });
  const states = statesOf(st("alarm_control_panel.house", "triggered", { friendly_name: "House" }), st("lock.back", "unlocked", { friendly_name: "Back" }), on("binary_sensor.window", "Window", { device_class: "window" }));
  const subs = [];
  const el = await mount(w, card(Object.keys(states)), makeHass(states, { subs }));
  notifications(subs[0], { notification_id: "n1", title: "Backup", message: "done", created_at: "2026-09-21T09:00:00+00:00" });
  await settle(el);
  const color = (title) => [...el.shadowRoot.querySelectorAll(".row")].find((r) => r.querySelector(".title").textContent === title).style.getPropertyValue("--tile-color");
  assert.deepEqual(["House", "Back", "Window", "Backup"].map(color), [
    "var(--error-color)",
    "var(--state-lock-unlocked-color, var(--state-lock-active-color, var(--state-active-color)))",
    "var(--state-binary_sensor-window-on-color, var(--state-binary_sensor-on-color, var(--state-binary_sensor-active-color, var(--state-active-color))))",
    "var(--info-color)",
  ]);
  const house = q(el, ".row");
  assert.deepEqual([house.className.trim().split(/\s+/), house.dataset.kind, q(el, ".item").getAttribute("role")], [["row", "crit", "link"], "alarm", "listitem"]);
  assert.equal(q(el, ".row ha-state-icon").stateObj.entity_id, "alarm_control_panel.house");
  assert.deepEqual([q(el, "ha-card").classList.contains("crit"), head(el).title], [true, "House"], "the closed card pulses with what is critical");
});

test("a picture shows in the icon and, with background, blurred behind the card", async () => {
  const w = makeWindow();
  const states = statesOf(st("sensor.dinner", "Lasagne", { friendly_name: "Dinner", recipe: { name: "Lasagne", description: "Bake", image: "/local/lasagne.jpg" } }));
  const el = await mount(w, card([{ entity: "sensor.dinner", background: true }]), makeHass(states));
  const layer = q(el, ".backdrop img");
  assert.deepEqual([q(el, ".row .icon img").getAttribute("src"), layer.getAttribute("src"), layer.classList.contains("on")], ["http://ha.local/local/lasagne.jpg", "http://ha.local/local/lasagne.jpg", false]);
  layer.dispatchEvent(new w.Event("load"));
  await settle(el);
  assert.deepEqual([layer.classList.contains("on"), el.classList.contains("with-backdrop")], [true, true], "it fades in once it has loaded");
});

test("a tap opens the list, or the one thing on show, and an icon opens its entry", async () => {
  const w = makeWindow();
  const el = await mount(w, card(Object.keys(doors())), makeHass(doors()));
  const sent = actionsOf(el);
  q(el, ".head").click();
  await settle(el);
  assert.equal(q(el, "ha-card").classList.contains("open"), true);
  q(el, ".row .icon").click();
  same(sent, [{ config: { entity: "binary_sensor.door", tap_action: { action: "more-info" } }, action: "tap" }]);
  const one = await mount(w, card(["binary_sensor.door"]), makeHass(doors()));
  const opened = actionsOf(one);
  q(one, ".head").click();
  await settle(one);
  assert.deepEqual([opened.map((a) => a.config.entity), q(one, "ha-card").classList.contains("open")], [["binary_sensor.door"], false]);
  const inert = await mount(w, card([{ entity: "binary_sensor.door", tap_action: { action: "none" } }]), makeHass(doors()));
  assert.deepEqual([q(inert, ".head").getAttribute("aria-disabled"), q(inert, "ha-card").classList.contains("tappable")], ["true", false]);
});

test("an info taps, holds and double taps like a tile", async () => {
  const w = makeWindow({ clock: true });
  const states = statesOf(st("sun.sun", "below_horizon", { friendly_name: "Sun" }));
  const hold = { action: "navigate", navigation_path: "/sun" };
  const el = await mount(w, card([], { infos: [{ entity: "sun.sun", hold_action: hold, double_tap_action: { action: "toggle" } }] }), makeHass(states));
  const got = actionsOf(el);
  const h = q(el, ".head");
  h.click();
  assert.deepEqual(got, [], "a tap waits for a second one");
  await tick(el, 250);
  same(got.map((g) => [g.action, g.config.tap_action]), [["tap", { action: "more-info" }]]);
  got.length = 0;
  h.click();
  h.click();
  await tick(el, 250);
  assert.deepEqual(got.map((g) => g.action), ["double_tap"]);
  got.length = 0;
  const pointer = (type) => h.dispatchEvent(new w.PointerEvent(type, { pointerId: 1, isPrimary: true, pointerType: "touch", clientX: 10, clientY: 10, bubbles: true }));
  pointer("pointerdown");
  await tick(el, 500);
  pointer("pointerup");
  h.click();
  await tick(el, 250);
  same(got.map((g) => [g.action, g.config.hold_action]), [["hold", hold]], "a hold, and no tap after it");
});

test("a dismissal hides an entry in every card of this browser until it changes", async () => {
  const w = makeWindow();
  const states = { ...doors(), ...statesOf(st("sensor.bins", "1", { friendly_name: "Bins", next: { name: "Paper", description: "Tonight" } })) };
  const config = card(Object.keys(states));
  const a = await mount(w, config, makeHass(states));
  const b = await mount(w, config, makeHass(states));
  q(a, ".head").click();
  await settle(a);
  const x = [...a.shadowRoot.querySelectorAll(".row")].find((r) => r.querySelector(".title").textContent === "Door").querySelector(".dismiss");
  x.focus();
  x.click();
  await settle(a);
  await settle(b);
  assert.deepEqual([titles(a), titles(b)], [["Garage", "Gate", "Paper"], ["Garage", "Gate", "Paper"]]);
  assert.equal(a.shadowRoot.activeElement?.closest(".row").querySelector(".title").textContent, "Garage", "keyboard focus moves to the next row");
  a.hass = makeHass({ ...states, ...statesOf(on("binary_sensor.door", "Door", {}, at(0))) });
  await settle(a);
  assert.equal(titles(a)[0], "Door", "back when it happens again");
  const bins = (next) => makeHass(statesOf(st("sensor.bins", "1", { friendly_name: "Bins", next })));
  const once = await mount(w, card(["sensor.bins"]), bins({ name: "Paper", description: "Tonight" }));
  q(once, ".dismiss").click();
  once.hass = bins({ name: "Paper", description: "Tonight" });
  await settle(once);
  assert.equal(rows(once).length, 0, "a thing without a time stays away");
  once.hass = bins(null);
  once.hass = bins({ name: "Paper", description: "Tonight" });
  await settle(once);
  assert.equal(rows(once).length, 1, "until its attribute was empty");
});

test("Home Assistant confirms a dismissal later, clear all dismisses everything, and blocked storage still dismisses", async () => {
  const w = makeWindow();
  w.console.warn = () => {};
  const subs = [];
  const answers = [];
  const hass = makeHass(doors(), { subs });
  hass.callService = () => new Promise((resolve, reject) => answers.push({ resolve, reject }));
  const el = await mount(w, card([]), hass);
  const note = (id) => ({ notification_id: id, title: "Backup " + id, message: "done" });
  notifications(subs[0], note("n1"), note("n2"));
  await settle(el);
  q(el, ".dismiss").click();
  await settle(el);
  assert.deepEqual([rows(el).length, answers.length], [1, 1], "gone before Home Assistant answers");
  answers[0].reject(new Error("refused"));
  await settle(el);
  assert.equal(rows(el).length, 2, "back when Home Assistant refuses");
  q(el, ".dismiss").click();
  answers[1].resolve();
  await settle(el);
  assert.equal(rows(el).length, 1, "still away once confirmed");
  const calls = [];
  const full = await mount(w, card(Object.keys(doors())), makeHass(doors(), { subs, calls }));
  notifications(subs.filter((s) => s.msg?.type === "persistent_notification/subscribe").at(-1), note("a"));
  await settle(full);
  q(full, ".clear").click();
  await settle(full);
  assert.deepEqual([rows(full).length, calls.length, Object.keys(JSON.parse(w.localStorage.getItem("origami-notifications-ack"))).length >= 3], [0, 1, true], "clear all dismisses every entry");
  const blocked = makeWindow();
  blocked.Storage.prototype.setItem = () => {
    throw new blocked.DOMException("blocked", "QuotaExceededError");
  };
  const page = await mount(blocked, card(["binary_sensor.door"]), makeHass(doors()));
  q(page, ".dismiss").click();
  page.hass = makeHass(doors());
  await settle(page);
  assert.equal(rows(page).length, 0, "a dismissal holds where storage is blocked");
});

test("the closed card turns through what needs attention, and critical entries hold it alone", async () => {
  const w = makeWindow({ clock: true });
  const el = await mount(w, card(Object.keys(doors())), makeHass(doors()));
  const seen = [head(el).title];
  for (let i = 0; i < 3; i++) {
    await tick(el, 8000);
    seen.push(head(el).title);
  }
  assert.deepEqual([seen, head(el).badge], [["Door", "Garage", "Gate", "Door"], "3"]);
  const smoke = statesOf(on("binary_sensor.smoke", "Smoke", { device_class: "smoke" }, at(0)));
  el.setConfig({ type: "x", ...card([...Object.keys(doors()), "binary_sensor.smoke"]) });
  el.hass = makeHass({ ...doors(), ...smoke });
  await tick(el, 60000);
  assert.deepEqual([head(el).title, head(el).badge], ["Smoke", "4"]);
  const still = await mount(w, card(Object.keys(doors()), { rotate: 0 }), makeHass(doors()));
  await tick(still, 60000);
  assert.equal(head(still).title, "Door", "with rotate 0 it holds still");
});

test("a swipe or an arrow key turns the card by hand, and the turns go on from there", async () => {
  const w = makeWindow({ clock: true });
  const el = await mount(w, card(Object.keys(doors())), makeHass(doors()));
  const h = q(el, ".head");
  const pointer = (type, x, y = 10) => h.dispatchEvent(new w.PointerEvent(type, { pointerId: 7, isPrimary: true, pointerType: "touch", clientX: x, clientY: y, bubbles: true }));
  const swipe = (from, to) => ["pointerdown", "pointermove", "pointerup"].forEach((type, i) => pointer(type, i ? to : from));
  swipe(200, 120);
  h.click();
  await settle(el);
  assert.deepEqual([head(el).title, q(el, "ha-card").classList.contains("open")], ["Garage", false], "a swipe to the left shows the next");
  key(el, "ArrowLeft");
  key(el, "ArrowLeft");
  await settle(el);
  assert.equal(head(el).title, "Gate", "an arrow key turns it, around the end");
  el.setConfig({ type: "x", ...card(Object.keys(doors())) });
  el.hass = makeHass(doors());
  await tick(el, 7000);
  assert.equal(head(el).title, "Gate", "a new config keeps the entry on show, and the next turn waits its full time");
  await tick(el, 1000);
  assert.equal(head(el).title, "Door");
});

test("the turns wait while the card is pressed, focused by keyboard, open or out of sight", async () => {
  const w = makeWindow({ clock: true });
  const el = await mount(w, card(Object.keys(doors())), makeHass(doors()));
  const h = q(el, ".head");
  h.matches = (s) => s === ":focus-visible";
  h.dispatchEvent(new w.FocusEvent("focusin", { bubbles: true }));
  await tick(el, 30000);
  assert.equal(head(el).title, "Door", "keyboard focus holds it");
  h.dispatchEvent(new w.FocusEvent("focusout", { bubbles: true }));
  el.show(false);
  await tick(el, 30000);
  assert.equal(head(el).title, "Door", "out of sight nothing turns");
  el.show(true);
  h.click();
  await tick(el, 30000);
  assert.equal(head(el).title, "Door", "nor while the list is open");
  q(el, ".bar").click();
  for (let i = 0; i < 7; i++) {
    await tick(el, 1000);
    el.hass = makeHass({ ...doors(), ...statesOf({ ...on("binary_sensor.door", "Door", {}, at(-1)), last_updated: new Date().toISOString() }) });
  }
  await tick(el, 1000);
  assert.equal(head(el).title, "Garage", "new states do not push the next turn back");
});

test("news comes forward and is read out, and what was there before is not news", async () => {
  const w = makeWindow({ clock: true });
  const subs = [];
  const el = await mount(w, card([...Object.keys(doors()), "binary_sensor.smoke"]), makeHass(doors(), { subs }));
  const say = () => q(el, ".say").textContent;
  notifications(subs[0], { notification_id: "n1", title: "Backup", message: "done", created_at: "2026-09-21T09:00:00+00:00" });
  await settle(el);
  assert.deepEqual([say(), head(el).title], ["", "Door"], "notifications from before the page loaded are not news");
  el.hass = makeHass({ ...doors(), ...statesOf(on("binary_sensor.smoke", "Smoke", { device_class: "smoke" }, at(0))) }, { subs });
  await settle(el);
  assert.deepEqual([say(), head(el).title], ["Smoke. on", "Smoke"]);
  el.hass = makeHass(doors(), { subs });
  await settle(el);
  assert.deepEqual([say(), head(el).title], ["Smoke. on", "Door"], "what it held back is not news when it ends");
});

test("the clock runs while a time on show can change, and stops out of sight", async () => {
  const w = makeWindow({ clock: true });
  const states = statesOf(st("timer.kitchen", "active", { friendly_name: "Kitchen", finishes_at: at(5) }), on("binary_sensor.door", "Door", {}, at(-5)));
  const el = await mount(w, card(["timer.kitchen"]), makeHass(states));
  assert.deepEqual([head(el).secondary, q(el, ".head .secondary").getAttribute("aria-live")], ["5:00", "off"]);
  await tick(el, 1000);
  assert.equal(head(el).secondary, "4:59", "a countdown by the second");
  const door = await mount(w, card(["binary_sensor.door"]), makeHass(states));
  q(door, ".head").dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  q(door, ".bar").click();
  door.shadowRoot.querySelector(".bar").focus();
  await settle(door);
  const when = () => q(door, ".row .time").textContent;
  key(door, "x");
  door.show(false);
  await tick(door, 120000);
  assert.equal(when(), "5 min. ago", "nothing changes out of sight");
  door.show(true);
  await settle(door);
  assert.equal(when(), "7 min. ago", "and it catches up back in sight");
});

test("a narrow card opens its list in Home Assistant's dialog", async () => {
  const w = makeWindow({ clock: true, define: ["ha-icon-button", "ha-adaptive-dialog"] });
  let dialog = null;
  w.addEventListener("show-dialog", (e) => {
    dialog ||= w.document.createElement(e.detail.dialogTag);
    if (!dialog.isConnected) w.document.body.append(dialog);
    dialog.showDialog(e.detail.dialogParams);
  });
  const el = await mount(w, card(Object.keys(doors())), makeHass(doors()));
  q(el, "ha-card").resize(180);
  await settle(el);
  q(el, ".head").click();
  await settle(dialog);
  const shown = () => [...dialog.shadowRoot.querySelectorAll(".row .title")].map((t) => t.textContent);
  const inner = dialog.shadowRoot.querySelector("ha-adaptive-dialog");
  assert.deepEqual([q(el, ".head").getAttribute("aria-haspopup"), inner.getAttribute("header-title"), shown()], ["dialog", "3 notifications", ["Door", "Garage", "Gate"]]);
  const behind = head(el).title;
  await tick(el, 20000);
  assert.equal(head(el).title, behind, "the card behind the dialog holds still");
  dialog.shadowRoot.querySelector(".dismiss").click();
  await settle(el);
  await settle(dialog);
  assert.deepEqual(shown(), ["Garage", "Gate"], "a dismissal reaches it at once");
  const closed = [];
  dialog.addEventListener("dialog-closed", (e) => closed.push(e.detail.dialog));
  dialog.closeDialog();
  await settle(dialog);
  assert.deepEqual([closed, dialog.shadowRoot.querySelector("ha-adaptive-dialog")], [["origami-notifications-dialog"], null]);
});

test("vertical puts the icon above the text, and the card sizes itself like a tile", async () => {
  const w = makeWindow();
  const el = await mount(w, card([], { hide_when_empty: false, vertical: true }), makeHass({}));
  same([el.classList.contains("vertical"), el.getGridOptions(), el.getCardSize()], [true, { columns: 12, rows: "auto", min_columns: 3 }, 2]);
  el.setConfig({ type: "x", hide_when_empty: false, grid_options: { rows: 2 } });
  assert.deepEqual([el.classList.contains("vertical"), el.classList.contains("bounded"), el.getGridOptions().min_columns, el.getCardSize()], [false, true, 6, 1]);
});

test("your css goes after the card's own", async () => {
  const w = makeWindow();
  const css = ".row { border: 1px solid red; }";
  const el = await mount(w, card([], { hide_when_empty: false, css }), makeHass({}));
  assert.equal([...el.shadowRoot.querySelectorAll("style")].pop().textContent, css);
});

test("the card subscribes only to what it shows, ends every subscription when it leaves, and ignores the rest of the house", async () => {
  const w = makeWindow();
  const subs = [];
  const states = { ...doors(), ...statesOf(st("todo.shopping", "1", { friendly_name: "Shopping" }), st("weather.home", "cloudy", { supported_features: 2 }), st("light.far", "on")) };
  const hass = makeHass(states, { subs });
  const el = await mount(w, card(["binary_sensor.door", { entity: "todo.shopping", type: "todo" }], { weather: "weather.home", repairs: true }), hass);
  assert.deepEqual(subs.map((s) => s.msg?.type || s.event).sort(), ["persistent_notification/subscribe", "repairs_issue_registry_updated", "todo/item/subscribe", "weather/subscribe_forecast"]);
  let renders = 0;
  const update = el.update.bind(el);
  el.update = (changed) => (renders++, update(changed));
  el.hass = { ...hass, states: { ...states, "light.far": st("light.far", "off") } };
  await settle(el);
  assert.deepEqual([renders, subs.length], [0, 4], "a state the card does not read changes nothing");
  el.remove();
  await settle();
  assert.deepEqual(subs.map((s) => Boolean(s.closed)), [true, true, true, true]);
});

test("a to-do item and the weather ahead come from their subscriptions", async () => {
  const w = makeWindow({ clock: true });
  const subs = [];
  const states = statesOf(st("todo.shopping", "1", { friendly_name: "Shopping", supported_features: 4 }), st("weather.home", "cloudy", { temperature: 12, supported_features: 2 }));
  const el = await mount(w, card([{ entity: "todo.shopping", type: "todo" }], { weather: "weather.home" }), makeHass(states, { subs }));
  const of = (type) => subs.find((s) => s.msg?.type === type);
  of("todo/item/subscribe").cb({ items: [{ uid: "1", summary: "Milk", status: "needs_action", due: "2026-10-02" }] });
  of("weather/subscribe_forecast").cb({ forecast: [{ datetime: at(0), condition: "cloudy" }, { datetime: at(60), condition: "rainy", precipitation_probability: 80 }] });
  await settle(el);
  assert.deepEqual(rows(el), [
    { title: "Rain from 1 PM", message: "80% chance" },
    { title: "Milk", message: "Shopping" },
  ]);
  const sent = actionsOf(el);
  [...el.shadowRoot.querySelectorAll(".action")].pop().click();
  same(sent[0].config.tap_action, { action: "perform-action", perform_action: "todo.update_item", target: { entity_id: "todo.shopping" }, data: { item: "1", status: "completed" } });
});

test("an info uses Home Assistant's state text once it is there", async () => {
  const w = makeWindow();
  const states = statesOf(st("weather.home", "rainy", { friendly_name: "Home", temperature: 14 }));
  const el = await mount(w, card([], { infos: [{ entity: "weather.home", name: "Weather", state_content: ["temperature", "state"] }] }), makeHass(states, { formatEntityAttributeValue: (s, a) => s.attributes[a] + " °C" }));
  assert.deepEqual(head(el), { title: "Weather", secondary: "14 °C · rainy", badge: "" });
  w.customElements.define("state-display", class extends w.HTMLElement {});
  await settle(el);
  const sd = q(el, ".head state-display");
  assert.deepEqual([sd.stateObj.entity_id, sd.content, sd.name], ["weather.home", ["temperature", "state"], "Weather"]);
});

test("the language follows the profile, and Home Assistant's words come first", async () => {
  const w = makeWindow();
  const de = await mount(w, card([], { hide_when_empty: false }), makeHass({}, { locale: { language: "de" } }));
  assert.deepEqual(head(de), { title: "Alles ruhig", secondary: "No notifications", badge: "" });
  const words = { "ui.notification_drawer.empty": "Aucune notification", "ui.card.lock.lock": "Verrouiller", "ui.card.persistent_notification.dismiss": "Ignorer" };
  const states = statesOf(st("lock.front", "unlocked", { friendly_name: "Front" }));
  const fr = await mount(w, card(["lock.front"]), makeHass(states, { locale: { language: "fr" }, localize: (k) => words[k] || "" }));
  assert.deepEqual([fr.shadowRoot.querySelector(".action").textContent, q(fr, ".dismiss").getAttribute("aria-label")], ["Verrouiller", "Ignorer"]);
});
