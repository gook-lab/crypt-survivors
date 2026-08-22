// Arsenal page — a browsable showcase of every weapon (HTML overlay).
// Weapons grouped by tier (basic / hero-exclusive / legendary). Inside the
// basic tier, weapons are sub-bucketed by class affinity (knight / warrior /
// huntress / mage / shared) so the player can scan their class's roll pool
// without scrolling through 70+ entries.

import { WEAPONS } from '../content/weapons.js';
import { SIG_ASSETS } from '../util/sigAssets.js';
import { SIGNATURES } from '../content/signatures.js';
import { weaponAssetUrl } from '../util/weaponAssets.js';

// hero id → 한글 라벨 (signature 섹션의 영웅 표시용)
const HERO_KO = {
  mage: '마법사', knight: '기사', warrior: '전사', huntress: '사냥꾼',
  porta: '포르타', gennaro: '제나로', pasqualina: '파스쿠알리나',
};

const ICON_BOX = 48; // target canvas size — sized to fit .page-icon CSS cap

// Render a PixelLab effectAsset as an <img>. When `animate` is true, cycle
// frames at the asset's fps via setInterval. The interval auto-clears when
// the element leaves the DOM (we check parentNode each tick).
function effectImg(key, animate, sizePx) {
  const a = SIG_ASSETS[key];
  if (!a) return null;
  const frames = a.frames || (a.url ? [a.url] : null);
  if (!frames || !frames.length) return null;
  const img = document.createElement('img');
  img.src = frames[0];
  img.className = 'page-icon';
  img.style.cssText = `image-rendering: pixelated; width: ${sizePx}px; height: ${sizePx}px; object-fit: contain;`;
  if (animate && frames.length > 1) {
    let i = 0;
    const interval = 1000 / (a.fps || 12);
    const handle = setInterval(() => {
      if (!img.isConnected) { clearInterval(handle); return; }
      i = (i + 1) % frames.length;
      img.src = frames[i];
    }, interval);
  }
  return img;
}

// PixelLab projectile PNG (registered in weaponAssets.js) — same in-flight
// asset the renderer uses, so the arsenal preview matches what actually
// flies in-game. Cycles animated entries by sampling weaponAssetUrl with
// monotonic time. Returns null if the sprite isn't registered as a PNG.
function weaponAssetImg(spriteName, sizePx) {
  if (!spriteName) return null;
  const url0 = weaponAssetUrl(spriteName, 0);
  if (!url0) return null;
  const img = document.createElement('img');
  img.src = url0;
  img.className = 'page-icon';
  img.style.cssText = `image-rendering: pixelated; width: ${sizePx}px; height: ${sizePx}px; object-fit: contain;`;
  const t0 = performance.now();
  let lastUrl = url0;
  const handle = setInterval(() => {
    if (!img.isConnected) { clearInterval(handle); return; }
    const elapsed = (performance.now() - t0) / 1000;
    const next = weaponAssetUrl(spriteName, elapsed);
    if (next && next !== lastUrl) { img.src = next; lastUrl = next; }
  }, 1000 / 14);
  return img;
}

const TIER_GROUPS = [
  { tier: 'basic', label: '기본 무기' },
  { tier: 'exclusive', label: '영웅 전용 무기' },
  { tier: 'legendary', label: '전설 무기' },
];

const PATTERN_KO = {
  fan: '부채꼴', ring: '전방위', orbit: '궤도', boomerang: '부메랑', melee: '근접',
  aoe: '영역', rain: '낙하', pull: '인력', chain: '연쇄', summon: '소환',
};

// Pattern → CSS animation class for the static-sprite preview path.
// aoeKit weapons get a layered telegraph→drop→impact preview instead
// (see buildPreview below).
const PATTERN_PREVIEW = {
  fan: 'ars-fan',
  ring: 'ars-spin',
  orbit: 'ars-orbit',
  boomerang: 'ars-fan',
  melee: 'ars-melee',
  chain: 'ars-fan',
  rain: 'ars-spin',
  summon: 'ars-spin',
};

