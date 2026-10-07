import assert from "node:assert/strict";
import { test } from "node:test";
import { makeHass, makeWindow, same, settle, st, statesOf } from "./helpers.js";

const TYPE = "custom:origami-notifications";

// The editor on a config, and every config it writes.
async function editor(w, config, hass = makeHass({})) {
  const ed = w.document.createElement("origami-notifications-editor");
  const written = [];
  ed.addEventListener("config-changed", (e) => written.push(JSON.parse(JSON.stringify(e.detail.config))));
  ed.setConfig({ type: TYPE, ...config });
  ed.hass = hass;
  w.document.body.append(ed);
  await settle(ed);
  const forms = () => [...ed.shadowRoot.querySelectorAll("ha-form")];
  // Sends what a form or a conditions editor would send.
  const send = async (target, change) => {
    const value = typeof change === "function" ? change(JSON.parse(JSON.stringify(target.data))) : change;
    target.dispatchEvent(new w.CustomEvent("value-changed", { detail: { value }, bubbles: true, composed: true }));
    await settle(ed);
    return written.at(-1);
  };
  const within = (panel) => () => [...ed.shadowRoot.querySelectorAll(`.${panel} ha-form`)];
  return { ed, written, form: () => forms()[0], entityForms: within("entities"), infoForms: within("infos"), send };
}

test("the editor offers every option, with entity options and a rule for each source", async () => {
  const w = makeWindow();
  const { form, entityForms } = await editor(w, { entities: ["calendar.family"] }, makeHass(statesOf(st("calendar.family", "off", { friendly_name: "Family" }))));
  const schema = form().schema;
  same(schema.map((s) => s.name || s.type), ["entities", "label", "weather", "infos", "grid", "hide_when_empty", "content_layout", "grid", "audience", "styling"]);
  same(entityForms()[0].schema.map((s) => s.name || s.type), ["type", "attribute", "grid", "color", "image", "background", "before", "tap_action"]);
  assert.match(entityForms()[0].computeHelper(entityForms()[0].schema.at(-1)), /closed card opens the list/, "the tap behavior says it is about the row");
  same(schema.find((s) => s.name === "audience").schema.map((s) => s.name), ["system", "updates", "repairs", "calendar.family"]);
  same(schema.find((s) => s.name === "content_layout").selector.select.options.map((o) => o.image.src.split("/").pop()), ["tile_content_layout_horizontal.svg", "tile_content_layout_vertical.svg"]);
});

test("the editor writes only what differs from the defaults, and keeps what only YAML can set", async () => {
  const w = makeWindow();
  const hass = makeHass(statesOf(st("sensor.dinner", "Lasagne", { friendly_name: "Dinner", recipe: { name: "Lasagne" } })));
  const { ed, form, entityForms, send } = await editor(w, { entities: [{ entity: "sensor.dinner", actions: [{ label: "Cook", tap_action: { action: "toggle" } }] }] }, hass);
  await send(entityForms()[0], (v) => ({ ...v, background: true, name: "", color: "state" }));
  await send(ed.shadowRoot.querySelector(".entities ha-card-conditions-editor"), [{ condition: "numeric_state", above: 28 }]);
  const written = await send(form(), (v) => ({ ...v, content_layout: "vertical", rotate: 0, css: "" }));
  same(written, { type: TYPE, entities: [{ entity: "sensor.dinner", background: true, visibility: [{ condition: "numeric_state", above: 28 }], actions: [{ label: "Cook", tap_action: { action: "toggle" } }] }], vertical: true, rotate: 0 });
  same(Object.keys(await send(form(), (v) => ({ ...v, content_layout: "horizontal", rotate: 8, entities: [] }))), ["type"], "defaults are left out");
});

test("a swapped entity keeps its options and its rule, and a rule leaves with its entity", async () => {
  const w = makeWindow();
  const hass = makeHass(statesOf(st("person.anna", "home", { user_id: "u1" })));
  const only = { only: ["person.anna"] };
  const door = { entity: "binary_sensor.door", icon: "mdi:door" };
  const swap = await editor(w, { entities: [door], audience: { "binary_sensor.door": only } }, hass);
  same(await swap.send(swap.form(), (v) => ({ ...v, entities: ["binary_sensor.door_2"] })), { type: TYPE, entities: [{ ...door, entity: "binary_sensor.door_2" }], audience: { "binary_sensor.door_2": only } });
  const leave = await editor(w, { entities: ["binary_sensor.door", "update.nas"], audience: { "binary_sensor.door": only, "update.nas": only } }, hass);
  same((await leave.send(leave.form(), (v) => ({ ...v, entities: [] }))).audience, { "update.nas": only }, "a rule for an update stays, since updates are found anyway");
  const weather = await editor(w, { weather: "weather.home", audience: { "weather.home": only } }, hass);
  same(await weather.send(weather.form(), (v) => ({ ...v, weather: "weather.office" })), { type: TYPE, weather: "weather.office", audience: { "weather.office": only } });
});

