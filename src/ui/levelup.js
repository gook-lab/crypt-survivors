// Level-up picker (HTML/CSS overlay).
//
// Shows the upgrade choices as a row of designed cards — each with an icon,
// a kind badge (무기 / 패시브 / 정령 / 회복) and a colour-coded border. The
// game is paused while it is open (the loop gates the sim on state). A card
// is chosen by click or by number key; the pick is handed back via callback.

import { WEAPONS } from '../content/weapons.js';
import { SPIRITS } from '../content/spirits.js';
import { EVOLUTIONS } from '../content/evolutions.js';
import { weaponAssetUrl } from '../util/weaponAssets.js';
import { SIG_ASSETS } from '../util/sigAssets.js';

// kind -> badge label + theme colour
const KIND = {
  'weapon-up': { tag: '무기 강화', color: '#f0d27a' },
  'weapon-new': { tag: '새 무기', color: '#f0d27a' },
  'passive-up': { tag: '패시브 강화', color: '#6fb4dc' },
  'passive-new': { tag: '새 패시브', color: '#6fb4dc' },
  'spirit-up': { tag: '정령 성장', color: '#88e0c0' },
  'spirit-new': { tag: '새 정령', color: '#88e0c0' },
  heal: { tag: '회복', color: '#e0584a' },
};

// Pattern -> Korean label. Shown as a small chip on weapon cards so the
// player can read "what kind of weapon is this" at glance, before picking.
// Resolves P4 framing — users were surprised by aoe-pattern weapons (성수)
// reading as drop attacks because nothing on the card said so.
const PATTERN_LABEL = {
  aoe: 'AoE 강하',
  rain: '낙뢰',
  pull: '인력 소용돌이',
  orbit: '공전',
  fan: '부채꼴',
  ring: '전방위',
  boomerang: '회귀',
  arc_burst: '포물선',
  bezier_strike: '유도 파동',
  aura_buff: '오라',
  chain: '연쇄',
};
function patternLabelFor(def) {
  if (!def) return null;
  if (def.kind === 'melee') return '근접 베기';
  return PATTERN_LABEL[def.pattern] || null;
}

// the sprite clip that represents a choice
function iconKey(choice) {
  const kind = choice.kind || '';
  if (kind === 'heal') return 'pickup_heart';
  if (!choice.id) return null;
  if (kind.indexOf('weapon') === 0) {
    const w = WEAPONS[choice.id];
    return w ? w.icon || w.sprite : null;
  }
  if (kind.indexOf('passive') === 0) return 'icon_' + choice.id;
  if (kind.indexOf('spirit') === 0) {
    const s = SPIRITS[choice.id];
    // spirits expose tiered sprites in a `sprites` array; pick the tier-1 art
    return s ? (s.sprites && s.sprites[0]) || s.sprite || s.icon : null;
  }
  return null;
}

// PixelLab PNG URL for a weapon-kind choice — mirror arsenal.js fallback
// chain: effectAsset (animated sigAsset) → weaponAssets static PNG → null.
// Returns { url, isAnimated, frames, fps } or null.
function weaponPixelLabAsset(choice) {
  const kind = choice.kind || '';
  if (kind.indexOf('weapon') !== 0 || !choice.id) return null;
  const w = WEAPONS[choice.id];
  if (!w) return null;
  if (w.effectAsset && SIG_ASSETS[w.effectAsset]) {
    const a = SIG_ASSETS[w.effectAsset];
    if (a.frames && a.frames.length) {
      return { url: a.frames[0], isAnimated: true, frames: a.frames, fps: a.fps || 12 };
    }
    if (a.url) return { url: a.url, isAnimated: false };
  }
  const u = weaponAssetUrl(w.sprite);
  if (u) return { url: u, isAnimated: false };
  return null;
}