// Build a hover preview element for a weapon. For aoeKit weapons, layers
// three pieces (telegraph rune + drop body + radial impact) animated via
// CSS keyframes — keys nothing per-frame so the page stays cheap even with
// 70+ weapons. For other weapons, shows the projectile sprite enlarged with
// a pattern-appropriate motion (orbit / fan / spin / melee).
function buildPreview(w) {
  const wrap = document.createElement('div');
  wrap.className = 'ars-preview';
  if (w.aoeKit) {
    const kit = w.aoeKit;
    // Telegraph rune
    if (kit.telegraphAsset) {
      const t = document.createElement('img');
      t.className = 'ars-preview-tele';
      t.src = `/sigs/${kit.telegraphAsset}.png`;
      t.alt = '';
      wrap.appendChild(t);
    }
    // Drop body (skip for rain pattern — the projectile is the falling body)
    if (kit.dropAsset && !kit.rainSkipDrop) {
      const d = document.createElement('img');
      d.className = 'ars-preview-drop';
      d.src = `/sigs/${kit.dropAsset}.png`;
      d.alt = '';
      wrap.appendChild(d);
    }
    // Impact burst (CSS-only radial gradient, color comes from impactCore)
    const imp = document.createElement('div');
    imp.className = 'ars-preview-impact';
    // Tint the impact gradient if the weapon palette specifies a non-default core
    if (kit.impactCore || kit.impactMid) {
      const core = kit.impactCore ? '#' + kit.impactCore.toString(16).padStart(6, '0') : '#fff0c8';
      const mid = kit.impactMid ? '#' + kit.impactMid.toString(16).padStart(6, '0') : '#f08a2a';
      imp.style.background = `radial-gradient(circle, ${core} 0%, ${mid} 40%, transparent 70%)`;
    }
    wrap.appendChild(imp);
    const lab = document.createElement('div');
    lab.className = 'ars-preview-label';
    lab.textContent = 'sky-drop';
    wrap.appendChild(lab);
  } else if (w.effectAsset && SIG_ASSETS[w.effectAsset]) {
    // PixelLab effectAsset path — animate through frames at the asset's fps.
    // Mirrors the in-game in-flight visual so the preview shows what the
    // weapon actually looks like when fired (not just the inventory icon).
    const stage = document.createElement('div');
    stage.className = 'ars-preview-static';
    const img = effectImg(w.effectAsset, true, 96);
    if (img) stage.appendChild(img);
    wrap.appendChild(stage);
    const lab = document.createElement('div');
    lab.className = 'ars-preview-label';
    lab.textContent = PATTERN_KO[w.pattern] || '';
    wrap.appendChild(lab);
  } else {
    // Non-aoeKit: enlarged projectile sprite with pattern-themed motion.
    // Preferred: PixelLab PNG from weaponAssets (matches in-game flight).
    // Fallback: ASCII canvas atlas (legacy weapons without PNG registration).
    // Final fallback: inventory icon. Without this PNG branch, hover preview
    // would show the weapon icon (looks like a weapon body) rather than the
    // projectile that actually flies — which read as "the weapon itself is
    // launching" for spear/lance/beam weapons.
    const stage = document.createElement('div');
    const animClass = PATTERN_PREVIEW[w.pattern] || 'ars-spin';
    stage.className = `ars-preview-static ${animClass}`;
    const anim = animClass.replace('ars-', '');
    const animDuration = anim === 'fan' ? '1.3s' : anim === 'melee' ? '1.0s' : anim === 'orbit' ? '1.5s' : '1.8s';
    const animEase = anim === 'melee' ? 'ease-in-out' : 'linear';
    const pngImg = weaponAssetImg(w.sprite, 48);
    if (pngImg) {
      pngImg.style.animation = `ars-${anim} ${animDuration} ${animEase} infinite`;
      stage.appendChild(pngImg);
      wrap.appendChild(stage);
      const lab = document.createElement('div');
      lab.className = 'ars-preview-label';
      lab.textContent = PATTERN_KO[w.pattern] || '';
      wrap.appendChild(lab);
      return wrap;
    }
    // Reuse the canvas-based icon renderer at 2× size so the projectile is
    // legible. AtlasBuilder renders ASCII sprites; PixelLab PNGs go through
    // the same path via the SPRITES adapter.
    const SPRITES = window.SPRITES || {};
    const key = SPRITES[w.sprite] ? w.sprite : (SPRITES[w.icon] ? w.icon : null);
    if (key && window.AtlasBuilder) {
      const src = window.AtlasBuilder.renderFrame(key, 0);
      const cv = document.createElement('canvas');
      const z = Math.max(1, Math.floor(48 / Math.max(src.width, src.height)));
      cv.width = src.width * z;
      cv.height = src.height * z;
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, 0, 0, cv.width, cv.height);
      // Wrap canvas in img-like shell so the animation classes target it
      const holder = document.createElement('div');
      holder.style.display = 'inline-block';
      holder.appendChild(cv);
      cv.style.cssText = 'image-rendering: pixelated; width: 48px; height: 48px;';
      // The CSS rule targets `img` — apply the same animation directly here.
      // `anim`/`animDuration`/`animEase` are already declared above for the
      // PNG branch; reuse them so PNG and ASCII paths animate identically.
      cv.style.animation = `ars-${anim} ${animDuration} ${animEase} infinite`;
      stage.appendChild(holder);
    }
    wrap.appendChild(stage);
    const lab = document.createElement('div');
    lab.className = 'ars-preview-label';
    lab.textContent = PATTERN_KO[w.pattern] || '';
    wrap.appendChild(lab);
  }
  return wrap;
}

