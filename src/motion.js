const FALLBACK = { fast: 150, normal: 250, slow: 350 };

// Home Assistant's duration tokens drop to 1 ms where motion is reduced.
export function duration(el, name) {
  const value = getComputedStyle(el).getPropertyValue(`--ha-animation-duration-${name}`).trim();
  const n = parseFloat(value);
  return Number.isFinite(n) ? (value.endsWith("ms") ? n : n * 1000) : FALLBACK[name];
}

export const EASE = {
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  out: "cubic-bezier(0.4, 0, 1, 1)",
  in: "cubic-bezier(0, 0, 0.2, 1)",
};

export class ListMotion {
  constructor(onGone) {
    this.onGone = onGone;
    this.rendered = [];
    this.ghosts = new Map();
    this.before = new Map();
  }

  withLeaving(entries, animate) {
    if (!animate) this.ghosts.clear();
    const keys = new Set(entries.map((e) => e.key));
    for (const key of this.ghosts.keys()) if (keys.has(key)) this.ghosts.delete(key);
    const out = [...entries];
    this.rendered.forEach((entry, i) => {
      if (keys.has(entry.key)) return;
      if (animate && !entry.leaving && !this.ghosts.has(entry.key)) this.ghosts.set(entry.key, { ...entry, leaving: true });
      const ghost = this.ghosts.get(entry.key);
      if (!ghost) return;
      const anchor = out.findIndex((e) => e.key === this.rendered[i - 1]?.key);
      out.splice(anchor < 0 ? Math.min(i, out.length) : anchor + 1, 0, ghost);
    });
    this.rendered = out;
    return out;
  }

  measure(list) {
    this.before = new Map([...(list?.children || [])].map((el) => [el.dataset.key, el.offsetTop]));
  }

  play(list, animate) {
    if (!list || !animate) return;
    const fast = duration(list, "fast");
    const normal = duration(list, "normal");
    const side = getComputedStyle(list).direction === "rtl" ? "-16px" : "16px";
    for (const el of list.children) {
      const key = el.dataset.key;
      if (el.dataset.leaving && !this.ghosts.has(key)) {
        el.getAnimations().forEach((a) => a.cancel());
        delete el.dataset.leaving;
      }
      if (this.ghosts.has(key)) {
        if (el.dataset.leaving) continue;
        el.dataset.leaving = "1";
        this.run(
          el,
          [
            { opacity: 1, gridTemplateRows: "1fr", transform: "none", easing: EASE.out },
            { opacity: 0, gridTemplateRows: "1fr", transform: `translateX(${side})`, offset: fast / (fast + normal), easing: EASE.standard },
            { opacity: 0, gridTemplateRows: "0fr", transform: `translateX(${side})` },
          ],
          fast + normal,
          () => {
            this.ghosts.delete(key);
            this.onGone();
          }
        );
      } else if (!this.before.has(key)) {
        this.run(
          el,
          [
            { opacity: 0, gridTemplateRows: "0fr", easing: EASE.standard },
            { opacity: 0, gridTemplateRows: "1fr", offset: normal / (fast + normal), easing: EASE.in },
            { opacity: 1, gridTemplateRows: "1fr" },
          ],
          fast + normal
        );
      } else {
        const dy = this.before.get(key) - el.offsetTop;
        if (Math.abs(dy) > 1) el.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: normal, easing: EASE.standard });
      }
    }
  }

  run(el, frames, ms, done) {
    el.classList.add("moving");
    const anim = el.animate(frames, { duration: ms, fill: done ? "forwards" : "none" });
    anim.finished.then(() => {
      el.classList.remove("moving");
      done?.();
    }, () => {});
  }
}
