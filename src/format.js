export const MINUTE = 60000;
export const HOUR = 3600000;
export const DAY = 86400000;

const formats = new Map();

export function dateFormat(lang, options) {
  const key = lang + JSON.stringify(options);
  if (!formats.has(key)) {
    let format;
    try {
      format = new Intl.DateTimeFormat(lang, options);
    } catch {
      format = new Intl.DateTimeFormat(undefined, { ...options, timeZone: undefined });
    }
    formats.set(key, format);
  }
  return formats.get(key);
}

function numberFormat(lang, options) {
  try {
    return new Intl.NumberFormat(lang, options);
  } catch {
    return new Intl.NumberFormat(undefined, options);
  }
}

export const fill = (template, vars) => template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

export function zonedParts(ts, timeZone) {
  const parts = dateFormat("en-US", {
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone,
  }).formatToParts(ts);
  return Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]));
}

const WALL_TIME = /^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d):(\d\d)(?::(\d\d)(\.\d+)?)?)?$/;

// Calendar start times and date-only values are the server's wall clock time, without an offset.
export function fromServerTime(text, timeZone) {
  const m = WALL_TIME.exec(text);
  if (!m) return Date.parse(text);
  const wall = Date.UTC(+m[1], m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  const offset = (ts) => {
    const p = zonedParts(ts, timeZone);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - ts;
  };
  return wall - offset(wall - offset(wall)) + (m[7] ? Math.round(parseFloat(m[7]) * 1000) : 0);
}

export const isoTime = (value, timeZone) =>
  typeof value === "string" && /^\d{4}-\d\d-\d\d/.test(value) ? fromServerTime(value, timeZone) : NaN;

export const parseTime = (value, fallback = NaN) => {
  const ts = value ? Date.parse(value) : NaN;
  return Number.isNaN(ts) ? fallback : ts;
};

export function dayNumber(ts, timeZone) {
  const p = zonedParts(ts, timeZone);
  return Date.UTC(p.year, p.month - 1, p.day) / DAY;
}

export const isoDate = (day) => new Date(day * DAY).toISOString().slice(0, 10);

export const dayStart = (day, timeZone) => fromServerTime(isoDate(day), timeZone);

export function clockText(ms) {
  const total = ms > 0 ? Math.ceil(ms / 1000) : 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

export function parseDuration(text) {
  const m = /^(\d+):(\d\d):(\d\d)$/.exec(String(text ?? "").trim());
  return m ? (+m[1] * 3600 + +m[2] * 60 + +m[3]) * 1000 : NaN;
}

// Copied from frontend src/common/number/format_number.ts.
const NUMBER_LOCALES = { comma_decimal: "en-US", decimal_comma: "de", space_comma: "fr", quote_decimal: "de-CH", none: "en-US" };

function systemHour12() {
  return dateFormat(undefined, { hour: "numeric" }).resolvedOptions().hour12;
}

export class Clock {
  constructor(hass, lang, texts) {
    const locale = hass?.locale || {};
    this.lang = lang;
    this.t = texts;
    this.server = hass?.config?.time_zone || undefined;
    this.zone = locale.time_zone === "server" ? this.server : undefined;
    const hour12 = { 12: true, 24: false, system: systemHour12() }[locale.time_format];
    this.time = { timeZone: this.zone, ...(hour12 === undefined ? {} : { hour12 }) };
    this.numbers = numberFormat(locale.number_format === "system" ? undefined : NUMBER_LOCALES[locale.number_format] || lang, {
      maximumFractionDigits: 1,
      useGrouping: locale.number_format !== "none",
    });
    this.percents = numberFormat(lang, { style: "percent", maximumFractionDigits: 0 });
    try {
      this.rel = new Intl.RelativeTimeFormat(lang, { numeric: "auto", style: "short" });
    } catch {
      this.rel = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" });
    }
  }

  relative(ts, now) {
    const s = Math.round((ts - now) / 1000);
    const m = Math.round(s / 60);
    const h = Math.round(s / 3600);
    if (Math.abs(s) < 60) return (s > 0 ? this.t.soon : this.t.just_now) || this.rel.format(0, "second");
    if (Math.abs(m) < 60) return this.rel.format(m, "minute");
    if (Math.abs(h) < 24) return this.rel.format(h, "hour");
    return this.rel.format(Math.round(s / 86400), "day");
  }

  entryTime(entry, now) {
    if (!Number.isFinite(entry.ts)) return "";
    if (entry.clock) return clockText(entry.ts - now);
    if (entry.day) {
      const { near, text } = this.day(entry.ts, this.server, now);
      return near ? text : fill(this.t.on_date, { d: text });
    }
    return this.relative(entry.past ? Math.min(entry.ts, now) : entry.ts, now);
  }

  absolute(ts) {
    return dateFormat(this.lang, { dateStyle: "medium", timeStyle: "short", ...this.time }).format(ts);
  }

  absoluteDate(ts, timeZone) {
    return dateFormat(this.lang, { dateStyle: "medium", timeZone }).format(ts);
  }

  clockTime(ts) {
    return dateFormat(this.lang, { hour: "numeric", minute: "2-digit", ...this.time }).format(ts);
  }

  // Intl writes 01 Uhr where people write 1 Uhr.
  hour(ts) {
    return dateFormat(this.lang, { hour: "numeric", ...this.time }).format(ts).replace(/^0(?=\d\D)/, "");
  }

  day(ts, timeZone, now) {
    const diff = dayNumber(ts, timeZone) - dayNumber(now, this.zone);
    if (Math.abs(diff) <= 1) return { near: true, text: this.rel.format(diff, "day") };
    return { near: false, text: dateFormat(this.lang, { day: "2-digit", month: "2-digit", timeZone }).format(ts) };
  }

  at(ts, now) {
    const { near, text } = this.day(ts, this.zone, now);
    return fill(near ? this.t.day_at : this.t.date_at, { d: text, t: this.clockTime(ts) });
  }

  calendar(start, allDay, now) {
    const ts = start ? fromServerTime(start, this.server) : NaN;
    if (Number.isNaN(ts)) return this.t.event;
    if (!allDay) return this.at(ts, now);
    const { near, text } = this.day(ts, this.server, now);
    return near ? text : fill(this.t.on_date, { d: text });
  }

  slotLabel(ts, type, now) {
    const diff = dayNumber(ts, this.zone) - dayNumber(now, this.zone);
    const day = Math.abs(diff) <= 1 ? this.rel.format(diff, "day") : dateFormat(this.lang, { weekday: "long", timeZone: this.zone }).format(ts);
    const text = type !== "hourly" ? day : diff === 0 ? this.clockTime(ts) : fill(this.t.day_at, { d: day, t: this.clockTime(ts) });
    return text.charAt(0).toLocaleUpperCase(this.lang) + text.slice(1);
  }

  number(v) {
    return this.numbers.format(v);
  }

  percent(p) {
    return this.percents.format(p / 100);
  }
}
