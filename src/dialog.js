import { css, html, LitElement, nothing } from "lit";
import { fire } from "./card.js";
import { ListMotion } from "./motion.js";
import { rowsTemplate } from "./rows.js";
import { iconStyles, rowStyles, variables } from "./styles.js";

// Home Assistant creates this element once, next to its own dialogs, and calls showDialog for every open. It shows
// the rows of the card that opened it. A new ha-adaptive-dialog each time picks dialog or bottom sheet anew.
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
        padding: 0 12px 12px;
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

  // Home Assistant calls this on back and before it navigates. A dialog that has not opened yet just goes.
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
    this._style ||= this.renderRoot.appendChild(document.createElement("style"));
    this._style.textContent = this._card?.css || "";
    if (this._refocus != null) {
      const items = [...this.renderRoot.querySelectorAll(".item:not(.leaving)")];
      items[Math.min(this._refocus, items.length - 1)]?.querySelector(".dismiss, .icon[role=button]")?.focus({ preventScroll: true });
      this._refocus = null;
    }
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
        <ha-icon-button slot="headerActionItems" .label=${card.texts.clear} ?hidden=${!clear.length} @click=${() => card.dismiss(clear)}>
          <ha-icon icon="mdi:notification-clear-all"></ha-icon>
        </ha-icon-button>
        <div class="list" role="list">${rowsTemplate(this._motion.withLeaving(items, this._animate), card.rowView((i) => (this._refocus = i)))}</div>
      </ha-adaptive-dialog>
    `;
  }
}