// Match the choices.js CLASS_AFFINITY map so arsenal grouping reflects the
// same preference signal the level-up roller uses. Multi-class weapons
// resolve via the priority chain knight > mage > huntress > warrior.
const CLASS_AFFINITY = {
  knight:   ['holy', 'nature'],
  warrior:  ['physical'],
  huntress: ['physical', 'nature'],
  mage:     ['arcane', 'ice', 'fire', 'lightning', 'shadow'],
};
const CLASS_PRIORITY = ['knight', 'mage', 'huntress', 'warrior'];
const CLASS_LABEL = {
  knight: '🛡️ 기사 풀',
  warrior: '⚔️ 전사 풀',
  huntress: '🏹 사냥꾼 풀',
  mage: '🔮 마법사 풀',
  shared: '🌀 공용',
};

// Huntress weapons by id — arrows, bows, hawks, marksman tools. tags alone
// (physical) don't disambiguate from warrior, so we use the id family as the
// strong signal and let it override priority.
const HUNTRESS_ID = /^(arrow|hunters_bow|hunting_hawk|hawk_swarm|salvo_shot|marksman_shot|piercing_arrow|phantom_arrow|hunters_blade|soul_arrow|leg_arrow|leg_shadow_arrow|leg_sun_phoenix|leg_spectral_bow|knives|dagger_fan|dagger_storm|gladius_throw|leg_crimson_knives)$/;

function classify(def) {
  // Class-neutral weapons (utility / buff auras) live in the shared pool so
  // every hero rolls them at base weight — no class affinity, no priority
  // tug-of-war. Marked via `def.classNeutral` on the weapon definition.
  if (def.classNeutral) return 'shared';
  // Strong override — anything in the huntress weapon family lands in the
  // huntress pool regardless of tags. Otherwise warrior would swallow most
  // arrow weapons (pure physical tag) and the huntress pool stays empty.
  if (HUNTRESS_ID.test(def.id)) return 'huntress';
  const tags = def.tags || [];
  const classes = [];
  if (tags.includes('physical') && tags.includes('nature')) classes.push('huntress');
  if (tags.includes('holy') || tags.includes('nature')) classes.push('knight');
  for (const t of CLASS_AFFINITY.mage) if (tags.includes(t)) { classes.push('mage'); break; }
  if (tags.includes('physical') && !tags.includes('nature')) classes.push('warrior');
  if (classes.length === 0) return 'shared';
  for (const c of CLASS_PRIORITY) if (classes.includes(c)) return c;
  return 'shared';
}

