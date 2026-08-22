// Toast — a transient notification banner (HTML/CSS overlay).
//
// Used for skill unlocks. Toasts queue: each shows for a few seconds, then
// the next slides in. Driven off real time via requestAnimationFrame so it
// keeps animating while the sim is paused (level-up screen).

const SHOW_TIME = 2.8; // seconds a toast stays up
const EXIT_TIME = 0.4; // seconds for exit animation

export function createToast(mount) {
  const el = document.createElement('div');
  el.className = 'toast';
  mount.appendChild(el);

  // a second container pinned top-right for achievement unlock notifications
  // — kept separate from the central toast lane so the player can tell at a
  // glance "this is a trophy, not a skill / tutorial"
  const cornerEl = document.createElement('div');
  cornerEl.className = 'toast toast-corner';
  mount.appendChild(cornerEl);

  const queue = [];
  let current = null;
  let timeLeft = 0;
  let last = performance.now();

  function createToastItem(item) {
    const item_el = document.createElement('div');
    item_el.className = 'toast-item toast-enter';
    item_el.innerHTML = `
      <div class="toast-tag">${item.tag || '✦ 스킬 해금'}</div>
      <div class="toast-name">${item.title}</div>
      <div class="toast-text">${item.text}</div>`;
    return item_el;
  }

  function show(title, text, tag) {
    queue.push({ title, text, tag });
    if (!current) {
      processQueue();
    }
  }

  function processQueue() {
    if (queue.length === 0) {
      current = null;
      return;
    }
    const item = queue.shift();
    const item_el = createToastItem(item);
    el.appendChild(item_el);
    current = item_el;
    timeLeft = SHOW_TIME;
  }

  function tick() {
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;

    if (timeLeft > 0) {
      timeLeft -= dt;
      if (timeLeft <= 0) {
        // Start exit animation
        if (current) {
          current.classList.remove('toast-enter');
          current.classList.add('toast-exit');
          // Remove from DOM after exit animation completes
          setTimeout(() => {
            if (current && current.parentNode === el) {
              el.removeChild(current);
            }
            processQueue();
          }, EXIT_TIME * 1000);
        }
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Achievement notification — bypasses the queue and pops top-right. Each
  // notification lives in its own DOM element so several can stack if multiple
  // unlock in the same beat (e.g., end-of-run).
  function showAchievement(title, text) {
    const item_el = document.createElement('div');
    item_el.className = 'toast-item toast-ach toast-enter';
    item_el.innerHTML = `
      <div class="toast-tag">🏆 도전 과제</div>
      <div class="toast-name">${title}</div>
      <div class="toast-text">${text || ''}</div>`;
    cornerEl.appendChild(item_el);
    // schedule exit + removal — same timing as regular toasts
    setTimeout(() => {
      item_el.classList.remove('toast-enter');
      item_el.classList.add('toast-exit');
      setTimeout(() => {
        if (item_el.parentNode === cornerEl) cornerEl.removeChild(item_el);
      }, EXIT_TIME * 1000);
    }, SHOW_TIME * 1000);
  }

  return { show, showAchievement };
}
