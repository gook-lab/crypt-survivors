// Arcanas — run-only modifiers picked at run start (after the hero pick).
//
// A run starts with an offer of 3 random arcanas + a "건너뛰기" option. Each
// arcana folds its `bonus` into loadout.meta the same way a hero's `bonus`
// does, so recompute() picks up the modifiers without any new wiring. Some
// arcanas also register hooks the run consumes:
//   - effect.onKill : appended to loadout.onKill (same channel as hero L40)
//   - effect.tag    : a string flag set on loadout.arcanaTag for systems to
//                     consult (e.g., 'glass_cannon' silences a UI element).
//
// All arcanas are RUN-ONLY — they do not persist across deaths. Reroll/skip
// are free (no token cost) because picking one is already a meaningful choice.

// `unlock` describes how an arcana enters the player's pool. The 4 starter
// arcanas are always available; the rest are earned via lifetime stats so
// the early experience is curated and later runs surface more variety.
// `check(stats)` returns true once the arcana is available; stats is the
// lifetime-stats shape from save.stats. `desc` shows on the locked card.
export const ARCANAS = [
  {
    id: 'bloodbath',
    name: '핏빛 의식',
    blurb: '처치 시 체력 +1, 최대 체력 −20%',
    color: '#c8332a',
    icon: 'icon_lifesteal',
    unlock: { check: () => true, desc: '시작부터 해금' },
    bonus: (m) => { m.maxHp -= 20; },
    effect: { onKill: 'bloodbath' },
  },
  {
    id: 'pyromancer',
    name: '불의 권능',
    blurb: '모든 피해 +25% · 무기 사거리 −15%',
    color: '#e88a36',
    icon: 'icon_fire',
    unlock: { check: () => true, desc: '시작부터 해금' },
    bonus: (m) => { m.damage += 0.25; m.projLife -= 0.15; },
  },
  {
    id: 'chronomancer',
    name: '시간의 매듭',
    blurb: '투사체 유지 +60% · 쿨다운 +20%',
    color: '#88e0c0',
    icon: 'icon_endure',
    unlock: { check: () => true, desc: '시작부터 해금' },
    bonus: (m) => { m.projLife += 0.6; m.cooldown -= 0.2; },
  },
  {
    id: 'glass_cannon',
    name: '유리 대포',
    blurb: '피해 +60% · 최대 체력 −40%',
    color: '#f0d27a',
    icon: 'icon_might',
    unlock: { check: () => true, desc: '시작부터 해금' },
    bonus: (m) => { m.damage += 0.6; m.maxHp -= 40; },
    effect: { tag: 'glass_cannon' },
  },
  {
    id: 'frugal',
    name: '인색한 자',
    blurb: '골드 +60% · 경험치 −25%',
    color: '#ffd700',
    icon: 'pickup_chest_gold',
    unlock: { check: (s) => (s.kills || 0) >= 500, desc: '누적 500처치 시 해금' },
    bonus: (m) => { m.goldGain += 0.6; m.xpGain -= 0.25; },
  },
  {
    id: 'marksman',
    name: '관통의 시선',
    blurb: '치명타 확률 +25% · 치명타 배율 +50%',
    color: '#9a78e8',
    icon: 'icon_crit',
    unlock: { check: (s) => (s.crits || 0) >= 200, desc: '누적 200 치명타 시 해금' },
    bonus: (m) => { m.critChance += 0.25; m.critMult += 0.5; },
  },
  {
    id: 'hoarder',
    name: '탐욕',
    blurb: '자석 범위 +320 · 이동 −10%',
    color: '#88c8ff',
    icon: 'icon_lodestone',
    unlock: { check: (s) => (s.runs || 0) >= 5, desc: '5회 런 완료 시 해금' },
    bonus: (m) => { m.magnet += 320; m.moveSpeed -= 0.1; },
  },
  {
    id: 'frenzy',
    name: '광란',
    blurb: '처치 시 피해 +2% (최대 +60%) · 피격 시 리셋',
    color: '#ff4a4a',
    icon: 'status_burn',
    unlock: { check: (s) => (s.maxLevel || 0) >= 20, desc: 'Lv 20 도달 시 해금' },
    bonus: () => {},
    effect: { tag: 'frenzy', onKill: 'frenzy' },
  },
  {
    id: 'stillness',
    name: '고요',
    blurb: '정지 시 피해 ×2 · 이동 중 피해 −30%',
    color: '#a0c8e0',
    icon: 'icon_aura',
    unlock: { check: (s) => (s.longestSurvival || 0) >= 300, desc: '5분 생존 시 해금' },
    bonus: () => {},
    effect: { tag: 'stillness' },
  },
  {
    id: 'soulreaper',
    name: '영혼 수확자',
    blurb: '100마리 처치마다 전체 회복 + 3초 무적',
    color: '#c894ff',
    icon: 'icon_revive',
    unlock: { check: (s) => (s.bosses || 0) >= 5, desc: '누적 보스 5처치 시 해금' },
    bonus: () => {},
    effect: { onKill: 'soulreaper' },
  },
  // ── build-freedom expansion — 5 new arcanas (1 starter + 4 gated) ──────
  {
    id: 'tempest_will',
    name: '폭풍 의지',
    blurb: '쿨다운 −20% · 피해 −12%',
    color: '#6acfff',
    icon: 'icon_haste',
    unlock: { check: () => true, desc: '시작부터 해금' },
    bonus: (m) => { m.cooldown += 0.2; m.damage -= 0.12; },
  },
  {
    id: 'fortress',
    name: '요새',
    blurb: '방어 +25% · 이동 −15%',
    color: '#d0c090',
    icon: 'icon_endure',
    unlock: { check: (s) => (s.runs || 0) >= 3, desc: '3런 완료 시 해금' },
    bonus: (m) => { m.armor += 0.25; m.moveSpeed -= 0.15; },
  },
  {
    id: 'midas',
    name: '미다스의 손길',
    blurb: '골드 +100% · 피해 −20%',
    color: '#ffcc44',
    icon: 'pickup_chest_gold',
    // gated on stats.goldLifetime — added by save.js migration alongside this PR
    unlock: { check: (s) => (s.goldLifetime || 0) >= 5000, desc: '누적 5000 골드 획득 시 해금' },
    bonus: (m) => { m.goldGain += 1.0; m.damage -= 0.2; },
  },
  {
    id: 'celerity',
    name: '신속의 의식',
    blurb: '이동 +30% · 최대 체력 −25',
    color: '#a0e0c8',
    icon: 'icon_swift',
    unlock: { check: (s) => (s.longestSurvival || 0) >= 600, desc: '10분 생존 시 해금' },
    bonus: (m) => { m.moveSpeed += 0.3; m.maxHp -= 25; },
  },
  {
    id: 'arcane_focus',
    name: '비전 집중',
    blurb: '치명 배율 +0.8 · 치명 확률 −5%',
    color: '#b070e8',
    icon: 'icon_crit',
    unlock: { check: (s) => (s.maxLevel || 0) >= 30, desc: 'Lv 30 도달 시 해금' },
    bonus: (m) => { m.critMult += 0.8; m.critChance -= 0.05; },
  },
];

// Filter ARCANAS to only those the player has earned, based on save.stats.
export function unlockedArcanas(stats) {
  return ARCANAS.filter((a) => !a.unlock || a.unlock.check(stats || {}));
}

// Pick `n` distinct random arcanas from the unlocked pool — locked arcanas
// are silently filtered out, so the picker only offers what the player has
// earned. With < n unlocks, it returns whatever's available.
export function rollArcanas(rng, n = 3, stats) {
  const pool = unlockedArcanas(stats);
  const out = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(rng.next() * pool.length);
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return out;
}

// Apply the chosen arcana at run start (between charselect and startRun).
// Folds into loadout.meta + onKill the same way applyCharacter does.
// `null` means the player picked 건너뛰기 — no modifier applied.
export function applyArcana(arcana, loadout) {
  if (!arcana) return;
  loadout.arcana = arcana;
  arcana.bonus(loadout.meta);
  const eff = arcana.effect || {};
  if (eff.onKill) loadout.onKill.push(eff.onKill);
  if (eff.tag) {
    loadout.arcanaTag = loadout.arcanaTag || {};
    loadout.arcanaTag[eff.tag] = true;
  }
}