// Stringify one skill perk's mod object into a short readable Korean phrase
// for the hover tooltip. Numbers > 1 read as +X%, < 1 as -X%; '+N' strings
// pass through; proc {} merges show the most informative axis (fx or chance).
const STAT_KO = {
  speed: '속도', life: '지속', radius: '범위', pierce: '관통',
  cooldown: '쿨다운', projectiles: '발사체',
  orbitRadius: '궤도', orbitSpeed: '회전', reach: '사거리',
  bounces: '연쇄', knockback: '넉백', damage: '피해',
};
const STATUS_KO = {
  status_freeze: '결빙', status_burn: '화상', status_shock: '감전',
  status_bleed: '출혈', status_stun: '기절', status_slow: '둔화',
  status_poison: '독성', status_shield: '보호막',
};

function summarizeMod(mod) {
  const parts = [];
  for (const [k, v] of Object.entries(mod || {})) {
    if (k === 'proc' && v && typeof v === 'object') {
      if (typeof v.chance === 'number') parts.push(`프록 확률 ${Math.round(v.chance * 100)}%`);
      if (v.fx && STATUS_KO[v.fx]) parts.push(STATUS_KO[v.fx]);
      continue;
    }
    const name = STAT_KO[k] || k;
    if (typeof v === 'string' && v[0] === '+') {
      parts.push(`${name} ${v}`);
    } else if (typeof v === 'number') {
      const pct = Math.round((v - 1) * 100);
      const sign = pct > 0 ? '+' : '';
      parts.push(`${name} ${sign}${pct}%`);
    } else if (typeof v === 'boolean' && v) {
      if (k === 'bouncesGrowth') parts.push('성장형 연쇄');
      else if (k === 'projGrowth') parts.push('성장형 발사체');
      else parts.push(name);
    }
  }
  return parts.join(' · ');
}

