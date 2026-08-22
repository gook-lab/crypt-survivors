// Level-up choices — generates and applies the upgrade picks.
//
// Candidates: levelling an owned weapon/passive/spirit, or acquiring a new
// one (up to the slot caps). The pack's weapon model is basic + legendary —
// legendaries drop from boss chests, so there is no evolution path here.

import { WEAPONS, BASE_WEAPONS } from './content/weapons.js';
import { PASSIVES } from './content/passives.js';
import { SPIRITS, SPIRIT_IDS, SPIRIT_SLOTS, SPIRIT_FUSIONS, detectFusion } from './content/spirits.js';
import { EVOLUTIONS } from './content/evolutions.js';

// VS는 6 slots — 우리는 10분 게임이라 5가 sweet spot.
// 빌드 자유도: 4→5 변경으로 evolution 1-2개 박혀도 실험 슬롯 1개 남음.
const WEAPON_SLOTS = 5;
const PASSIVE_SLOTS = 5;

// roll weights — passives used to outweigh weapons 2.4× so range/duration/magnet
// util cards appeared often. After the monster-density bump, players reported
// "기술이 안 나온다" (weapons rarely show up) — passives were drowning out the
// skill pool. Trimmed to 1.6 so weapons surface more often without erasing the
// passive bias entirely.
const W_WEAPON = 1;
const W_PASSIVE = 1.6;
const W_SPIRIT = 1;

// Class affinity — heroes don't lock other weapons out, but their preferred
// element/style appears more often in the weapon-new roll. Multipliers:
//   1.6× when the weapon shares a preferred tag (signature class weapons)
//   0.92× when the weapon shares no preferred tag (cross-class still appears)
// keep all tags lowercase to match the weapon `tags` arrays.
// Penalty softened 0.7 → 0.85 → 0.92 (2026-05-23 P2 fix): users reported
// "빌드 다양성이 안 나온다" after the 5-slot expansion. The narrower the
// weapon-new window, the more affinity penalty starved cross-class picks.
// 0.92 still favours signature weapons (1.6 / 0.92 ≈ 1.74× signature lead)
// but lets non-signature elements appear ~36% more often than at 0.85.
const CLASS_AFFINITY = {
  knight:   ['holy', 'nature'],
  warrior:  ['physical'],
  huntress: ['physical', 'nature'],
  mage:     ['arcane', 'ice', 'fire', 'lightning', 'shadow'],
};
const AFFINITY_BONUS = 1.6;
const AFFINITY_PENALTY = 0.92;

function affinityMult(loadout, def) {
  // Class-neutral weapons (utility / buff auras) ignore affinity entirely —
  // every hero rolls them at base weight so the shared pool stays consistent
  // across classes. Build variety relies on these crossing class boundaries.
  if (def.classNeutral) return 1;
  const heroId = loadout.hero?.id;
  const prefer = CLASS_AFFINITY[heroId];
  if (!prefer || !def.tags || !def.tags.length) return 1;
  for (const t of def.tags) {
    if (prefer.includes(t)) return AFFINITY_BONUS;
  }
  return AFFINITY_PENALTY;
}

// Format the next-level perk for a weapon-up choice so the levelup card
// shows the player what they're unlocking (instead of bare "Lv 2 → 3").
function nextPerkDesc(def, lvl) {
  const next = def.skills?.find((s) => s.lvl === lvl + 1);
  if (next) return `Lv ${lvl}→${lvl + 1} · ${next.name}`;
  return `무기 레벨 ${lvl} → ${lvl + 1}`;
}

// All evolution recipes for a weapon id (multi-path supported — e.g. holywater
// pairs with `vigor` AND `regen2`). Returns rich objects so callers can show
// the pair name in Korean and whether the player owns it. P3 fix: the
// levelup card needs to tell the player "곧 진화 (페어 패시브: X 보유)" — not
// just "EVOLUTION".
function evolutionPathsFor(weaponId, loadout) {
  const out = [];
  for (const r of EVOLUTIONS) {
    if (r.from !== weaponId) continue;
    const passiveDef = PASSIVES[r.passive];
    const owned = (loadout.passives[r.passive] || 0) >= 1;
    const legendaryDef = WEAPONS[r.to];
    out.push({
      passive: r.passive,
      passiveName: passiveDef ? passiveDef.name : r.passive,
      owned,
      to: r.to,
      toName: legendaryDef ? legendaryDef.name : r.to,
    });
  }
  return out;
}

