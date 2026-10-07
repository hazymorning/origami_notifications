import { isObject } from "./values.js";
import { hasDetails, platformOf } from "./kinds.js";

const answers = new Map();

// Undefined until Home Assistant has listed its actions and the integration has answered.
export function warningDetails(hass, st, onAnswer) {
  const id = st.entity_id;
  const warning = st.attributes.id || st.last_changed;
  let entry = answers.get(id);
  if (entry?.warning !== warning) {
    if (!hasDetails(hass, id)) return Object.keys(hass.services || {}).length ? null : undefined;
    entry = { warning, data: undefined, waiting: new Set() };
    answers.set(id, entry);
    const answer = (data) => {
      entry.data = isObject(data) ? data : null;
      entry.waiting.forEach((fn) => fn());
      entry.waiting.clear();
    };
    Promise.resolve()
      .then(() => hass.callService(platformOf(hass, id), "get_details", {}, { entity_id: id }, false, true))
      .then((res) => answer(res?.response?.[id]), () => answer(null));
  }
  if (entry.data === undefined) entry.waiting.add(onAnswer);
  return entry.data;
}
