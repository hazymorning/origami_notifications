import { css, html, LitElement, nothing } from "lit";
import { DEFAULTS, FORECAST_TYPES, isObject, KINDS, parseBefore, parseConfig } from "./config.js";
import { DAY, fill, HOUR, MINUTE } from "./format.js";
import { isTimestampDomain } from "./ha.js";
import { KIND_ICONS, kindOf } from "./kinds.js";
import { entityName } from "./model.js";
import { editorTexts, languageOf } from "./strings.js";
import { forecastSupported } from "./weather.js";

const KEY_ORDER = ["entities", "label", "weather", "infos", "updates", "repairs", "hide_when_empty", "vertical", "rotate", "slide", "audience", "css"];
const ENTITY_KEYS = ["type", "attribute", "name", "icon", "image", "background", "before", "tap_action"];
const ENTITY_ORDER = ["entity", ...ENTITY_KEYS, "actions"];
const INFO_ORDER = ["entity", "name", "icon", "color", "show_entity_picture", "state_content", "time_format", "show_current", "show_forecast", "forecast_type", "forecast_slots", "tap_action", "hold_action", "double_tap_action", "visibility"];
const READS_ATTRIBUTE = ["attribute", "picture"];
const HAS_BEFORE = ["calendar", "todo"];

const isEmpty = (v) => v == null || v === "" || v === false || (Array.isArray(v) && !v.length) || (isObject(v) && !Object.keys(v).length);

const ordered = (obj, order) => Object.fromEntries([...new Set([...order, ...Object.keys(obj)])].filter((k) => k in obj).map((k) => [k, obj[k]]));

const ruleMode = (rule) => (!rule ? "everyone" : rule.only ? "only" : "except");

// Home Assistant's duration field reads parts. A bare number there would count as seconds.
const durationParts = (ms) => ({ days: Math.floor(ms / DAY), hours: Math.floor((ms % DAY) / HOUR), minutes: Math.floor((ms % HOUR) / MINUTE), seconds: (ms % MINUTE) / 1000 });

const forecastShow = (info) => (!info.forecast_type || info.show_forecast === false ? "show_current" : info.show_current === false ? "show_forecast" : "show_both");

export class OrigamiNotificationsEditor extends LitElement {
  static properties = { hass: { attribute: false }, _config: { state: true } };

  static styles = css`
    .infos {
      margin-top: 24px;
    }
    .content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
    }
    .intro {
      margin: 0;
      color: var(--secondary-text-color);
    }
  `;

  constructor() {
    super();
    this._memos = new Map();
  }

  setConfig(config) {
    parseConfig(config);
    this._config = config;
  }

  get _t() {
    return editorTexts(languageOf(this.hass), this.hass?.localize);
  }

  // A new schema or data object makes ha-form rebuild its fields, which loses the focus.
  _memo(key, value) {
    const json = JSON.stringify(value);
    const last = this._memos.get(key);
    if (last?.json === json) return last.value;
    this._memos.set(key, { json, value });
    return value;
  }

  _name(id) {
    const st = this.hass.states[id];
    return st ? entityName(this.hass)(st) : id;
  }

  _entries(config = this._config) {
    return (config.entities || []).map((e) => (typeof e === "string" ? { entity: e } : e));
  }

  _infos(config = this._config) {
    return (config.infos || []).map((info) => (typeof info === "string" ? { entity: info } : { ...info }));
  }

  _sources(config = this._config) {
    const t = this._t;
    const sources = [{ key: "system", name: t.label("system"), icon: KIND_ICONS.system }];
    if (config.updates !== false) sources.push({ key: "updates", name: t.label("updates"), icon: KIND_ICONS.update });
    if (config.repairs !== false) sources.push({ key: "repairs", name: t.label("repairs"), icon: KIND_ICONS.repair });
    if (config.weather) sources.push({ key: config.weather, name: this._name(config.weather), icon: KIND_ICONS.weather });
    const reg = this.hass.entities || {};
    const labelled = config.label ? Object.keys(reg).filter((id) => reg[id]?.labels?.includes(config.label)).map((entity) => ({ entity })) : [];
    for (const src of [...this._entries(config), ...labelled]) {
      if (sources.some((s) => s.key === src.entity)) continue;
      sources.push({ key: src.entity, name: src.name || this._name(src.entity), icon: src.icon || KIND_ICONS[this._kind(src)] });
    }
    return sources;
  }

  _kind(src) {
    return kindOf(src, this.hass.states[src.entity], this.hass);
  }