// Summarise evolution state for a weapon-up choice. `ready` means picking
// this choice would max the weapon AND a paired passive is already owned —
// the next evolveCheck will fuse them. `available` means a paired passive
// is owned but the weapon isn't yet at maxLevel; still useful to tell the
// player "keep levelling — this fuses". `dormant` means no paired passive
// is owned but recipes exist — show which passives unlock the path.
function evolutionSummary(weaponId, currentLvl, loadout) {
  const def = WEAPONS[weaponId];
  if (!def) return null;
  const paths = evolutionPathsFor(weaponId, loadout);
  if (paths.length === 0) return null;
  const ownedPath = paths.find((p) => p.owned) || null;
  const willMaxThisPick = currentLvl + 1 >= def.maxLevel;
  const alreadyMaxed = currentLvl >= def.maxLevel;
  const ready = ownedPath && (willMaxThisPick || alreadyMaxed);
  return {
    paths,
    ownedPath,
    ready,
    available: !!ownedPath && !ready,
    willMaxThisPick,
  };
}

// New-weapon path preview: if any owned passive matches an evolution recipe
// for this weapon, the player will fuse on max. Used by weapon-new cards to
// tell the player "이 무기를 얻으면 진화 path 열림 (페어 패시브 보유 중)".
function newWeaponPreview(weaponId, loadout) {
  const paths = evolutionPathsFor(weaponId, loadout);
  if (paths.length === 0) return null;
  const ownedPath = paths.find((p) => p.owned) || null;
  return { paths, ownedPath };
}

function candidates(loadout) {
  const list = [];

  for (const id in loadout.weapons) {
    const def = WEAPONS[id];
    const lvl = loadout.weapons[id];
    if (def && lvl < def.maxLevel) {
      list.push({
        kind: 'weapon-up', id, name: def.name,
        desc: nextPerkDesc(def, lvl),
        weight: W_WEAPON,
        // P3 fix: stamp evolution intel so levelup.js can show
        // "✦ 진화 직전 (페어: 활력)" instead of a generic EVOLUTION badge.
        evolution: evolutionSummary(id, lvl, loadout),
      });
    }
  }

  for (const id in loadout.passives) {
    const def = PASSIVES[id];
    const lvl = loadout.passives[id];
    if (def && lvl < def.maxLevel) {
      list.push({ kind: 'passive-up', id, name: def.name, desc: `${def.desc} (Lv ${lvl}→${lvl + 1})`, weight: W_PASSIVE });
    }
  }

  if (Object.keys(loadout.weapons).length < WEAPON_SLOTS) {
    const pool = BASE_WEAPONS.slice();
    // the hero's exclusive weapon joins only this hero's roll pool
    if (loadout.exclusiveWeapon) pool.push(loadout.exclusiveWeapon);
    for (const id of pool) {
      const def = WEAPONS[id];
      if (def && !loadout.weapons[id]) {
        const preview = newWeaponPreview(id, loadout);
        list.push({
          kind: 'weapon-new', id,
          name: def.name + ' (신규)',
          desc: '새 무기 획득',
          weight: W_WEAPON * affinityMult(loadout, def),
          newPreview: preview,
        });
      }
    }
  }

  if (Object.keys(loadout.passives).length < PASSIVE_SLOTS) {
    for (const id in PASSIVES) {
      if (!loadout.passives[id]) {
        // Surface which owned weapons this passive would push toward an
        // evolution path. Lets the player pick passives intentionally.
        const unlocks = [];
        for (const r of EVOLUTIONS) {
          if (r.passive !== id) continue;
          if (!loadout.weapons[r.from]) continue;
          const fromDef = WEAPONS[r.from];
          const toDef = WEAPONS[r.to];
          unlocks.push({
            from: r.from,
            fromName: fromDef ? fromDef.name : r.from,
            to: r.to,
            toName: toDef ? toDef.name : r.to,
          });
        }
        list.push({
          kind: 'passive-new', id,
          name: PASSIVES[id].name + ' (신규)',
          desc: PASSIVES[id].desc,
          weight: W_PASSIVE,
          evolutionUnlocks: unlocks.length ? unlocks : null,
        });
      }
    }
  }

  for (const id in loadout.spirits) {
    const def = SPIRITS[id];
    const tier = loadout.spirits[id];
    if (def && tier < def.maxTier) {
      list.push({ kind: 'spirit-up', id, name: '✦ ' + def.name, desc: `정령 ${tier}→${tier + 1}단계`, weight: W_SPIRIT });
    }
  }

  if (Object.keys(loadout.spirits).length < SPIRIT_SLOTS) {
    for (const id of SPIRIT_IDS) {
      if (!loadout.spirits[id]) {
        // mark this candidate if picking it would complete a fusion recipe —
        // levelup.js reads `fusionTo` to badge the card "✦ 융합"
        const fusionTo = SPIRIT_FUSIONS.find((r) =>
          (r.from[0] === id && loadout.spirits[r.from[1]])
          || (r.from[1] === id && loadout.spirits[r.from[0]]),
        );
        list.push({
          kind: 'spirit-new', id, weight: W_SPIRIT,
          name: SPIRITS[id].name + (fusionTo ? ' — 융합' : ' (신규)'),
          desc: fusionTo
            ? '+ 기존 정령과 결합해 ' + (SPIRITS[fusionTo.id]?.name || '특수 정령') + '으로 진화한다'
            : SPIRITS[id].desc,
          fusionTo: fusionTo ? fusionTo.id : null,
        });
      }
    }
  }

  return list;
}

