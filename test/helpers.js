import assert from "node:assert/strict";
import fs from "node:fs";
import { afterEach, mock } from "node:test";
import { JSDOM, VirtualConsole } from "jsdom";

export const CODE = fs.readFileSync(new URL("../dist/origami-notifications.js", import.meta.url), "utf8");

export const NOW = Date.parse("2026-10-02T12:00:00Z");

const windows = [];

afterEach(() => {
  windows.splice(0).forEach((w) => w.close());
  mock.timers.reset();
});

// Values from the jsdom window belong to another realm, so they are compared as plain data.
export const same = (got, want, message) => assert.deepStrictEqual(JSON.parse(JSON.stringify(got ?? null)), want, message);

// A window with the card loaded. clock mocks the time from NOW, zone is the browser's time zone and define adds
// elements Home Assistant would have.
export function makeWindow({ clock = false, zone, define = [] } = {}) {
  if (clock) mock.timers.enable({ apis: ["Date", "setTimeout", "setInterval"], now: NOW });
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", (...args) => console.error(...args));
  const { window } = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true, runScripts: "outside-only", url: "http://ha.local/", virtualConsole });
  window.ResizeObserver = class {
    constructor(cb) {
      this.cb = cb;
    }
    observe(target) {
      target.resize = (width) => this.cb([{ contentRect: { width } }]);
    }
    disconnect() {}
  };
  window.IntersectionObserver = class {
    constructor(cb) {
      this.cb = cb;
    }
    observe(target) {
      target.show = (...changes) => this.cb(changes.map((isIntersecting) => ({ isIntersecting })));
    }
    disconnect() {}
  };
  window.matchMedia = () => ({ matches: false, onchange: null });
  // jsdom has no adoptedStyleSheets, so Lit would fall back to style elements, unlike in a browser.
  for (const proto of [window.Document.prototype, window.ShadowRoot.prototype]) Object.defineProperty(proto, "adoptedStyleSheets", { value: [], writable: true });
  if (clock) window.Date = Date;
  if (zone) {
    const Format = window.Intl.DateTimeFormat;
    window.Intl.DateTimeFormat = function (locales, options) {
      return new Format(locales, { ...options, timeZone: options?.timeZone || zone });
    };
  }
  for (const tag of define) window.customElements.define(tag, class extends window.HTMLElement {});
  window.eval(CODE);
  windows.push(window);
  return window;
}

export const st = (entity_id, state, attributes = {}, changed = "2026-09-21T10:00:00+00:00") => ({ entity_id, state, attributes, last_changed: changed });

export const on = (id, name, attributes, changed) => st(id, "on", { friendly_name: name, ...attributes }, changed);

export const statesOf = (...list) => Object.fromEntries(list.map((s) => [s.entity_id, s]));

// subs collects the subscriptions and calls the service calls. The rest replaces parts of hass.
export function makeHass(states = {}, { subs = [], calls = [], reply, ws, ...rest } = {}) {
  const subscribe = (sub) => {
    subs.push(sub);
    return Promise.resolve(() => (sub.closed = true));
  };
  return {
    states,
    entities: {},
    devices: {},
    areas: {},
    services: {},
    user: { id: "u1", is_admin: true },
    locale: { language: "en" },
    config: { time_zone: "UTC" },
    themes: { darkMode: false },
    localize: () => "",
    hassUrl: (path) => (path.startsWith("http") ? path : "http://ha.local" + path),
    connection: {
      subscribeMessage: (cb, msg) => subscribe({ cb, msg }),
      subscribeEvents: (cb, event) => subscribe({ cb, event }),
    },
    callService: (domain, service, data, target, notify, response) => {
      calls.push([`${domain}.${service}`, data, ...(target ? [target] : [])]);
      return Promise.resolve(reply?.(domain, service, data, target, notify, response));
    },
    callWS: (msg) => {
      calls.push(["ws", msg]);
      return Promise.resolve(ws ? ws(msg) : { issues: [] });
    },
    ...rest,
  };
}

// Lets promises and Lit's updates run.
export async function settle(el) {
  for (let i = 0; i < 6; i++) await Promise.resolve();
  await el?.updateComplete;
}

export async function mount(w, config, hass, parent = w.document.body) {
  const el = w.document.createElement("origami-notifications");
  el.setConfig({ type: "custom:origami-notifications", ...config });
  parent.appendChild(el);
  el.hass = hass;
  await settle(el);
  return el;
}

export const q = (el, selector) => el.shadowRoot.querySelector(selector);

export const rows = (el) =>
  [...el.shadowRoot.querySelectorAll(".item")].map((item) => ({
    title: item.querySelector(".title").textContent,
    message: item.querySelector(".message").textContent.trim(),
  }));

export const titles = (el) => rows(el).map((r) => r.title);

export const head = (el) => ({
  title: q(el, ".head .title").textContent,
  secondary: q(el, ".head .secondary")?.textContent.trim() ?? "",
  badge: q(el, ".badge")?.textContent ?? "",
});

export const actionsOf = (el) => {
  const sent = [];
  el.addEventListener("hass-action", (e) => sent.push(e.detail));
  return sent;
};

export const press = (el, selector) => q(el, selector).click();

export const notifications = (sub, ...list) => sub.cb({ type: "current", notifications: Object.fromEntries(list.map((n) => [n.notification_id, n])) });
