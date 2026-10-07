// Like Home Assistant's own cards.
const HOLD_MS = 500;
const DOUBLE_TAP_MS = 250;

const SWIPE_PX = 48;
const DRAG_START_PX = 10;

export class HeadGestures {
  constructor(head, handlers) {
    this.head = head;
    this.on = handlers;
    this.press = null;
    this.suppress = false;
    this.tapWait = null;
    head.addEventListener("pointerdown", (e) => this.down(e));
    head.addEventListener("pointermove", (e) => this.move(e));
    head.addEventListener("pointerup", (e) => this.up(e, false));
    head.addEventListener("pointercancel", (e) => e !== this.ownCancel && this.up(e, true));
    head.addEventListener("pointerleave", (e) => !this.press?.drag && this.up(e, true));
    head.parentElement.addEventListener("click", (e) => this.click(e), true);
    head.addEventListener("keydown", (e) => this.key(e));
  }

  down(e) {
    if (e.button > 0 || !e.isPrimary) return;
    this.suppress = false;
    this.on.pressed(true);
    const press = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, dx: 0, drag: false };
    const hold = this.on.holdAction();
    if (hold) {
      press.timer = setTimeout(() => {
        this.suppress = true;
        hold();
      }, HOLD_MS);
    }
    this.press = press;
  }

  move(e) {
    const p = this.press;
    if (!p || e.pointerId !== p.id) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (!p.drag) {
      if (Math.hypot(dx, dy) > DRAG_START_PX) clearTimeout(p.timer);
      if (!this.on.canDrag() || Math.abs(dx) < DRAG_START_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      p.drag = true;
      this.suppress = true;
      this.head.setPointerCapture?.(p.id);
      // A swipe ends the press on Home Assistant's ripple, as scrolling the page does.
      this.ownCancel = new PointerEvent("pointercancel", { pointerId: e.pointerId, pointerType: e.pointerType, isPrimary: true });
      this.head.dispatchEvent(this.ownCancel);
    }
    p.dx = dx;
    this.on.drag(dx);
  }

  up(e, cancelled) {
    const p = this.press;
    if (!p || e.pointerId !== p.id) return;
    this.press = null;
    clearTimeout(p.timer);
    this.on.pressed(false);
    if (!p.drag) return;
    const fast = Math.abs(p.dx) / Math.max(e.timeStamp - p.t, 1) > 0.5;
    const swiped = !cancelled && (Math.abs(p.dx) > SWIPE_PX || fast);
    this.on.dragEnd(swiped ? Math.sign(-p.dx) * (this.on.rtl() ? -1 : 1) : 0);
  }

  click(e) {
    if (!this.head.contains(e.target)) return;
    if (this.suppress) {
      this.suppress = false;
      e.stopPropagation();
      return;
    }
    this.activate();
  }

  activate() {
    const double = this.on.doubleTapAction();
    if (!double) return this.on.tap();
    if (this.tapWait) {
      clearTimeout(this.tapWait);
      this.tapWait = null;
      return double();
    }
    this.tapWait = setTimeout(() => {
      this.tapWait = null;
      this.on.tap();
    }, DOUBLE_TAP_MS);
  }

  key(e) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (step && this.on.canDrag()) {
      e.preventDefault();
      this.on.step(e.key.startsWith("ArrowL") || e.key.startsWith("ArrowR") ? step * (this.on.rtl() ? -1 : 1) : step);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.activate();
    }
  }

  // A card that leaves gets no pointerup.
  reset() {
    if (this.press) clearTimeout(this.press.timer);
    if (this.press) this.on.pressed(false);
    this.press = null;
    clearTimeout(this.tapWait);
    this.tapWait = null;
  }
}
