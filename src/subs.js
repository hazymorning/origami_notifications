const end = (sub) => sub.unsub.then((unsub) => unsub()).catch(() => {});

export class Subscriptions {
  constructor() {
    this.subs = new Map();
  }

  sync(wanted) {
    for (const [key, sub] of this.subs) {
      const want = wanted.get(key);
      if (want && !(sub.failed && sub.retryOn !== want.retryOn)) continue;
      this.subs.delete(key);
      end(sub);
    }
    for (const [key, { start, retryOn }] of wanted) {
      if (this.subs.has(key)) continue;
      const sub = { retryOn, failed: false };
      sub.unsub = Promise.resolve().then(start);
      sub.unsub.catch(() => (sub.failed = true));
      this.subs.set(key, sub);
    }
  }

  clear() {
    this.sync(new Map());
  }
}
