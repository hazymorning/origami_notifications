import { sig } from "./kinds.js";

const KEY = "origami-notifications-ack";
const LIMIT = 64;
const PENDING_MS = 10000;

let acks = null;
const shown = new Map();

function load() {
  if (!acks) {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || "{}");
      acks = stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
    } catch {
      acks = {};
    }
  }
  return acks;
}

function save() {
  const visible = new Set([...shown.values()].flatMap((keys) => [...keys]));
  const keys = Object.keys(acks);
  const order = [...keys.filter((k) => !visible.has(k)), ...keys.filter((k) => visible.has(k))];
  for (const k of order.slice(0, Math.max(keys.length - LIMIT, 0))) delete acks[k];
  try {
    localStorage.setItem(KEY, JSON.stringify(acks));
  } catch {}
}

const listeners = new Set();
const notify = (except) => listeners.forEach((fn) => fn !== except && fn());

window.addEventListener("storage", (e) => {
  if (e.key !== KEY) return;
  acks = null;
  notify();
});

export class Dismissals {
  constructor(onChange) {
    this.onChange = onChange;
    this.pending = new Map();
  }

  connect() {
    listeners.add(this.onChange);
  }

  disconnect() {
    listeners.delete(this.onChange);
    shown.delete(this);
  }

  apply(entries, known, now, wake) {
    const stored = load();
    const present = new Set(entries.map((e) => e.key));
    let changed = false;
    const drop = (key) => {
      if (stored[key] === undefined) return;
      delete stored[key];
      changed = true;
    };
    for (const [key, until] of this.pending) {
      if (!present.has(key) || until <= now) this.pending.delete(key);
      else if (Number.isFinite(until)) wake(until);
    }
    const out = [];
    for (const entry of entries) {
      if (this.pending.has(entry.key)) continue;
      if (entry.waiting) {
        if (stored[entry.key] === undefined) out.push({ ...entry, ack: undefined });
        continue;
      }
      if (entry.dismiss || entry.ack === undefined) {
        out.push(entry);
        continue;
      }
      const signature = entry.once ? entry.ack : sig(entry.ack, entry.ts);
      if (stored[entry.key] === signature) continue;
      drop(entry.key);
      out.push({ ...entry, signature });
    }
    for (const key of known) if (!present.has(key)) drop(key);
    shown.set(this, present);
    if (changed) save();
    return out;
  }

  dismiss(entries, run) {
    const stored = load();
    let local = false;
    for (const entry of entries.flatMap((e) => e.members || [e])) {
      if (entry.signature) {
        stored[entry.key] = entry.signature;
        local = true;
      } else if (entry.dismiss) {
        const { key } = entry;
        this.pending.set(key, Infinity);
        run(entry.dismiss).then(
          () => {
            if (this.pending.get(key) !== Infinity) return;
            this.pending.set(key, Date.now() + PENDING_MS);
            this.onChange();
          },
          (error) => {
            console.warn(`origami-notifications: Home Assistant kept ${key}`, error);
            if (this.pending.delete(key)) this.onChange();
          }
        );
      }
    }
    if (local) {
      save();
      notify(this.onChange);
    }
    this.onChange();
  }
}

export const canDismiss = (entry) => Boolean(entry.dismiss || entry.signature || entry.members?.every((m) => m.signature));
