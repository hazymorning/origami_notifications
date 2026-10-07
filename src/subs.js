const end = (sub) => sub.unsub.then((unsub) => unsub()).catch(() => {});

// Keeps one subscription per key. A subscription Home Assistant refused starts again once its token changes.
export class Subscriptions {
  constructor() {
    this.subs = new Map();
  }

  sync(wanted) {
    for (const [key, sub] of this.subs) {
      const want = wanted.get(key);
      if (want && !(sub.failed && sub.token !== want.token)) continue;
      this.subs.delete(key);
      end(sub);
    }
    for (const [key, { start, token }] of wanted) {
      if (this.subs.has(key)) continue;
      const sub = { token, failed: false };
      sub.unsub = Promise.resolve().then(start);
      sub.unsub.catch(() => (sub.failed = true));
      this.subs.set(key, sub);
    }
  }

  clear() {
    this.sync(new Map());
  }
}
