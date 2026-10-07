import { html, nothing } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { repeat } from "lit/directives/repeat.js";
import { canDismiss } from "./dismissals.js";
import { zonedParts } from "./format.js";
import { stateColor } from "./ha.js";
import { KIND_ICONS } from "./kinds.js";

const KIND_COLORS = { system: "var(--info-color)", repair: "var(--warning-color)" };

// Urgency colors an entry first, then its own color, then its entity's state, like a tile.
export function entryColor(entry) {
  if (entry.sev === "crit") return "var(--error-color)";
  if (entry.sev === "warn") return "var(--warning-color)";
  return entry.color || (entry.stateObj ? stateColor(entry.stateObj) : KIND_COLORS[entry.kind] || "var(--state-icon-color)");
}

// What a tap on an entry does. Without an action of its own, it opens its entity.
export function opener(entry) {
  if (entry.inert) return null;
  return entry.tap || (entry.entity ? { entity: entry.entity, tap_action: { action: "more-info" } } : null);
}

export function imageUrl(hass, path) {
  if (!path) return null;
  try {
    return hass.hassUrl(path);
  } catch {
    return null;
  }
}

const fallbackIcon = (entry, hass) =>
  entry.icon || hass.entities?.[entry.stateObj?.entity_id]?.icon || entry.stateObj?.attributes.icon || KIND_ICONS[entry.kind] || KIND_ICONS.generic;

export function iconTemplate(entry, hass) {
  const url = imageUrl(hass, entry.image);
  return html`${url
    ? html`<img
        src=${url}
        alt=""
        decoding="async"
        draggable="false"
        referrerpolicy="no-referrer"
        @load=${(e) => e.target.classList.add("ready")}
        @error=${(e) => e.target.classList.remove("ready")}
      />`
    : nothing}${entry.stateObj && customElements.get("ha-state-icon")
    ? html`<ha-state-icon .hass=${hass} .stateObj=${entry.stateObj} .icon=${entry.icon}></ha-state-icon>`
    : html`<ha-icon .icon=${fallbackIcon(entry, hass)}></ha-icon>`}`;
}

function timeTemplate(entry, view) {
  if (!Number.isFinite(entry.ts)) return html`<time class="time"></time>`;
  const p = entry.day && zonedParts(entry.ts, view.clock.server);
  const datetime = p ? [p.year, p.month, p.day].map((n) => String(n).padStart(2, "0")).join("-") : new Date(entry.ts).toISOString();
  const title = p ? view.clock.absoluteDate(entry.ts, view.clock.server) : view.clock.absolute(entry.ts);
  return html`<time class="time" datetime=${datetime} title=${title}>${view.clock.entryTime(entry, view.now)}</time>`;
}

const clamped = (row) => [".message", ".title"].some((s) => {
  const el = row.querySelector(s);
  return el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
});

const selecting = (root) => {
  const selection = root.getSelection?.() || document.getSelection();
  return Boolean(selection && !selection.isCollapsed && String(selection).trim());
};

const keys = (run) => (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  e.stopPropagation();
  run();
};

// view holds hass, texts, clock, now, the set of opened rows and the hooks run, toggle and dismiss.
function rowTemplate(entry, view) {
  const link = opener(entry);
  const open = () => link && view.run(link);
  const onClick = (e) => {
    const row = e.currentTarget;
    if (selecting(row.getRootNode())) return;
    if (row.classList.contains("open") || clamped(row)) view.toggle(entry.key);
    else open();
  };
  const timeAside = Boolean(entry.message) || !Number.isFinite(entry.ts);
  return html`<div class=${classMap({ item: true, leaving: Boolean(entry.leaving) })} role="listitem" data-key=${entry.key}><div class="clip">
    <div
      class="row ${classMap({ warn: entry.sev === "warn", crit: entry.sev === "crit", link: Boolean(link), open: view.opened.has(entry.key) })}"
      data-kind=${entry.kind}
      style="--tile-color: ${entryColor(entry)}"
      @click=${onClick}
      @pointerenter=${(e) => e.currentTarget.classList.toggle("expandable", clamped(e.currentTarget))}
    >
      <div
        class="icon"
        role=${link ? "button" : nothing}
        tabindex=${link ? "0" : nothing}
        aria-label=${link ? entry.title : nothing}
        @click=${(e) => link && (e.stopPropagation(), open())}
        @keydown=${link ? keys(open) : nothing}
      >
        ${iconTemplate(entry, view.hass)}
      </div>
      <div class="title">${entry.title}</div>
      <div class="meta">
        ${timeAside ? timeTemplate(entry, view) : nothing}
        ${canDismiss(entry)
          ? html`<button class="dismiss" type="button" aria-label=${view.texts.dismiss} title=${view.texts.dismiss} @click=${(e) => (e.stopPropagation(), view.dismiss(entry, e.detail === 0))}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>`
          : nothing}
      </div>
      <div class="message">${entry.message || (timeAside ? "" : timeTemplate(entry, view))}</div>
      ${entry.actions?.length
        ? html`<div class="actions">
            ${entry.actions.map(
              (a) => html`<button class="action" type="button" ?disabled=${a.disabled} @click=${(e) => (e.stopPropagation(), view.run(a.action))}>${a.label}</button>`
            )}
          </div>`
        : nothing}
    </div>
  </div></div>`;
}

export const rowsTemplate = (entries, view) => repeat(entries, (entry) => entry.key, (entry) => rowTemplate(entry, view));
