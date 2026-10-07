import { version } from "../package.json";
import { OrigamiNotificationsCard, DIALOG } from "./card.js";
import { CARD } from "./config.js";
import { OrigamiNotificationsDialog } from "./dialog.js";
import { OrigamiNotificationsEditor } from "./editor.js";

const define = (tag, element) => customElements.get(tag) || customElements.define(tag, element);

define(CARD, OrigamiNotificationsCard);
define(CARD + "-editor", OrigamiNotificationsEditor);
define(DIALOG, OrigamiNotificationsDialog);

window.customCards ||= [];
if (!window.customCards.some((c) => c.type === CARD)) {
  window.customCards.push({
    type: CARD,
    name: "Origami Notifications",
    description: "System notifications, repairs, updates, warnings and any entity you add.",
    preview: true,
    documentationURL: "https://github.com/hazymorning/origami_notifications",
  });
  console.info(`%c Origami Notifications %c v${version} `, "font-weight: bold", "opacity: 0.7");
}
