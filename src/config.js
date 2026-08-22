// Game constants. v1 has one character + one stage, so these live inline
// as constants (eng-review D1). They graduate to content/ data files once
// there are 2+ of something.

export const VIEW = { width: 1280, height: 720 };

// Fixed-timestep simulation (eng-review D3).
export const FIXED_DT = 1 / 60; // seconds per sim step
export const MAX_UPDATES_PER_FRAME = 5; // spiral-of-death clamp

// Survival gold bonus — gold awarded at run end per second survived, added
// before goldMult so Greed boosts it too. Rewards pushing deeper instead of
// only farming kills, and lifts the gold income of mediocre runs (the median
// run dies early, so kill-gold alone is thin). 5/s → ~3000 over a 10:00 run,
// ~1300 over a 4:00 run. Tune here; the balance harness mirrors it.
export const SURVIVAL_GOLD_PER_SEC = 5;

// Invulnerability window after taking contact damage — turns a swarm from an
// instant kill into survivable periodic hits (VS-style). Balance pass S6.
export const IFRAME = 0.7; // seconds

export const PLAYER = {
  speed: 185, // px/sec
  radius: 13,
  maxHp: 100,
  magnet: 120, // base pickup-attraction radius (Session 3 checkpoint: 72 left
  // too many gems on the field — leveling never landed in a normal run)
  color: 0x8fb4dc, // steel-blue — the knight
  // Innate regen floor (HP/s). Early-death analysis: weak builds die to
  // GRADUAL chip from intermittent swarm contact (~1 hit / 2-3s) with zero
  // recovery — a death spiral. Base regen offsets the chip so a struggling
  // build bleeds out far slower. Negligible for strong builds (near full).
  // Stacks on meta `recovery` + regen2 passive. Tuned with PLAYER_BUBBLE
  // (collision.js) via 24-seed sweep: 0.8/7 → 42% early-death; 1.6/14 → 13%;
  // 2.5/20 → 17% but too easy (median 8min). 1.6/14 crushes the bipolar tail
  // without inflating clears. Tune here; harness measures it.
  regen: 1.6,
};

