// Keyboard input as a live set of logical actions.
// Arrow keys and WASD both map to the four movement directions.
//
// The returned object keeps the original Set-flavoured `has(action)` API
// that movement.js depends on. It also exposes:
//   - justPressedSpace: true on the frame the spacebar transitions from
//     up -> down. systems/active.js reads it once and the next consumeFrame
//     call clears it. Without the per-frame edge detection, holding space
//     would auto-cast every frame.
//   - consumeFrame(): called by main.js after each tick to clear all
//     one-shot edges so they don't fire twice.

const KEY_MAP = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  a: 'left',
  d: 'right',
  w: 'up',
  s: 'down',
};

// e.code is layout/IME-independent ("KeyA" regardless of Korean / Dvorak /
// CapsLock) — without this, an active Korean IME emits e.key='ㅁ' for the
// 'a' key and WASD movement dies silently.
const CODE_MAP = {
  KeyA: 'left',
  KeyD: 'right',
  KeyW: 'up',
  KeyS: 'down',
};

export function createInput() {
  const active = new Set();
  const input = {
    has(a) { return active.has(a); },
    justPressedSpace: false,
    consumeFrame() {
      this.justPressedSpace = false;
    },
  };

  function action(e) {
    return KEY_MAP[e.key]
      || KEY_MAP[e.key?.toLowerCase()]
      || CODE_MAP[e.code];
  }

  // Spacebar handler — IME-safe (e.code === 'Space'), edge-triggered,
  // preventDefault to stop the page from scrolling.
  const spaceHeld = { v: false };

  window.addEventListener('keydown', (e) => {
    // Ignore input when focus is on a text field (settings inputs, future
    // chat etc.) — otherwise typing a space would trigger a cast.
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
      return;
    }
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      if (!spaceHeld.v) {
        spaceHeld.v = true;
        input.justPressedSpace = true;
      }
      return;
    }
    const a = action(e);
    if (a) {
      active.add(a);
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.key === ' ') {
      spaceHeld.v = false;
      return;
    }
    const a = action(e);
    if (a) active.delete(a);
  });
  // Releasing focus must not leave keys stuck "down".
  window.addEventListener('blur', () => {
    active.clear();
    spaceHeld.v = false;
    input.justPressedSpace = false;
  });

  return input;
}