  _summary(rule) {
    const t = this._t;
    const mode = ruleMode(rule);
    if (mode === "everyone") return t.label("everyone");
    const names = rule[mode].map((id) => this._name(id)).join(", ");
    if (!names) return t.label(mode === "only" ? "nobody" : "everyone");
    return fill(t.label(mode + "_x"), { x: names });
  }

  _schema(sources) {
    const t = this._t;
    const audience = this._config.audience || {};
    const entries = this._entries();
    const choices = (values, label = (v) => t.label(v)) => values.map((value) => ({ value, label: label(value) }));
    return [
      { name: "entities", selector: { entity: { multiple: true } } },
      { name: "label", selector: { label: {} } },
      { name: "weather", selector: { entity: { filter: { domain: "weather" } } } },
      { name: "infos", selector: { entity: { multiple: true, reorder: true } } },
      { name: "", type: "grid", schema: [{ name: "updates", selector: { boolean: {} } }, { name: "repairs", selector: { boolean: {} } }] },
      { name: "hide_when_empty", selector: { boolean: {} } },
      {
        name: "content_layout",
        selector: {
          select: {
            mode: "box",
            options: ["horizontal", "vertical"].map((value) => ({
              value,
              label: t.label(value),
              image: { src: `/static/images/form/tile_content_layout_${value}.svg`, src_dark: `/static/images/form/tile_content_layout_${value}_dark.svg`, flip_rtl: true },
            })),
          },
        },
      },
      {
        name: "",
        type: "grid",
        schema: [
          { name: "rotate", selector: { number: { min: 0, max: 60, step: 1, mode: "box", unit_of_measurement: "s" } } },
          { name: "slide", selector: { select: { mode: "dropdown", options: choices(["up", "side"], (v) => t.label("slide_" + v)) } } },
        ],
      },
      ...(entries.length
        ? [
            {
              name: "options",
              type: "expandable",
              title: t.label("options"),
              icon: "mdi:tune-variant",
              schema: entries.map((e) => {
                const kind = this._kind(e);
                return {
                  name: e.entity,
                  type: "expandable",
                  title: e.name || this._name(e.entity),
                  icon: e.icon || KIND_ICONS[kind],
                  schema: [
                    { name: "type", selector: { select: { mode: "dropdown", options: choices(["auto", ...KINDS], (v) => t.label("type_" + v)) } } },
                    ...(!e.type || READS_ATTRIBUTE.includes(e.type) ? [{ name: "attribute", helper: e.type === "picture" ? "attribute_picture" : "attribute", selector: { attribute: { entity_id: e.entity } } }] : []),
                    { name: "", type: "grid", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: { placeholder: KIND_ICONS[kind] } } }] },
                    { name: "image", selector: { text: {} } },
                    { name: "background", selector: { boolean: {} } },
                    ...(HAS_BEFORE.includes(kind) ? [{ name: "before", selector: { duration: { enable_day: true } } }] : []),
                    { name: "tap_action", selector: { ui_action: { default_action: "more-info" } } },
                  ],
                };
              }),
            },
          ]
        : []),
      {
        name: "audience",
        type: "expandable",
        title: t.label("audience"),
        icon: "mdi:account-eye-outline",
        schema: sources.map((s) => ({
          name: s.key,
          type: "expandable",
          title: `${s.name} · ${this._summary(audience[s.key])}`,
          icon: s.icon,
          schema: [
            { name: "visible", selector: { select: { mode: "list", options: choices(["everyone", "only", "except"]) } } },
            ...(ruleMode(audience[s.key]) === "everyone" ? [] : [{ name: "people", selector: { entity: { multiple: true, filter: { domain: "person" } } } }]),
          ],
        })),
      },
      { name: "styling", type: "expandable", flatten: true, title: t.label("styling"), icon: "mdi:palette-outline", schema: [{ name: "css", selector: { text: { multiline: true } } }] },
    ];
  }

  _data(sources) {
    const config = this._config;
    const audience = config.audience || {};
    return {
      ...DEFAULTS,
      ...config,
      content_layout: config.vertical ? "vertical" : "horizontal",
      entities: this._entries().map((e) => e.entity),
      infos: this._infos().map((info) => info.entity),
      options: Object.fromEntries(
        this._entries().map((e) => [e.entity, { ...e, type: e.type || "auto", background: Boolean(e.background), before: e.before == null ? undefined : durationParts(parseBefore(e.before)) }])
      ),
      audience: Object.fromEntries(sources.map((s) => [s.key, { visible: ruleMode(audience[s.key]), people: audience[s.key]?.only || audience[s.key]?.except || [] }])),
    };
  }

  _mergeEntities(ids, options = {}) {
    const entries = this._entries();
    const before = new Map(entries.map((e) => [e.entity, e]));
    const changed = ids.map((id, i) => (entries[i] && id !== entries[i].entity ? i : -1)).filter((i) => i >= 0);
    const swap = ids.length === entries.length && changed.length === 1 && !before.has(ids[changed[0]]) ? changed[0] : -1;
    this._swapped = swap < 0 ? null : [entries[swap].entity, ids[swap]];
    return ids.map((id, i) => {
      const base = before.get(id) || (i === swap ? entries[i] : {});
      const merged = { ...base, entity: id };
      const option = options[id] || {};
      for (const key of ENTITY_KEYS) {
        if (!(key in option)) continue;
        const v = option[key];
        if (key === "before" && parseBefore(v) === parseBefore(base.before)) continue;
        if (isEmpty(v) || (key === "type" && v === "auto") || (key === "before" && !parseBefore(v))) delete merged[key];
        else merged[key] = v;
      }
      if (merged.type && !READS_ATTRIBUTE.includes(merged.type)) delete merged.attribute;
      return Object.keys(merged).length === 1 ? id : ordered(merged, ENTITY_ORDER);
    });
  }

  _onChange(e) {
    e.stopPropagation();
    const { content_layout: layout, options, ...value } = e.detail.value;
    if (layout) value.vertical = layout === "vertical";
    const before = this._sources().map((s) => s.key);
    this._swapped = null;
    if (Array.isArray(value.entities)) value.entities = this._mergeEntities(value.entities, options);
    if (Array.isArray(value.infos)) value.infos = this._mergeInfos(value.infos);
    const audience = { ...this._config.audience };
    for (const [key, v] of Object.entries(value.audience || {})) {
      if (v.visible === "only" || v.visible === "except") audience[key] = { [v.visible]: v.people || [] };
      else delete audience[key];
    }
    for (const [from, to] of [this._swapped || [], [this._config.weather, value.weather]]) {
      if (from && to && audience[from] && !audience[to]) audience[to] = audience[from];
    }
    // Rules for updates stay, since the card finds updates on its own.
    const after = new Set(this._sources({ ...this._config, ...value }).map((s) => s.key));
    for (const key of before) if (!after.has(key) && key !== "updates" && !key.startsWith("update.")) delete audience[key];
    value.audience = audience;
    this._write(value);
  }

  _write(value) {
    const merged = { ...this._config, ...value };
    const config = { type: this._config.type };
    for (const [k, v] of Object.entries(ordered(merged, KEY_ORDER))) {
      if (k === "type" || (isEmpty(v) && v !== false)) continue;
      if (k in DEFAULTS && v === DEFAULTS[k]) continue;
      config[k] = v;
    }
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }

  _mergeInfos(ids) {
    const before = this._infos();
    const used = new Set();
    const take = (i) => (i >= 0 && !used.has(i) ? (used.add(i), before[i]) : null);
    return ids.map((id, i) => {
      const base = take(before.findIndex((info, j) => info.entity === id && !used.has(j))) || (before.length === ids.length && !ids.includes(before[i].entity) && take(i)) || {};
      return this._infoEntry({ ...base, entity: id });
    });
  }

  _infoEntry(info) {
    const out = {};
    for (const [key, v] of Object.entries(ordered(info, INFO_ORDER))) {
      const keep = key === "show_current" || key === "show_forecast" ? v === false : !isEmpty(v) && !(key === "color" && v === "state");
      if (keep) out[key] = v;
    }
    return Object.keys(out).length === 1 ? out.entity : out;
  }

  _forecastTypes(info) {
    if (!info.entity.startsWith("weather.")) return [];
    const st = this.hass.states[info.entity];
    return FORECAST_TYPES.filter((type) => forecastSupported(st, type) || info.forecast_type === type);
  }

  _infoSchema(info) {
    const t = this._t;
    const st = this.hass.states[info.entity];
    const domain = info.entity.split(".")[0];
    const timed = [].concat(info.state_content ?? "state").some(
      (c) =>
        /^last[_-](changed|updated|triggered)$/.test(c) ||
        (domain === "sun" && c.startsWith("next_")) ||
        (domain === "calendar" && c.endsWith("_time")) ||
        (c === "state" && Boolean(st) && (st.attributes.device_class === "timestamp" || isTimestampDomain(domain)))
    );
    const context = { entity_id: "entity" };
    const forecasts = this._forecastTypes(info);
    const show = forecastShow(info);
    const select = (values) => ({ select: { mode: "dropdown", options: values.map((value) => ({ value, label: t.label(value) })) } });
    const state = [{ name: "state_content", selector: { ui_state_content: {} }, context: { filter_entity: "entity" } }, ...(timed ? [{ name: "time_format", selector: { ui_time_format: {} } }] : [])];
    const forecast = [
      { name: "forecast", selector: select(["show_both", "show_current", "show_forecast"]) },
      ...(show === "show_current" ? [] : [{ name: "forecast_type", selector: select(forecasts) }, { name: "forecast_slots", selector: { number: { min: 1, max: 12, mode: "box" } } }]),
      ...(show === "show_forecast" ? [] : state),
    ];
    return [
      { name: "name", selector: { entity_name: {} }, context: { entity: "entity" } },
      { name: "", type: "grid", schema: [{ name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } }, { name: "color", selector: { ui_color: { default_color: "state", include_state: true } } }] },
      ...(forecasts.length ? forecast : state),
      { name: "show_entity_picture", selector: { boolean: {} } },
      { name: "tap_action", selector: { ui_action: { default_action: "more-info" } }, context },
      { name: "", type: "optional_actions", flatten: true, schema: ["hold_action", "double_tap_action"].map((name) => ({ name, selector: { ui_action: { default_action: "none" } }, context })) },
    ];
  }

  _onInfo(e, index, value) {
    e.stopPropagation();
    const infos = this._infos();
    const { forecast: show, ...rest } = value;
    const info = { ...infos[index], ...rest, entity: infos[index].entity };
    const choice = "forecast" in value ? show || "show_current" : null;
    if (choice && choice !== forecastShow(infos[index])) {
      Object.assign(info, { show_current: choice === "show_forecast" ? false : undefined, show_forecast: undefined });
      info.forecast_type = choice === "show_current" ? undefined : info.forecast_type || this._forecastTypes(info)[0];
    }
    if (!info.forecast_type) for (const key of ["forecast_slots", "show_current", "show_forecast"]) delete info[key];
    infos[index] = info;
    this._write({ infos: infos.map((i) => this._infoEntry(i)) });
  }

  _infoPanel(info, index) {
    const t = this._t;
    const st = this.hass.states[info.entity];
    const forecasts = this._forecastTypes(info);
    const data = forecasts.length ? { ...info, forecast: forecastShow(info) } : info;
    const conditions = Array.isArray(info.visibility) ? info.visibility : [];
    return html`<ha-expansion-panel outlined .header=${info.name || this._name(info.entity)} .secondary=${forecasts.length && forecastShow(info) !== "show_current" ? t.label(info.forecast_type) : ""}>
      ${st && customElements.get("ha-state-icon")
        ? html`<ha-state-icon slot="leading-icon" .hass=${this.hass} .stateObj=${st} .icon=${info.icon}></ha-state-icon>`
        : html`<ha-icon slot="leading-icon" .icon=${info.icon || KIND_ICONS.generic}></ha-icon>`}
      <div class="content">
        <ha-form
          .hass=${this.hass}
          .data=${this._memo("info-data-" + index, data)}
          .schema=${this._memo("info-schema-" + index, this._infoSchema(info))}
          .computeLabel=${(s) => t.label(s.name)}
          @value-changed=${(e) => this._onInfo(e, index, e.detail.value)}
        ></ha-form>
        <ha-expansion-panel outlined .header=${t.label("visibility")}>
          <ha-icon slot="leading-icon" icon="mdi:eye"></ha-icon>
          <div class="content">
            <p class="intro">${t.helper("visibility_intro")}</p>
            <ha-card-conditions-editor
              .hass=${this.hass}
              .conditions=${this._memo("conditions-" + index, conditions)}
              @value-changed=${(e) => this._onInfo(e, index, { visibility: e.detail.value?.length ? e.detail.value : undefined })}
            ></ha-card-conditions-editor>
          </div>
        </ha-expansion-panel>
      </div>
    </ha-expansion-panel>`;
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    const t = this._t;
    const sources = this._sources();
    const infos = this._infos();
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._memo("data", this._data(sources))}
        .schema=${this._memo("schema", this._schema(sources))}
        .computeLabel=${(s) => t.label(s.name)}
        .computeHelper=${(s) => t.helper(s.helper || s.name)}
        @value-changed=${this._onChange}
      ></ha-form>
      ${infos.length
        ? html`<ha-expansion-panel class="infos" outlined .header=${t.label("info_options")}>
            <ha-icon slot="leading-icon" icon="mdi:information-outline"></ha-icon>
            <div class="content">${infos.map((info, i) => this._infoPanel(info, i))}</div>
          </ha-expansion-panel>`
        : nothing}
    `;
  }
}