// Enemy types (medieval theme). `xp` is the gem worth on death; `gold` feeds
// the run's gold tally. Keys are internal ids — the flavour is the colour
// (skeleton bone, goblin green, ogre red-brown, bat purple) until sprites land.
export const ENEMIES = {
  walker: { speed: 56, radius: 12, maxHp: 22, damage: 7, xp: 1, gold: 1, color: 0xd8d2c0 }, // 해골
  runner: { speed: 108, radius: 9, maxHp: 12, damage: 6, xp: 1, gold: 1, color: 0x6fae4a }, // 좀비
  brute: { speed: 34, radius: 19, maxHp: 56, damage: 15, xp: 4, gold: 2, color: 0x8f4a32 }, // 오우거
  bat: { speed: 128, radius: 7, maxHp: 8, damage: 4, xp: 1, gold: 1, color: 0x6a5a96 }, // 박쥐 — fast swarmer (148→128, 약 -14%)
  elite: { speed: 78, radius: 13, maxHp: 96, damage: 19, xp: 7, gold: 4, color: 0xb060c8 }, // 정예
  spider: { speed: 118, radius: 9, maxHp: 16, damage: 6, xp: 2, gold: 1, color: 0x6a5a48 }, // 거미 — fast (138→118)
  slime: { speed: 38, radius: 12, maxHp: 46, damage: 9, xp: 3, gold: 1, color: 0x5aa86a }, // 슬라임
  chimera: { speed: 64, radius: 16, maxHp: 150, damage: 24, xp: 10, gold: 6, color: 0xc06a3a }, // 키메라
  // forest biome
  wolf: { speed: 112, radius: 10, maxHp: 20, damage: 8, xp: 2, gold: 1, color: 0x8a7a64 }, // 늑대 (130→112)
  goblin: { speed: 84, radius: 9, maxHp: 24, damage: 7, xp: 2, gold: 1, color: 0x6fae4a }, // 고블린
  hornet: { speed: 138, radius: 7, maxHp: 10, damage: 5, xp: 1, gold: 1, color: 0xe0c040 }, // 말벌 — fast (162→138)
  // swamp biome
  frog: { speed: 72, radius: 10, maxHp: 30, damage: 9, xp: 2, gold: 1, color: 0x5a9a4a }, // 두꺼비
  bog_zombie: { speed: 36, radius: 12, maxHp: 68, damage: 14, xp: 4, gold: 2, color: 0x6a7a4a }, // 늪 좀비
  wisp: { speed: 128, radius: 8, maxHp: 14, damage: 7, xp: 2, gold: 1, color: 0x9ad0c0 }, // 도깨비불 — fast (148→128)
  // volcano biome
  imp: { speed: 100, radius: 9, maxHp: 28, damage: 10, xp: 3, gold: 1, color: 0xc8503a }, // 임프
  lava_slug: { speed: 30, radius: 12, maxHp: 80, damage: 12, xp: 4, gold: 2, color: 0xe07030 }, // 용암 민달팽이
  fire_bat: { speed: 146, radius: 8, maxHp: 14, damage: 8, xp: 2, gold: 1, color: 0xf07a3a }, // 화염 박쥐 — fast (170→146)
  // ice biome
  frost_wolf: { speed: 118, radius: 10, maxHp: 28, damage: 10, xp: 3, gold: 1, color: 0x9ac8e0 }, // 서리 늑대 (138→118)
  yeti: { speed: 40, radius: 16, maxHp: 144, damage: 22, xp: 9, gold: 5, color: 0xc8e0f0 }, // 예티
  ice_wraith: { speed: 106, radius: 9, maxHp: 22, damage: 10, xp: 3, gold: 2, color: 0x8fb4dc }, // 얼음 망령 (124→106)
  // ── new monsters (PixelLab pack) — wired before art lands so spawn.js's
  // `ENEMIES[name]` lookup never returns undefined when biome pools roll them
  giant_spider: { speed: 110, radius: 14, maxHp: 70, damage: 14, xp: 5, gold: 2, color: 0x6a4a8a }, // ch.1 거대 거미
  carrion_crow: { speed: 122, radius: 8, maxHp: 14, damage: 6, xp: 1, gold: 1, color: 0x4a4060 }, // ch.1 시체까마귀 (142→122)
  bog_leech: { speed: 62, radius: 11, maxHp: 52, damage: 10, xp: 3, gold: 1, color: 0x5a7a4a }, // ch.3 늪 거머리 (burst)
  carnivore_plant: { speed: 22, radius: 14, maxHp: 110, damage: 18, xp: 6, gold: 3, color: 0x4a8a4a }, // ch.3 식인꽃 (ranged)
  magma_golem: { speed: 36, radius: 18, maxHp: 140, damage: 20, xp: 8, gold: 4, color: 0xc8503a }, // ch.4 마그마 골렘
  ice_golem: { speed: 42, radius: 17, maxHp: 130, damage: 19, xp: 8, gold: 4, color: 0x9ac8e0 }, // ch.5 얼음 골렘
  void_walker: { speed: 78, radius: 11, maxHp: 38, damage: 12, xp: 4, gold: 2, color: 0x6a4a90 }, // ch.6 공허 워커
  void_drifter: { speed: 118, radius: 9, maxHp: 22, damage: 9, xp: 3, gold: 2, color: 0xa080d0 }, // ch.6 공허 정찰자 (ranged)
  // ── Phase D 신규 몬스터 (ch.1 던전) ───────────────────────────────────
  bone_archer: { speed: 70, radius: 10, maxHp: 58, damage: 12, xp: 5, gold: 3, color: 0xc8c0a0 }, // 해골 궁수 (elite, ranged)
  grave_hound: { speed: 122, radius: 9, maxHp: 18, damage: 8, xp: 2, gold: 1, color: 0xb0a890 }, // 망자의 사냥개 (basic, charge)
  // ── 행동 아키타입 확장 (2026-05-29) — reskins of existing clips (art deferred);
  // the behaviour comes from bestiary.js (ability / movePattern / summonType).
  medusa_head: { speed: 92, radius: 8, maxHp: 16, damage: 7, xp: 2, gold: 1, color: 0x9a7ad0 }, // 메두사 머리 (weave)
  powder_skeleton: { speed: 92, radius: 9, maxHp: 18, damage: 10, xp: 2, gold: 1, color: 0xd0a040 }, // 화약 해골 (kamikaze)
  brood_mother: { speed: 60, radius: 15, maxHp: 90, damage: 14, xp: 6, gold: 3, color: 0x7a5a8a }, // 어미 거미 (elite, summoner — 새끼 거미)
  necromancer: { speed: 56, radius: 12, maxHp: 70, damage: 10, xp: 7, gold: 4, color: 0x70b050 }, // 강령술사 (elite, summoner)
  war_drummer: { speed: 70, radius: 11, maxHp: 60, damage: 9, xp: 6, gold: 3, color: 0xc85050 }, // 전쟁 고수 (elite, buffer)
  rune_guardian: { speed: 38, radius: 16, maxHp: 120, damage: 18, xp: 7, gold: 4, color: 0x9ac8e0 }, // 룬 가디언 (elite, shielded)
  revenant: { speed: 70, radius: 11, maxHp: 64, damage: 13, xp: 6, gold: 3, color: 0x8fa0d8 }, // 원귀 (elite, orbit_strafe + ranged)
  reaper: { speed: 168, radius: 18, maxHp: 880, damage: 40, xp: 20, gold: 50, color: 0x2a2a3a }, // 사신 (time-gate panic spawn)
};