test("a rule is chosen per source as everyone, only or except", async () => {
  const w = makeWindow();
  const { form, send } = await editor(w, {});
  const written = await send(form(), (v) => ({ ...v, audience: { ...v.audience, system: { visible: "except", people: ["person.kid"] } } }));
  same(written.audience, { system: { except: ["person.kid"] } });
});

test("each info is edited with the fields of a tile and Home Assistant's visibility editor", async () => {
  const w = makeWindow({ define: ["ha-state-icon"] });
  const hass = makeHass(statesOf(st("sun.sun", "above_horizon"), st("sensor.energy", "4.2"), st("weather.home", "rainy")));
  const weather = { entity: "weather.home", name: "Weather", icon: "mdi:umbrella" };
  const { ed, form, infoForms, send } = await editor(w, { infos: ["sun.sun", weather] }, hass);
  same(infoForms().map((f) => f.schema.map((s) => s.name || s.type)), Array(2).fill(["name", "grid", "state_content", "show_entity_picture", "tap_action", "optional_actions"]));
  same((await send(infoForms()[0], { entity: "sun.sun", state_content: "next_rising", color: "state", name: "" })).infos, [{ entity: "sun.sun", state_content: "next_rising" }, weather], "only what is set is written");
  const conditions = ed.shadowRoot.querySelectorAll(".infos ha-card-conditions-editor")[1];
  same((await send(conditions, [{ condition: "user", users: ["u1"] }])).infos[1].visibility, [{ condition: "user", users: ["u1"] }]);
  await send(form(), (v) => ({ ...v, infos: ["sun.sun", "sensor.energy"] }));
  same((await send(form(), (v) => ({ ...v, infos: ["sensor.energy", "sun.sun"] }))).infos, [{ ...weather, entity: "sensor.energy", visibility: [{ condition: "user", users: ["u1"] }] }, { entity: "sun.sun", state_content: "next_rising" }], "a swapped or moved info keeps its options");
});

test("a weather info shows the current weather, its forecast or both, as on Home Assistant's forecast card", async () => {
  const w = makeWindow();
  const hass = makeHass(statesOf(st("weather.home", "rainy", { friendly_name: "Home", supported_features: 3 })));
  const { infoForms, send } = await editor(w, { infos: ["weather.home"] }, hass);
  const names = () => infoForms()[0].schema.map((s) => s.name || s.type);
  same([names(), infoForms()[0].data.forecast], [["name", "grid", "forecast", "state_content", "show_entity_picture", "tap_action", "optional_actions"], "show_current"]);
  same((await send(infoForms()[0], (v) => ({ ...v, forecast: "show_forecast" }))).infos, [{ entity: "weather.home", show_current: false, forecast_type: "daily" }]);
  same(names().slice(2, 5), ["forecast", "forecast_type", "forecast_slots"]);
  same((await send(infoForms()[0], (v) => ({ ...v, forecast: "show_both" }))).infos, [{ entity: "weather.home", forecast_type: "daily" }]);
  same((await send(infoForms()[0], (v) => ({ ...v, forecast: "show_current" }))).infos, ["weather.home"]);
});

test("the editor speaks the profile's language and keeps a broken config in the code editor", async () => {
  const w = makeWindow();
  const { form } = await editor(w, {}, makeHass({}, { locale: { language: "de" } }));
  assert.deepEqual([form().computeLabel({ name: "hide_when_empty" }), form().computeHelper({ name: "css" })], ["Ausblenden, wenn nichts anliegt", "Kommt nach den Styles der Karte, so lässt sich jeder Teil ändern."]);
  assert.throws(() => w.document.createElement("origami-notifications-editor").setConfig({ type: TYPE, entities: [{ name: "Washer" }] }), /entities must contain entity ids/);
});
