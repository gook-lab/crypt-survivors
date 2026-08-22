// Result / game-over screen (HTML/CSS overlay).
//
// Emotional arc: death (deflation) -> the run summary (hero, weapons, skills,
// the gold count-up) -> shop / retry. Survival time is the headline.

import { WEAPONS } from '../content/weapons.js';
import { EVOLUTIONS } from '../content/evolutions.js';
import { PASSIVES } from '../content/passives.js';
import { ACHIEVEMENTS, ACHIEVEMENT_TIERS } from '../content/achievements.js';
import { loadSave } from '../data/save.js';
import { weaponIconElement } from '../util/weaponIcon.js';
import { heroPortraitElement } from './heroPortrait.js';

// progress-ratio map for tracked achievements — module-level so both the
// build-tips section and the pending-achievement widget share one source of
// truth. Each function returns a 0..∞ ratio (clamped to 1 at display).
const PROGRESS_FNS = {
  kills_100: (s) => s.kills / 100,
  kills_1000: (s) => s.kills / 1000,
  kills_10000: (s) => s.kills / 10000,
  kills_100000: (s) => s.kills / 100000,
  crit_1000: (s) => s.crits / 1000,
  dmg_1m: (s) => s.damage / 1000000,
  runs_10: (s) => s.runs / 10,
  runs_100: (s) => s.runs / 100,
  gold_total_10k: (s, sv) => (sv.goldLifetime || 0) / 10000,
  gold_total_100k: (s, sv) => (sv.goldLifetime || 0) / 100000,
  survival_3min: (s) => (s.longestSurvival || 0) / 180,
  survival_5min: (s) => (s.longestSurvival || 0) / 300,
  survival_10min: (s) => (s.longestSurvival || 0) / 600,
  survival_15min: (s) => (s.longestSurvival || 0) / 900,
  hero_lv20: (s) => s.maxLevel / 20,
  hero_lv30: (s) => s.maxLevel / 30,
  hero_lv40: (s) => s.maxLevel / 40,
  hero_lv50: (s) => s.maxLevel / 50,
};

// element tag → passive that synergizes with it. Mirrors weaponFire's
// defaultProcFor: each tag drives a status, and passive choices amplify
// either the proc chance or the projectile profile.
const TAG_SYNERGY = {
  fire: { passive: 'might', label: '화상 빌드' },
  ice: { passive: 'multi', label: '빙결 빌드' },
  holy: { passive: 'haste', label: '신성 빌드' },
  shadow: { passive: 'lodestone', label: '그림자 빌드' },
  lightning: { passive: 'swift', label: '번개 빌드' },
  arcane: { passive: 'multi', label: '비전 빌드' },
  nature: { passive: 'vigor', label: '자연 빌드' },
  physical: { passive: 'might', label: '물리 빌드' },
};

