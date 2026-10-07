export const isObject = (v) => v != null && typeof v === "object" && !Array.isArray(v);

export const isEmpty = (v) => v == null || v === "" || v === false || (typeof v === "object" && Object.keys(v).length === 0);