export function createLevelUp(mount) {
  const el = document.createElement('div');
  el.className = 'levelup hidden';
  mount.appendChild(el);

  let choices = [];
  let onPick = null;

  // a crisp upscaled icon canvas (~48 px) from a sprite clip
  function iconCanvas(name) {
    const cv = document.createElement('canvas');
    cv.className = 'lvl-icon';
    const SPR = window.SPRITES || {};
    if (name && SPR[name] && window.AtlasBuilder) {
      const src = window.AtlasBuilder.renderFrame(name, 0);
      const z = Math.max(1, Math.round(48 / src.width));
      cv.width = src.width * z;
      cv.height = src.height * z;
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, 0, 0, cv.width, cv.height);
    } else {
      cv.width = 48;
      cv.height = 48;
    }
    return cv;
  }

  // Returns: 'ready' (페어 패시브 보유 + 이번 픽으로 max) | 'available' (페어 보유) |
  // 'dormant' (recipe 있음, 페어 미보유) | null (recipe 없음).
  // choice.evolution / choice.newPreview / choice.evolutionUnlocks come from
  // choices.js candidates() and already encode loadout state — preferred over
  // the legacy EVOLUTIONS scan because they know about multi-path recipes.
  function detectEvolutionState(choice) {
    if (choice.kind === 'weapon-up') {
      const ev = choice.evolution;
      if (!ev || !ev.paths || !ev.paths.length) return null;
      if (ev.ready) return 'ready';
      if (ev.available) return 'available';
      return 'dormant';
    }
    if (choice.kind === 'weapon-new') {
      const pv = choice.newPreview;
      if (!pv || !pv.paths || !pv.paths.length) return null;
      return pv.ownedPath ? 'available' : 'dormant';
    }
    if (choice.kind === 'passive-new' || choice.kind === 'passive-up') {
      if (choice.evolutionUnlocks && choice.evolutionUnlocks.length) return 'available';
      return null;
    }
    return null;
  }

  // Build a short Korean string describing the evolution context, e.g.
  // "✦ 진화 직전 — 활력 페어 보유" or "페어: 활력 / 재생 중 1개 필요".
  function evolutionHintText(choice, state) {
    if (state === null) return null;
    if (choice.kind === 'weapon-up') {
      const ev = choice.evolution;
      if (state === 'ready') {
        return `✦ 진화 직전 — ${ev.ownedPath.passiveName} 페어 보유 (${ev.ownedPath.toName})`;
      }
      if (state === 'available') {
        return `진화 path 준비됨 — ${ev.ownedPath.passiveName} 보유 (${ev.ownedPath.toName})`;
      }
      // dormant — list paths
      const names = ev.paths.map((p) => p.passiveName).join(' / ');
      return `진화 path — 페어 ${names} 중 1개 필요`;
    }
    if (choice.kind === 'weapon-new') {
      const pv = choice.newPreview;
      if (pv.ownedPath) {
        return `진화 path 활성 — ${pv.ownedPath.passiveName} 보유 (${pv.ownedPath.toName})`;
      }
      const names = pv.paths.map((p) => p.passiveName).join(' / ');
      return `진화 path — 페어 ${names} 중 1개 필요`;
    }
    if (choice.kind === 'passive-new' || choice.kind === 'passive-up') {
      const arr = choice.evolutionUnlocks || [];
      if (!arr.length) return null;
      const previews = arr.slice(0, 2).map((u) => `${u.fromName}→${u.toName}`);
      const suffix = arr.length > 2 ? ` 외 ${arr.length - 2}개` : '';
      return `★ 진화 잠금 해제: ${previews.join(', ')}${suffix}`;
    }
    return null;
  }

  // Legacy boolean — kept for code paths that just check "has any recipe".
  function detectEvolution(choice) {
    return detectEvolutionState(choice) !== null;
  }

  function show(list, cb, opts) {
    choices = list;
    onPick = cb;
    const tokens = (opts && opts.tokens) || {};
    const reroll = tokens.reroll || 0;
    const skip = tokens.skip || 0;
    el.innerHTML = `
      <div class="levelup-panel">
        <h2 class="levelup-title">레벨 업</h2>
        <div class="levelup-cards"></div>
        <div class="levelup-actions">
          <button class="lvl-action" id="lvl-reroll" ${reroll > 0 ? '' : 'disabled'}>리롤 (${reroll})</button>
          <button class="lvl-action" id="lvl-skip" ${skip > 0 ? '' : 'disabled'}>스킵 (${skip})</button>
        </div>
        <p class="levelup-hint">클릭 또는 1·2·3 키 · R 리롤 · X 스킵</p>
      </div>`;
    el.querySelector('#lvl-reroll').addEventListener('click', () => {
      if (reroll > 0 && opts && opts.onReroll) opts.onReroll();
    });
    el.querySelector('#lvl-skip').addEventListener('click', () => {
      if (skip > 0 && opts && opts.onSkip) opts.onSkip();
    });
    const row = el.querySelector('.levelup-cards');
    list.forEach((u, i) => {
      const k = KIND[u.kind] || { tag: '', color: '#f0d27a' };
      const card = document.createElement('button');
      card.className = 'lvl-card';
      card.dataset.i = String(i);
      card.style.borderColor = k.color;

      // Evolution state — 'ready' (about to fuse) > 'available' (pair owned)
      // > 'dormant' (recipe exists, pair missing) > null. Drives both the
      // card shimmer and the badge text.
      const evoState = detectEvolutionState(u);
      // shimmer only when the player can act on it now — dormant recipes get
      // text-only hint so the card doesn't shimmer for every base weapon.
      if (evoState === 'ready' || evoState === 'available') card.classList.add('has-evo');
      // spirit-new with a fusion partner already owned — same shimmer
      // affordance as a weapon evolution so the fusion moment reads big
      if (u.fusionTo) card.classList.add('has-evo');

      card.innerHTML = `
        <span class="lvl-key">${i + 1}</span>
        <span class="lvl-kind" style="background:${k.color}">${k.tag}</span>`;

      // Add state badge — keep the existing NEW / EVOLUTION badge slot, but
      // upgrade EVOLUTION to ✦ 진화 직전 when ready, and skip it for dormant.
      if (u.kind.endsWith('-new') && evoState !== 'available') {
        const badge = document.createElement('span');
        badge.className = 'lvl-state lvl-state-new';
        badge.textContent = 'NEW';
        card.appendChild(badge);
      } else if (evoState === 'ready') {
        const badge = document.createElement('span');
        badge.className = 'lvl-state lvl-state-evo';
        badge.textContent = '✦ 진화 직전';
        card.appendChild(badge);
      } else if (evoState === 'available') {
        const badge = document.createElement('span');
        badge.className = 'lvl-state lvl-state-evo';
        badge.textContent = 'EVOLUTION';
        card.appendChild(badge);
      }

      // Pattern chip — shown on weapon choices so the player reads "AoE
      // 강하 / 낙뢰 / 공전 …" before picking. Resolves P4 framing where
      // aoe-pattern weapons (성수) looked like ordinary projectiles on
      // the card.
      if (u.kind && u.kind.indexOf('weapon') === 0 && u.id) {
        const wDef = WEAPONS[u.id];
        const label = patternLabelFor(wDef);
        if (label) {
          const chip = document.createElement('span');
          chip.className = 'lvl-pattern';
          chip.textContent = label;
          card.appendChild(chip);
        }
      }

      // PixelLab PNG path takes priority for weapon choices; fall back to
       // the ASCII canvas so passive / spirit / heal still render via SPRITES.
       const pixAsset = weaponPixelLabAsset(u);
       if (pixAsset) {
         const img = document.createElement('img');
         img.src = pixAsset.url;
         img.className = 'lvl-icon';
         img.style.cssText = 'image-rendering: pixelated; width: 48px; height: 48px; object-fit: contain;';
         if (pixAsset.isAnimated && pixAsset.frames.length > 1) {
           let i = 0;
           const interval = 1000 / pixAsset.fps;
           const handle = setInterval(() => {
             if (!img.isConnected) { clearInterval(handle); return; }
             i = (i + 1) % pixAsset.frames.length;
             img.src = pixAsset.frames[i];
           }, interval);
         }
         card.appendChild(img);
       } else {
         card.appendChild(iconCanvas(iconKey(u)));
       }
      const nm = document.createElement('span');
      nm.className = 'lvl-name';
      nm.textContent = u.name;
      const ds = document.createElement('span');
      ds.className = 'lvl-desc';
      ds.textContent = u.desc;
      card.appendChild(nm);
      card.appendChild(ds);

      // Evolution hint line — small, gold-tinted text under desc. Tells the
      // player which paired passive completes the recipe (and whether they
      // already own it). Only renders when an evolution recipe exists.
      const evoText = evolutionHintText(u, evoState);
      if (evoText) {
        const ev = document.createElement('span');
        ev.className =
          'lvl-evo-hint' +
          (evoState === 'ready' ? ' lvl-evo-hint-ready'
            : evoState === 'available' ? ' lvl-evo-hint-avail'
            : ' lvl-evo-hint-dormant');
        ev.textContent = evoText;
        card.appendChild(ev);
      }

      card.addEventListener('click', () => pick(i));
      row.appendChild(card);
    });
    el.classList.remove('hidden');
  }

  function pick(i) {
    if (!onPick || i < 0 || i >= choices.length) return;
    const chosen = choices[i];
    const cb = onPick;
    onPick = null;
    el.classList.add('hidden');
    cb(chosen);
  }

  function hide() {
    onPick = null;
    el.classList.add('hidden');
  }

  return { show, pick, hide, isOpen: () => !el.classList.contains('hidden') };
}
