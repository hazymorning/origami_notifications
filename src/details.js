import { isObject } from "./config.js";
import { hasDetails, platformOf } from "./kinds.js";

const answers = new Map();

// The details of a warning from its integration's get_details action, shared by every card. Null without them, and
// undefined while they are not known yet, which includes the time before Home Assistant lists its actions.
export function warningDetails(hass, st, onAnswer) {
  const id = st.entity_id;
  const key = `${id}|${st.attributes.id || st.last_changed}`;
  let entry = answers.get(key);
  if (!entry) {
    if (!hasDetails(hass, id)) return Object.keys(hass.services || {}).length ? null : undefined;
    entry = { data: undefined, waiting: new Set() };
    answers.set(key, entry);
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
