import { css, html, LitElement, nothing } from "lit";
import { fire } from "./card.js";
import { ListMotion } from "./motion.js";
import { focusRow, rowsTemplate } from "./rows.js";
import { adoptCss, iconStyles, rowStyles, variables } from "./styles.js";

// Home Assistant's dialog manager creates this element once and calls showDialog for every open.
export class OrigamiNotificationsDialog extends LitElement {
  static styles = [
    variables,
    iconStyles,
    rowStyles,
    css`
      :host {
        font-family: var(--ha-font-family-body);
        -webkit-font-smoothing: var(--ha-font-smoothing);
        -moz-osx-font-smoothing: var(--ha-moz-osx-font-smoothing);
      }
      ha-adaptive-dialog {
        --dialog-content-padding: 0;
      }
      .list {
        --inset: 12px;
        padding: 0 var(--inset) var(--inset);
      }
      /* As a bottom sheet the list keeps the sides of a sections view, see ha-adaptive-dialog.ts and hui-sections-view.ts. */
      @media (max-width: 870px), (max-height: 500px) {
        .list {
          --inset: var(--ha-view-sections-column-gap, 32px);
        }
      }
      @media (max-width: 600px) {
        .list {
          --inset: var(--ha-view-sections-narrow-column-gap, 8px);
        }
      }
    `,
  ];

  constructor() {
    super();
    this._motion = new ListMotion(() => this.requestUpdate());
  }

  showDialog({ card }) {
    if (this._card && this._card !== card) this._release();
    this._card = card;
    card.setDialog(this);
    this.requestUpdate();
  }

  // Home Assistant calls this on back and before it navigates.
  closeDialog() {
    const dialog = this.renderRoot?.querySelector("ha-adaptive-dialog");
    if (dialog && this._shown) dialog.open = false;
    else this._closed();
    return true;
  }

  _release() {
    if (this._card?._dialog === this) this._card.setDialog(null);
  }

  _closed() {
    this._release();
    this._card = null;
    this._shown = false;
    this.requestUpdate();
    fire(this, "dialog-closed", { dialog: this.localName });
  }

  willUpdate() {
    this._animate = this._shown && !this._card?.preview;
    if (this._animate) this._motion.measure(this.renderRoot.querySelector(".list"));
  }

  updated() {
    this._motion.play(this.renderRoot.querySelector(".list"), this._animate);
    if (this._card && this._css !== this._card.css) {
      this._css = this._card.css;
      adoptCss(this, this._css);
    }
    if (this._refocus != null) focusRow(this.renderRoot, this._refocus, null);
    this._refocus = null;
  }

  render() {
    const card = this._card;
    if (!card) return nothing;
    const items = card.gone ? [] : card.listed();
    if (!items.length) {
      queueMicrotask(() => this._card === card && this.closeDialog());
    }
    const clear = card.dismissible();
    return html`
      <ha-adaptive-dialog
        open
        flexcontent
        .hass=${card.hass}
        header-title=${card.listTitle()}
        @opened=${(e) => e.target === e.currentTarget && ((this._shown = true), this.requestUpdate())}
        @closed=${(e) => e.target === e.currentTarget && this._closed()}
      >
        ${clear.length
          ? html`<ha-icon-button slot="headerActionItems" .label=${card.texts.clear} @click=${() => card.dismiss(clear)}>
              <ha-icon icon="mdi:notification-clear-all"></ha-icon>
            </ha-icon-button>`
          : nothing}
        <div class="list" role="list">${rowsTemplate(this._motion.withLeaving(items, this._animate), card.rowView((i) => (this._refocus = i)))}</div>
      </ha-adaptive-dialog>
    `;
  }
}
