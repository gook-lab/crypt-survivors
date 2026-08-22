// Settings — user preferences persisted to localStorage.
//
// Read once at boot, then via getSettings() everywhere. Writers go through
// setSetting which persists immediately and broadcasts a 'change' so any
// component caching a value (audio.js, the FX gate) can react.
//
// Defaults match the pre-settings behaviour so existing players see no
// change unless they open the panel.

const KEY = 'crypt_survivors_settings';

const DEFAULTS = {
  volume: 0.7, // 0..1 master audio
  shake: true, // screen shake on hit + boss kill
  dmgNumbers: true, // floating damage numbers
  fxIntensity: 'normal', // 'low' | 'normal' | 'high' — projectile trails etc.
  bossTelegraph: true, // boss windup telegraph rings visible
};

let cache = null;
const listeners = new Set();

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

function write(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function getSettings() {
  if (!cache) cache = read();
  return cache;
}

export function setSetting(key, value) {
  const s = getSettings();
  if (s[key] === value) return;
  s[key] = value;
  write(s);
  for (const fn of listeners) fn(s);
}

export function onSettingsChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const SETTING_DEFAULTS = DEFAULTS;