export function createArsenal(mount) {
  const el = document.createElement('div');
  el.className = 'page hidden';
  mount.appendChild(el);

  let built = false;
  let closeCb = null;

  function close() {
    el.classList.add('hidden');
    if (closeCb) closeCb();
  }
  // ESC closes the page back to the main menu
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !el.classList.contains('hidden')) close();
  });

  function icon(name) {
    const cv = document.createElement('canvas');
    cv.className = 'page-icon';
    const SPRITES = window.SPRITES || {};
    if (name && SPRITES[name]) {
      const src = window.AtlasBuilder.renderFrame(name, 0);
      const z = Math.max(1, Math.floor(ICON_BOX / Math.max(src.width, src.height)));
      cv.width = src.width * z;
      cv.height = src.height * z;
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, 0, 0, cv.width, cv.height);
    } else {
      // diamond placeholder for missing/late-loading sprites — otherwise
      // we'd render a blank white canvas which reads as a broken cell
      cv.width = ICON_BOX;
      cv.height = ICON_BOX;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = 'rgba(80, 70, 110, 0.35)';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.strokeStyle = 'rgba(192, 167, 110, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cv.width / 2, 6);
      ctx.lineTo(cv.width - 6, cv.height / 2);
      ctx.lineTo(cv.width / 2, cv.height - 6);
      ctx.lineTo(6, cv.height / 2);
      ctx.closePath();
      ctx.stroke();
    }
    return cv;
  }

  function build() {
    el.innerHTML = `
      <div class="page-panel">
        <div class="page-head">
          <h2 class="page-title">무기고</h2>
          <button class="page-close" id="ars-close">닫기</button>
        </div>
        <div class="page-scroll" id="ars-scroll"></div>
      </div>`;
    const scroll = el.querySelector('#ars-scroll');
    const SPRITES = window.SPRITES || {};

    function renderCard(w, tierClass) {
      const card = document.createElement('div');
      card.className = 'ars-card' + (tierClass === 'legendary' ? ' ars-legendary' : '');
      // Prefer PixelLab effectAsset for the list thumbnail when present —
      // shows the actual in-flight visual instead of the ASCII inventory
      // icon. Single static frame (frame 0) to keep 70+ cards cheap; the
      // hover preview animates the full 4-frame cycle.
      // Fallback chain: effectAsset → weaponAssets.js PNG → ASCII icon.
      const wpnPngUrl = weaponAssetUrl(w.sprite);
      if (w.effectAsset && SIG_ASSETS[w.effectAsset]) {
        const img = effectImg(w.effectAsset, false, ICON_BOX);
        if (img) card.appendChild(img);
        else card.appendChild(icon(SPRITES[w.icon] ? w.icon : w.sprite));
      } else if (wpnPngUrl) {
        const img = document.createElement('img');
        img.src = wpnPngUrl;
        img.className = 'page-icon';
        img.style.cssText = `image-rendering: pixelated; width: ${ICON_BOX}px; height: ${ICON_BOX}px; object-fit: contain;`;
        card.appendChild(img);
      } else {
        const clip = SPRITES[w.icon] ? w.icon : w.sprite;
        card.appendChild(icon(clip));
      }
      const info = document.createElement('div');
      info.className = 'ach-info';
      const pat = PATTERN_KO[w.pattern] || w.pattern || '';
      const tags = (w.tags || []).join(' / ');
      const perkCount = w.skills?.length || 0;
      const perkChip = perkCount > 0
        ? `<span class="ach-perk">스킬트리 ${perkCount}단</span>`
        : '';
      info.innerHTML = `
        <div class="ach-name">${w.name}</div>
        <div class="ach-blurb">${pat}${tags ? ' · ' + tags : ''}</div>
        ${perkChip}`;
      card.appendChild(info);

      // Hover tooltip — animated preview on top + skill tree below. Every
      // weapon gets a preview (sky-drop for aoeKit, pattern motion for the
      // rest) so the player can see what the cast actually looks like.
      const tip = document.createElement('div');
      tip.className = 'ars-tip';
      tip.appendChild(buildPreview(w));
      if (w.skills && w.skills.length) {
        const head = document.createElement('div');
        head.className = 'ars-tip-head';
        head.textContent = '스킬트리';
        tip.appendChild(head);
        const rows = document.createElement('div');
        rows.innerHTML = w.skills
          .map((s) => `<div class="ars-tip-row">
            <span class="ars-tip-lvl">Lv ${s.lvl}</span>
            <span class="ars-tip-name">${s.name}</span>
            <span class="ars-tip-mod">${summarizeMod(s.mod)}</span>
          </div>`)
          .join('');
        tip.appendChild(rows);
      }
      card.appendChild(tip);
      // Flip tip to the left of the card when it would clip the viewport's
      // right edge — auto-fill grid means column count is dynamic, so the
      // old nth-child(2n) selector misfired on 3- and 5-col layouts.
      card.addEventListener('mouseenter', () => {
        const rect = card.getBoundingClientRect();
        const tipW = 280; // matches .ars-tip max-width
        card.classList.toggle(
          'ars-flip',
          rect.right + 8 + tipW > window.innerWidth,
        );
      });
      return card;
    }

    // ── Signatures (영웅 시그니처 — 스페이스바 궁극기) ─────────────
    // 각 영웅의 spacebar ultimate. impactAsset이 있으면 PNG 4프레임 사이클,
    // 없으면 Graphics 폴백 표시(텍스트 라벨). 무기와 별도 섹션으로 띄워
    // PixelLab 자산이 게임에 연결됐는지 한눈에 검증할 수 있게 한다.
    {
      const sigList = Object.values(SIGNATURES);
      if (sigList.length) {
        const sec = document.createElement('div');
        sec.className = 'page-cat';
        const head = document.createElement('div');
        head.className = 'page-cat-name';
        head.textContent = `시그니처 (스페이스바 궁극기) · ${sigList.length}`;
        sec.appendChild(head);
        const grid = document.createElement('div');
        grid.className = 'page-grid';
        for (const sig of sigList) grid.appendChild(renderSignatureCard(sig));
        sec.appendChild(grid);
        scroll.appendChild(sec);
      }
    }

    function renderSignatureCard(sig) {
      const card = document.createElement('div');
      card.className = 'ars-card ars-legendary';
      // 카드 썸네일: impactAsset이 있으면 frame 0을, 없으면 다이아 placeholder
      if (sig.impactAsset && SIG_ASSETS[sig.impactAsset]) {
        const img = effectImg(sig.impactAsset, false, ICON_BOX);
        if (img) card.appendChild(img);
        else card.appendChild(icon(null));
      } else if (sig.meteorAsset && SIG_ASSETS[sig.meteorAsset]) {
        const img = effectImg(sig.meteorAsset, false, ICON_BOX);
        if (img) card.appendChild(img);
        else card.appendChild(icon(null));
      } else {
        card.appendChild(icon(null));
      }
      const info = document.createElement('div');
      info.className = 'ach-info';
      const hero = HERO_KO[sig.char] || sig.char;
      const hasAsset = !!(sig.impactAsset || sig.meteorAsset);
      const assetChip = hasAsset
        ? `<span class="ach-perk">PixelLab</span>`
        : `<span class="ach-perk" style="opacity:0.5">Graphics fallback</span>`;
      info.innerHTML = `
        <div class="ach-name">${sig.name}</div>
        <div class="ach-blurb">${hero} · ${sig.kind} · CD ${sig.cooldown}s</div>
        ${assetChip}`;
      card.appendChild(info);

      // Hover preview — impactAsset frames 사이클 (있으면) + 설명
      const tip = document.createElement('div');
      tip.className = 'ars-tip';
      const previewKey = sig.impactAsset || sig.meteorAsset;
      if (previewKey && SIG_ASSETS[previewKey]) {
        const wrap = document.createElement('div');
        wrap.className = 'ars-preview';
        const stage = document.createElement('div');
        stage.className = 'ars-preview-static';
        const img = effectImg(previewKey, true, 96);
        if (img) stage.appendChild(img);
        wrap.appendChild(stage);
        const lab = document.createElement('div');
        lab.className = 'ars-preview-label';
        lab.textContent = previewKey;
        wrap.appendChild(lab);
        tip.appendChild(wrap);
      }
      const head = document.createElement('div');
      head.className = 'ars-tip-head';
      head.textContent = '상세';
      tip.appendChild(head);
      const detail = document.createElement('div');
      detail.innerHTML = `
        <div class="ars-tip-row"><span class="ars-tip-name">${sig.desc}</span></div>
        <div class="ars-tip-row"><span class="ars-tip-lvl">발사체</span><span class="ars-tip-mod">${sig.count}개</span></div>
        <div class="ars-tip-row"><span class="ars-tip-lvl">피해</span><span class="ars-tip-mod">${sig.damage}</span></div>
        <div class="ars-tip-row"><span class="ars-tip-lvl">반경</span><span class="ars-tip-mod">${sig.radius}px</span></div>`;
      tip.appendChild(detail);
      card.appendChild(tip);
      card.addEventListener('mouseenter', () => {
        const rect = card.getBoundingClientRect();
        const tipW = 280;
        card.classList.toggle('ars-flip', rect.right + 8 + tipW > window.innerWidth);
      });
      return card;
    }

    for (const group of TIER_GROUPS) {
      const list = Object.values(WEAPONS).filter((w) => w.tier === group.tier);
      if (list.length === 0) continue;
      const sec = document.createElement('div');
      sec.className = 'page-cat';
      const head = document.createElement('div');
      head.className = 'page-cat-name';
      head.textContent = `${group.label} · ${list.length}`;
      sec.appendChild(head);

      if (group.tier === 'basic') {
        // Sub-bucket basic weapons by class affinity so the 70+ entries
        // remain scannable. Render each class block with its own subhead.
        const buckets = { knight: [], warrior: [], huntress: [], mage: [], shared: [] };
        for (const w of list) buckets[classify(w)].push(w);
        for (const cls of ['knight', 'warrior', 'huntress', 'mage', 'shared']) {
          const items = buckets[cls];
          if (!items.length) continue;
          const subhead = document.createElement('div');
          subhead.className = 'page-subhead';
          subhead.textContent = `${CLASS_LABEL[cls]} · ${items.length}`;
          sec.appendChild(subhead);
          const grid = document.createElement('div');
          grid.className = 'page-grid';
          for (const w of items) grid.appendChild(renderCard(w, group.tier));
          sec.appendChild(grid);
        }
      } else {
        const grid = document.createElement('div');
        grid.className = 'page-grid';
        for (const w of list) grid.appendChild(renderCard(w, group.tier));
        sec.appendChild(grid);
      }
      scroll.appendChild(sec);
    }

    el.querySelector('#ars-close').addEventListener('click', close);
    built = true;
  }

  return {
    open(cb) {
      closeCb = cb;
      if (!built) build();
      el.classList.remove('hidden');
    },
  };
}