export function createResult(mount) {
  const el = document.createElement('div');
  el.className = 'result hidden';
  el.innerHTML = `
    <div class="result-bg"></div>
    <div class="result-box">
      <h1 class="result-title-die">YOU DIED</h1>
      <div class="result-hero-card" id="result-hero"></div>

      <div class="result-stat-survival">
        <div class="result-stat-label">생존</div>
        <div class="result-stat-value result-stat-value-large" id="result-time">0:00</div>
      </div>

      <div class="result-key-stats">
        <div class="result-key-stat">
          <div class="result-stat-label">레벨</div>
          <div class="result-stat-value" id="result-lvl">1</div>
        </div>
        <div class="result-key-stat">
          <div class="result-stat-label">처치</div>
          <div class="result-stat-value" id="result-kills">0</div>
        </div>
        <div class="result-key-stat">
          <div class="result-stat-label">골드</div>
          <div class="result-stat-value" id="result-gold">0</div>
        </div>
      </div>

      <div class="result-section">
        <div class="result-label">주요 무기</div>
        <div class="result-top-weapons" id="result-top-weapons"></div>
      </div>

      <div class="result-section" id="result-tip-single-sec">
        <div class="result-tips" id="result-tips-single"></div>
      </div>

      <div class="result-actions">
        <button class="result-btn" id="result-stats">통계</button>
        <button class="result-btn" id="result-shop">대장간 (S)</button>
        <button class="result-btn result-btn-go" id="result-retry">다시 시작 (R)</button>
      </div>

      <details class="result-details" id="result-combat-details">
        <summary class="result-summary">자세한 전투 정보 ▼</summary>
        <div class="result-section">
          <div class="result-label">전투 기록</div>
          <div class="result-combat" id="result-combat"></div>
        </div>
        <div class="result-section">
          <div class="result-dps-rows" id="result-dps"></div>
        </div>
      </details>

      <details class="result-details" id="result-progress-details">
        <summary class="result-summary">진척도 ▼</summary>
        <div class="result-arcana hidden" id="result-arcana"></div>
        <div class="result-section hidden" id="result-tips-sec">
          <div class="result-label">✦ 다음 런 추천</div>
          <div class="result-tips" id="result-tips"></div>
        </div>
        <div class="result-section hidden" id="result-pending-sec">
          <div class="result-label">🎯 다음 도전 과제</div>
          <div class="result-pending" id="result-pending"></div>
        </div>
        <div class="result-section">
          <div class="result-label">해금한 스킬</div>
          <div class="result-skills" id="result-skills"></div>
        </div>
        <div class="result-section hidden" id="result-ach-sec">
          <div class="result-label">✦ 새 도전 과제</div>
          <div class="result-skills" id="result-ach"></div>
        </div>
      </details>
    </div>
  `;
  mount.appendChild(el);

  const heroEl = el.querySelector('#result-hero');
  const arcanaEl = el.querySelector('#result-arcana');
  const timeEl = el.querySelector('#result-time');
  const lvlEl = el.querySelector('#result-lvl');
  const killsEl = el.querySelector('#result-kills');
  const goldEl = el.querySelector('#result-gold');
  const combatEl = el.querySelector('#result-combat');
  const dpsEl = el.querySelector('#result-dps');
  const topWeaponsEl = el.querySelector('#result-top-weapons');
  const tipsSingleEl = el.querySelector('#result-tips-single');
  const tipsSecEl = el.querySelector('#result-tips-sec');
  const tipsEl = el.querySelector('#result-tips');
  const pendingSecEl = el.querySelector('#result-pending-sec');
  const pendingEl = el.querySelector('#result-pending');
  const skillsEl = el.querySelector('#result-skills');
  const achSecEl = el.querySelector('#result-ach-sec');
  const achEl = el.querySelector('#result-ach');

  let shopCb = null;
  let statsCb = null;
  el.querySelector('#result-retry').addEventListener('click', () => location.reload());
  el.querySelector('#result-shop').addEventListener('click', () => {
    if (shopCb) shopCb();
  });
  el.querySelector('#result-stats').addEventListener('click', () => {
    if (statsCb) statsCb();
  });

  // a crisp upscaled icon canvas from a sprite clip
  function iconCanvas(spriteName, size) {
    const cv = document.createElement('canvas');
    cv.className = 'result-icon';
    cv.width = size;
    cv.height = size;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const SPRITES = window.SPRITES || {};
    if (spriteName && SPRITES[spriteName]) {
      const src = window.AtlasBuilder.renderFrame(spriteName, 0);
      ctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, size, size);
    } else {
      // diamond placeholder — beats a blank white tile in the result grid
      ctx.fillStyle = 'rgba(80, 70, 110, 0.35)';
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = 'rgba(192, 167, 110, 0.5)';
      ctx.lineWidth = Math.max(1, size / 24);
      ctx.beginPath();
      ctx.moveTo(size / 2, size * 0.18);
      ctx.lineTo(size * 0.82, size / 2);
      ctx.lineTo(size / 2, size * 0.82);
      ctx.lineTo(size * 0.18, size / 2);
      ctx.closePath();
      ctx.stroke();
    }
    return cv;
  }

  function show(stats, level, loadout, skillsList, freshAch) {
    const t = Math.floor(stats.time);
    timeEl.textContent = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
    lvlEl.textContent = level;
    killsEl.textContent = stats.kills;
    goldEl.textContent = stats.gold;

    // hero portrait + name as a card. PixelLab PNG wins when registered;
    // ASCII canvas is the fallback. Shared helper across result/history/
    // charselect/shop (memory: hero-portrait-pixellab-fallback).
    heroEl.innerHTML = '';
    if (loadout && loadout.hero) {
      const h = loadout.hero;
      const portrait = heroPortraitElement(h.sprite, 44, 'result-icon');
      portrait.style.marginRight = '10px';
      heroEl.appendChild(portrait);
      const info = document.createElement('div');
      info.style.display = 'flex';
      info.style.flexDirection = 'column';
      info.style.alignItems = 'flex-start';
      const name = document.createElement('div');
      name.className = 'result-hero-name';
      name.textContent = h.name;
      const role = document.createElement('div');
      role.style.fontSize = '12px';
      role.style.color = '#cfc8e0';
      role.style.marginTop = '2px';
      role.textContent = h.role;
      info.appendChild(name);
      info.appendChild(role);
      heroEl.appendChild(info);
      heroEl.classList.remove('hidden');
    } else {
      // no hero — hide the card so an empty border doesn't loiter in the layout
      heroEl.classList.add('hidden');
    }

    // arcana badge (if active)
    if (loadout && loadout.arcana) {
      const a = loadout.arcana;
      arcanaEl.innerHTML = '';
      arcanaEl.style.borderColor = a.color;
      const icon = iconCanvas(a.icon, 32);
      arcanaEl.appendChild(icon);
      const info = document.createElement('div');
      info.className = 'result-arcana-info';
      const label = document.createElement('div');
      label.className = 'result-arcana-label';
      label.textContent = '아르카나';
      const name = document.createElement('div');
      name.className = 'result-arcana-name';
      name.textContent = a.name;
      name.style.color = a.color;
      info.appendChild(label);
      info.appendChild(name);
      arcanaEl.appendChild(info);
      arcanaEl.classList.remove('hidden');
    } else {
      arcanaEl.classList.add('hidden');
    }

    // combat summary — average DPS, crit rate, max combo. Three pill stats.
    combatEl.innerHTML = '';
    const dur = Math.max(1, stats.time);
    const dps = Math.round((stats.damage || 0) / dur);
    // crit rate is crits / total hits (damage events) — not crits / kills,
    // which inflated the value when each enemy ate multiple hits
    const critRate = (stats.hits || 0) > 0
      ? Math.round(((stats.crits || 0) / stats.hits) * 100)
      : 0;
    const maxCombo = stats.maxCombo || 0;
    const addPill = (label, value, color) => {
      const p = document.createElement('div');
      p.className = 'result-pill';
      p.innerHTML = `<span class="result-pill-label">${label}</span><span class="result-pill-value" style="color:${color}">${value}</span>`;
      combatEl.appendChild(p);
    };
    addPill('평균 DPS', dps.toLocaleString(), '#f0d27a');
    addPill('치명타율', critRate + '%', '#ff7a36');
    addPill('최대 콤보', maxCombo, '#88e0c0');

    // top 3 weapons — large hero cards showing icon + level pips + damage
    // share %. The full per-weapon breakdown still follows below in the
    // dps-rows section, so the top-3 is just the headline pull-out.
    topWeaponsEl.innerHTML = '';
    const byW = stats.damageByWeapon || {};
    const total = Object.values(byW).reduce((s, v) => s + v, 0);
    if (loadout && total > 0) {
      const topSorted = Object.entries(byW).sort((a, b) => b[1] - a[1]).slice(0, 3);
      const rankColor = ['#f0d27a', '#cfc8e0', '#a07a3a']; // gold / silver / bronze
      topSorted.forEach(([id, dmg], rank) => {
        const def = WEAPONS[id];
        if (!def) return;
        const pct = (dmg / total) * 100;
        const lvl = (loadout.weapons || {})[id] || 0;
        const card = document.createElement('div');
        card.className = 'result-top-weapon';
        card.style.borderColor = rankColor[rank] || '#3a3052';
        // PixelLab PNG chain via shared helper (effectAsset → weaponAssets → ASCII)
        const icon = weaponIconElement(def, { size: 48, className: 'result-icon' });
        card.appendChild(icon);
        const info = document.createElement('div');
        info.className = 'result-top-weapon-info';
        info.innerHTML = `
          <div class="result-top-weapon-rank" style="color:${rankColor[rank]}">#${rank + 1}</div>
          <div class="result-top-weapon-name">${def.name}</div>
          <div class="result-top-weapon-meta">Lv ${lvl} · ${pct.toFixed(0)}%</div>`;
        card.appendChild(info);
        topWeaponsEl.appendChild(card);
      });
    }

    // per-weapon damage contribution — horizontal bars sorted descending
    dpsEl.innerHTML = '';
    if (total > 0) {
      const sorted = Object.entries(byW).sort((a, b) => b[1] - a[1]);
      for (const [id, dmg] of sorted) {
        const def = WEAPONS[id];
        if (!def) continue;
        const pct = (dmg / total) * 100;
        const row = document.createElement('div');
        row.className = 'result-dps-row';
        // 24px floor: half-step quantization (memory: projectile-png-half-step-cap)
        // — 22px would round to 0.5× of 48px source = 11px, illegible.
        const icon = weaponIconElement(def, { size: 24, className: 'result-icon' });
        icon.style.flexShrink = '0';
        row.appendChild(icon);
        const name = document.createElement('span');
        name.className = 'result-dps-name';
        name.textContent = def.name;
        row.appendChild(name);
        const bar = document.createElement('div');
        bar.className = 'result-dps-bar';
        const fill = document.createElement('div');
        fill.className = 'result-dps-fill';
        fill.style.width = pct.toFixed(1) + '%';
        bar.appendChild(fill);
        row.appendChild(bar);
        const val = document.createElement('span');
        val.className = 'result-dps-val';
        val.textContent = pct.toFixed(0) + '%';
        row.appendChild(val);
        dpsEl.appendChild(row);
      }
    }

    // build recommendations — pulls insight from the run's data and prints
    // up to 3 tips chosen from a longer table. Each tip carries a priority
    // so the most actionable advice wins when more than 3 conditions fire.
    const tips = [];
    if (loadout) {
      const sortedByDmg = total > 0 ? Object.entries(byW).sort((a, b) => b[1] - a[1]) : [];
      const topId = sortedByDmg[0] ? sortedByDmg[0][0] : null;
      const topDef = topId ? WEAPONS[topId] : null;
      const topShare = topId ? (sortedByDmg[0][1] / total) : 0;
      const passiveCount = Object.keys(loadout.passives || {}).length;

      // 1) missed evolution — top damage weapon has a recipe whose passive
      //    the player never picked up. Highest-impact tip.
      const recipe = topId ? EVOLUTIONS.find((r) => r.from === topId) : null;
      if (recipe && !loadout.passives[recipe.passive]) {
        const pass = PASSIVES[recipe.passive];
        if (pass && topDef) {
          tips.push({
            priority: 10,
            icon: 'icon_' + pass.id,
            color: '#f0d27a',
            head: '진화 기회',
            body: `${topDef.name} + ${pass.name}를 함께 키우면 전설로 진화한다`,
          });
        }
      }

      // 2) one-weapon dominance — top weapon does > 60% of total damage.
      //    Tells the player to diversify or commit to the synergy.
      if (topShare > 0.6 && topDef && sortedByDmg.length >= 2) {
        tips.push({
          priority: 8,
          icon: topDef.icon || topDef.sprite,
          color: '#ff7a36',
          head: '단일 무기 의존',
          body: `${topDef.name}이 데미지 ${Math.round(topShare * 100)}%를 책임졌다 — 다른 무기도 키워 안전망을 만들자`,
        });
      }

      // 3) element synergy — owned 2+ weapons share a tag → suggest the
      //    matching passive (mirrors weaponFire's defaultProcFor mapping)
      const tagCount = {};
      for (const wid in loadout.weapons) {
        const tags = WEAPONS[wid]?.tags || [];
        for (const t of tags) tagCount[t] = (tagCount[t] || 0) + 1;
      }
      const synergyTag = Object.entries(tagCount)
        .filter(([t, n]) => n >= 2 && TAG_SYNERGY[t] && !loadout.passives[TAG_SYNERGY[t].passive])
        .sort((a, b) => b[1] - a[1])[0];
      if (synergyTag) {
        const syn = TAG_SYNERGY[synergyTag[0]];
        const pass = PASSIVES[syn.passive];
        if (pass) {
          tips.push({
            priority: 7,
            icon: 'icon_' + pass.id,
            color: '#88e0c0',
            head: syn.label,
            body: `${synergyTag[0]} 속성 무기 ${synergyTag[1]}개 보유 — ${pass.name}로 시너지를 노려보자`,
          });
        }
      }

      // 4) crit-heavy run — > 30% crit rate suggests doubling down on it
      if (critRate > 30 && !loadout.passives.haste) {
        tips.push({
          priority: 5,
          icon: 'icon_haste',
          color: '#ff7a36',
          head: '치명타 빌드',
          body: `이번 런 치명타율 ${critRate}% — 신속 패시브 + 관통의 시선 아르카나가 잘 맞는다`,
        });
      }

      // 5) sparse passives — only complain if picked fewer than 2. The
      //    earlier <3 trigger fired on nearly every short run.
      if (passiveCount < 2) {
        tips.push({
          priority: 6,
          icon: 'icon_might',
          color: '#6fb4dc',
          head: '패시브 강화',
          body: `이번 런은 패시브 ${passiveCount}종 — 다음엔 힘·신속·다중 같은 기본 패시브도 함께 키우자`,
        });
      }

      // 6) no arcana picked — flex the run-modifier system to the player
      if (!loadout.arcana) {
        tips.push({
          priority: 4,
          icon: 'icon_crit',
          color: '#c894ff',
          head: '아르카나',
          body: '런 시작에 아르카나를 고르면 강력한 변형 효과를 얻는다',
        });
      }

      // 7) low average DPS — under 250 at the end is slim
      if (dps < 250 && stats.time > 90) {
        tips.push({
          priority: 9,
          icon: 'icon_haste',
          color: '#e0584a',
          head: '화력 부족',
          body: '평균 DPS가 낮다 — 무기 레벨업이나 힘 패시브를 우선해보자',
        });
      }

      // 8) high level reached — praise + suggest the next chapter
      if (level >= 30) {
        tips.push({
          priority: 3,
          icon: 'fx_levelup',
          color: '#ffd700',
          head: '베테랑',
          body: `Lv ${level} 도달 — 다음 챕터에서 더 강한 적들과 마주할 준비가 됐다`,
        });
      } else if (level >= 20) {
        tips.push({
          priority: 2,
          icon: 'fx_levelup',
          color: '#88e0c0',
          head: '성장',
          body: `Lv ${level} 도달 — Ch.4가 열렸다면 더 매운 적들이 기다린다`,
        });
      }

      // 9) RR — link the closest pending achievement to a concrete next-run
      //    advice line. The 'pending' list below shares the same data, but
      //    surfacing it as a tip makes the cause-effect obvious.
      const svr = loadSave();
      const ach = svr.achievements || {};
      const closeTarget = ACHIEVEMENTS
        .filter((a) => PROGRESS_FNS[a.id] && !ach[a.id] && PROGRESS_FNS[a.id](svr.stats || {}, svr) >= 0.5)
        .map((a) => ({ a, p: PROGRESS_FNS[a.id](svr.stats || {}, svr) }))
        .sort((x, y) => y.p - x.p)[0];
      if (closeTarget) {
        const tierDef = ACHIEVEMENT_TIERS[closeTarget.a.tier] || {};
        tips.push({
          priority: 4,
          icon: closeTarget.a.icon || 'fx_levelup',
          color: tierDef.color || '#f0d27a',
          head: '도전 과제',
          body: `${closeTarget.a.name} ${Math.round(closeTarget.p * 100)}% — ${closeTarget.a.target} 거의 다 왔다`,
        });
      }

      // pick the top 3 by priority
      tips.sort((a, b) => b.priority - a.priority);
    }

    // above-fold: render top 1 tip in result-tips-single
    const topTip = tips[0] || null;
    if (!topTip) {
      tipsSingleEl.parentElement.classList.add('hidden');
    } else {
      tipsSingleEl.parentElement.classList.remove('hidden');
      tipsSingleEl.innerHTML = '';
      const card = document.createElement('div');
      card.className = 'result-tip';
      card.style.borderLeftColor = topTip.color;
      if (topTip.icon) card.appendChild(iconCanvas(topTip.icon, 24));
      const info = document.createElement('div');
      info.className = 'result-tip-info';
      const head = document.createElement('div');
      head.className = 'result-tip-head';
      head.textContent = topTip.head;
      head.style.color = topTip.color;
      const body = document.createElement('div');
      body.className = 'result-tip-body';
      body.textContent = topTip.body;
      info.appendChild(head);
      info.appendChild(body);
      card.appendChild(info);
      tipsSingleEl.appendChild(card);
    }

    // collapsible section: render all 3 tips in result-tips (inside details)
    tipsEl.innerHTML = '';
    if (tips.length === 0) {
      tipsEl.parentElement.classList.add('hidden');
    } else {
      tipsEl.parentElement.classList.remove('hidden');
      for (const t of tips.slice(0, 3)) {
        const card = document.createElement('div');
        card.className = 'result-tip';
        card.style.borderLeftColor = t.color;
        if (t.icon) card.appendChild(iconCanvas(t.icon, 24));
        const info = document.createElement('div');
        info.className = 'result-tip-info';
        const head = document.createElement('div');
        head.className = 'result-tip-head';
        head.textContent = t.head;
        head.style.color = t.color;
        const body = document.createElement('div');
        body.className = 'result-tip-body';
        body.textContent = t.body;
        info.appendChild(head);
        info.appendChild(body);
        card.appendChild(info);
        tipsEl.appendChild(card);
      }
    }

    // upcoming achievement targets — surface 3 unlock-soon trophies so the
    // player has a goal for next run. Picks the 3 nearest auto-tracked
    // achievements by progress ratio.
    pendingEl.innerHTML = '';
    const sv = loadSave();
    const lifetimeStats = sv.stats || {};
    const unlocked = sv.achievements || {};
    const pending = ACHIEVEMENTS
      .filter((a) => PROGRESS_FNS[a.id] && !unlocked[a.id])
      .map((a) => ({ a, p: Math.min(1, PROGRESS_FNS[a.id](lifetimeStats, sv)) }))
      .sort((x, y) => y.p - x.p) // closest to 1 first
      .slice(0, 3);
    if (pending.length === 0) {
      pendingSecEl.classList.add('hidden');
    } else {
      pendingSecEl.classList.remove('hidden');
      for (const { a, p } of pending) {
        const tier = ACHIEVEMENT_TIERS[a.tier] || {};
        const row = document.createElement('div');
        row.className = 'result-pending-row';
        row.style.borderLeftColor = tier.color || '#cfc8e0';
        const pct = Math.round(p * 100);
        row.innerHTML = `
          <div class="result-pending-info">
            <div class="result-pending-name">${a.name}</div>
            <div class="result-pending-target">${a.target}</div>
          </div>
          <div class="result-pending-bar"><div class="result-pending-fill" style="width:${pct}%;background:${tier.color || '#cfc8e0'}"></div></div>
          <div class="result-pending-pct" style="color:${tier.color || '#cfc8e0'}">${pct}%</div>`;
        pendingEl.appendChild(row);
      }
    }

    // skills unlocked
    skillsEl.innerHTML = '';
    const skills = skillsList || [];
    if (skills.length === 0) {
      skillsEl.textContent = '—';
    } else {
      for (const s of skills) {
        const tag = document.createElement('span');
        tag.className = 'result-skill';
        tag.textContent = '✦ ' + s.name;
        skillsEl.appendChild(tag);
      }
    }

    // newly unlocked achievements
    const ach = freshAch || [];
    if (ach.length === 0) {
      achSecEl.classList.add('hidden');
    } else {
      achSecEl.classList.remove('hidden');
      achEl.innerHTML = '';
      for (const a of ach) {
        const tag = document.createElement('span');
        tag.className = 'result-skill';
        tag.textContent = '🏆 ' + a.name;
        achEl.appendChild(tag);
      }
    }

    el.classList.remove('hidden');

    // gold count-up animation (the recovery beat)
    const target = stats.gold;
    const start = performance.now();
    const duration = 800;
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      goldEl.textContent = Math.floor(target * p);
      if (p < 1) requestAnimationFrame(tick);
      else goldEl.textContent = String(target);
    }
    requestAnimationFrame(tick);
  }

  function hide() {
    el.classList.add('hidden');
  }

  return {
    show, hide,
    onShop: (cb) => { shopCb = cb; },
    onStats: (cb) => { statsCb = cb; },
  };
}