// Bosses — a single tough enemy that arrives on a timer (BOSS.firstMinute,
// then every BOSS.intervalMinute). Killing one always drops a treasure chest
// (the legendary-weapon reward). Each boss carries its own 32x32 sprite.
export const BOSS = {
  firstMinute: 2.5, // first boss arrives at 2:30 — was 2:00. Real-play showed
                    // 2:00 hit before most builds had 3+ weapons; +30s lets the
                    // weapon-card stream develop enough DPS to challenge cleanly.
  intervalMinute: 2.5, // and every 2.5 min after
  hp: 850, // base HP — was 1000. Real-play tune: opening boss too tanky vs the
           // available DPS at 2:30 Lv 6-8. Drops 2:30 boss to ~2,295 HP (was
           // 2,700 at 2:00) — still meaty, no longer a wall.
  hpPerMinute: 0.75, // HP grows with run time — was 0.85. Curve gentler so the
                     // *first* boss is the dodgeable one and *late* bosses
                     // ramp via levelScale (which only activates at Lv 22+).
  // Player-level coupling — VS-style "HP × level". Conservative 0.06 start
  // (Lv 30 ≈ 1.8×, Lv 50 ≈ 3×). Raise to 0.07/0.08 after balance.js if too soft.
  hpPerLevel: 0.06,
  damage: 22,
  speed: 44,
  radius: 40,
  xp: 40,
  gold: 60,
  // sprite clip -> display name; bosses cycle through this list in order
  roster: [
    // ordered so the first boss uses the gentlest kit (ring); the harshest
    // (aimed) shows up later when the player has more levels under them
    { sprite: 'boss_skeleton_king', name: '해골 군주' },
    { sprite: 'boss_demon', name: '심연 마룡' },
    { sprite: 'boss_vampire', name: '흡혈 백작' },
    { sprite: 'boss_idle', name: '망령 리치' },
  ],
};

export const SPAWN = {
  radius: 720, // ring distance from player (just off the 1280x720 view)
  maxEnemies: 500, // soft safety cap — was 400, matched to VS cap for fuller screens
};