// Roll `count` weighted choices without replacement. Falls back to a heal
// when nothing is left.
export function rollChoices(rng, count, loadout) {
  const rest = candidates(loadout);
  const out = [];
  while (out.length < count && rest.length > 0) {
    let total = 0;
    for (let i = 0; i < rest.length; i++) total += rest[i].weight || 1;
    let r = rng.next() * total;
    let idx = rest.length - 1;
    for (let i = 0; i < rest.length; i++) {
      r -= rest[i].weight || 1;
      if (r <= 0) { idx = i; break; }
    }
    out.push(rest.splice(idx, 1)[0]);
  }
  if (out.length === 0) {
    out.push({ kind: 'heal', name: '회복', desc: '체력을 가득 회복' });
  }
  return out;
}

export function applyChoice(choice, loadout, player) {
  switch (choice.kind) {
    case 'weapon-up':
      loadout.weapons[choice.id] += 1;
      break;
    case 'weapon-new':
      loadout.weapons[choice.id] = 1;
      break;
    case 'passive-up':
      loadout.passives[choice.id] += 1;
      break;
    case 'passive-new':
      loadout.passives[choice.id] = 1;
      break;
    case 'spirit-new':
      loadout.spirits[choice.id] = 1;
      tryFuseSpirits(loadout);
      break;
    case 'spirit-up':
      loadout.spirits[choice.id] += 1;
      break;
    case 'heal':
      player.hp = player.maxHp;
      return;
  }
  loadout.recompute();
  // sync the player's max hp with the derived value (vigor) and heal the gain
  if (player.maxHp !== loadout.maxHp) {
    const gain = loadout.maxHp - player.maxHp;
    player.maxHp = loadout.maxHp;
    if (gain > 0) player.hp = Math.min(player.maxHp, player.hp + gain);
  }
}

// Owning both ingredients of a spirit fusion recipe collapses them into the
// fused result spirit at the higher tier. Returns the fused recipe (so main
// can fire a toast) or null. Idempotent — won't re-trigger an existing fuse.
export function tryFuseSpirits(loadout) {
  const fused = detectFusion(loadout.spirits);
  if (!fused) return null;
  const { recipe, tier } = fused;
  delete loadout.spirits[recipe.from[0]];
  delete loadout.spirits[recipe.from[1]];
  loadout.spirits[recipe.id] = tier;
  loadout.lastFusion = recipe.id; // main reads + clears this to toast
  return recipe;
}