// Difficulty director — spawn rate, enemy mix and enemy hp scale over the
// elapsed run time. Data-driven so tuning the curve never touches engine code.
// (Balance pass S6: baseRate halved so the early game has breathing room;
// ratePerMinute raised so the late game still escalates hard.)
export const DIRECTOR = {
  baseRate: 0.95, // enemies/sec at t=0
  ratePerMinute: 1.45, // added enemies/sec per elapsed minute
  // HP curve — pair of dials. timeScale grows with elapsed minutes; levelScale
  // couples enemy HP to player level (VS-style). Time dial gentler now (0.55→0.32)
  // because level dial picks up the slack — strong builds → strong enemies.
  // Lv 1 → levelScale floor = 1 (early-game one-shots preserved).
  // Lv 30 → levelScale ≈ 1.35 ; Lv 50 → ≈ 2.25.
  // Slot 4→5 expansion (2026-05-22): build widening dilutes per-weapon DPS;
  // weak builds were dying ~45s in playtest with hpPerMinute=0.32. Softened
  // 0.32→0.24 so the time dial doesn't run away from split builds — and
  // hpPerLevel 0.045→0.030 keeps the floor forgiving for low-level players
  // (Lv 10 builds stay near levelScale=1.0 so the time dial dominates there).
  hpPerMinute: 0.20, // was 0.24 — 24seed 밸런스 패스(2026-05-29): 10분 생존
                     // 17%→21%로 healthy band(20-60%) 진입, median 변화 거의
                     // 없음(369→368s)=난이도 곡선 유지. 0.16(29%)은 kiting AI
                     // 대비 실플레이어엔 과해질 수 있어 보수적으로 0.20 선택.
  hpPerLevel: 0.030, // was 0.045 — softer floor for split builds
  // Minimum on-screen enemy count (VS "minimum amount" buffer). When the world
  // dips below the active tier, the spawner burst-fills at <=8/frame until it
  // reaches the floor. Keeps the screen busy late-game even with kill volume.
  // Last-matching tier wins.
  // T6 tune iteration 2: no opening floor — let the continuous accumulator
  // ramp naturally for the first ~45s, then the floor takes over. Buffer's
  // job is preventing late-game cliffs, not stacking pressure on a Lv-1
  // hero. Aligns with VS Mad Forest's first-minute spawn interval of 1.0s.
  minEnemies: [
    { fromMinute: 0.75, min: 18 },
    { fromMinute: 2, min: 40 },
    { fromMinute: 4, min: 80 },
    { fromMinute: 7, min: 150 },
    { fromMinute: 11, min: 240 },
  ],
  tiers: [
    // each tier applies from `fromMinute` onward; later tiers override earlier
    { fromMinute: 0, weights: { walker: 1.0, runner: 0.15, brute: 0.05, bat: 0, elite: 0, spider: 0.1, slime: 0, chimera: 0 } },
    { fromMinute: 1, weights: { walker: 0.6, runner: 0.5, brute: 0.22, bat: 0.25, elite: 0, spider: 0.35, slime: 0.2, chimera: 0 } },
    { fromMinute: 3, weights: { walker: 0.4, runner: 0.6, brute: 0.5, bat: 0.5, elite: 0.15, spider: 0.5, slime: 0.4, chimera: 0.1 } },
    { fromMinute: 6, weights: { walker: 0.3, runner: 0.7, brute: 0.8, bat: 0.8, elite: 0.45, spider: 0.6, slime: 0.5, chimera: 0.4 } },
  ],
};

// Weapons are data-driven and live in content/weapons.js (eng-review
// premise #2) — the wand schema was extracted there once it felt right.

// XP gem dropped by a dying enemy.
export const GEM = { radius: 5, pull: 330, color: 0x49d0e0 };

// XP for the next level = baseXp + level*growth + level²*growth2. The
// quadratic term keeps early levels landing fast (≈ unchanged) while making
// late levels far costlier — balance pass: players were hitting Lv70+ by
// 10 min and trivially out-scaling the spawn curve.
// XP for next level = baseXp + level*growth + max(0, level-softCap)²*growth2.
// The piecewise curve lets Lv1-10 land fast (the early snowball is the fun
// part) and the quadratic kicks in only past Lv10 — so weapons take real
// time to max out late while the opening still feels rewarding.
//
// Early-game pacing (Lv 1-10): bumped baseXp 3→6, growth 2→4 to roughly
// double the XP needed per level. The original curve produced 4-5 level-ups
// in the first 60s of play, breaking flow with constant level-up modals.
// Now the first 10 levels need ~234 XP total (was 117) — still feels
// rewarding but reads as progression instead of a pop-up spam loop.
// Late game (Lv >10) unchanged — quadratic growth2 still scales aggressively.
export const LEVELING = { baseXp: 6, growth: 4, growth2: 0.55, softCap: 10 };
