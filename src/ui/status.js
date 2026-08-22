// Status Effects & Synergies page — a browsable catalog of all status effects,
// elemental synergies, and spirit synergies (HTML overlay, read-only).

import { STATUS, STATUS_SYNERGIES } from '../content/status.js';
import { SPIRITS } from '../content/spirits.js';
import { WEAPONS } from '../content/weapons.js';

const ICON_BOX = 48;

// Tag colors for element synergies
const TAG_COLORS = {
  fire: '#f08a2a',
  ice: '#6fb4dc',
  holy: '#f0d27a',
  shadow: '#9a5a8a',
  lightning: '#f0d27a',
  arcane: '#c9a0ff',
  nature: '#88b85a',
  physical: '#d7d2b4',
};

// Discover all unique tags from weapons
function discoverTags() {
  const tags = new Set();
  for (const w of Object.values(WEAPONS)) {
    if (w.tags) {
      for (const t of w.tags) {
        tags.add(t);
      }
    }
  }
  return Array.from(tags).sort();
}

// Tag → status mapping — mirrors weaponFire.js `defaultProcFor` so this page
// reflects what really happens in combat (every tag drives a real proc).
const TAG_TO_STATUS = {
  fire: 'burn',
  ice: 'freeze',
  holy: 'slow',
  shadow: 'poison',
  lightning: 'shock',
  arcane: 'freeze',
  nature: 'slow',
  physical: 'bleed',
};
const TAG_DESC = {
  fire: '불 속성 무기는 화상 상태를 부착한다',
  ice: '얼음 속성 무기는 빙결 상태를 부착한다',
  holy: '신성 속성 무기는 둔화를 일으킨다',
  shadow: '그림자 속성 무기는 독을 부착한다',
  lightning: '번개 속성 무기는 감전 상태를 부착한다',
  arcane: '비전 속성 무기는 빙결 상태를 일으킨다',
  nature: '자연 속성 무기는 둔화를 일으킨다',
  physical: '물리 속성 무기는 출혈을 일으킨다',
};
function tagToStatus(tag) {
  return { status: TAG_TO_STATUS[tag] || null, desc: TAG_DESC[tag] || '다양한 효과' };
}

// Build the inverse: status → list of tags that apply it. Used for the per-
// status sources line.
function tagsForStatus(statusId) {
  const out = [];
  for (const [t, s] of Object.entries(TAG_TO_STATUS)) {
    if (s === statusId) out.push(t);
  }
  return out;
}

export function createStatusPage(mount) {
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
      cv.width = ICON_BOX;
      cv.height = ICON_BOX;
    }
    return cv;
  }

  function build() {
    el.innerHTML = `
      <div class="page-panel">
        <div class="page-head">
          <h2 class="page-title">상태 효과 · 시너지</h2>
          <button class="page-close" id="status-close">닫기</button>
        </div>
        <div class="page-scroll" id="status-scroll"></div>
      </div>`;
    const scroll = el.querySelector('#status-scroll');

    // ──────────────────────────────────────────────────────────
    // SECTION 1: 상태 효과
    // ──────────────────────────────────────────────────────────
    const statusSec = document.createElement('div');
    statusSec.className = 'page-cat';
    const statusHead = document.createElement('div');
    statusHead.className = 'page-cat-name';
    statusHead.textContent = `상태 효과 · ${Object.keys(STATUS).length}`;
    statusSec.appendChild(statusHead);

    const statusGrid = document.createElement('div');
    statusGrid.className = 'page-grid';
    for (const [id, def] of Object.entries(STATUS)) {
      const card = document.createElement('div');
      card.className = 'ach-card';
      card.style.borderLeftColor = `#${def.color.toString(16).padStart(6, '0')}`;
      card.appendChild(icon(def.icon));

      const info = document.createElement('div');
      info.className = 'ach-info';
      // every tag that maps to this status — clean dedup'd source line. For
      // stun (no tag in defaultProcFor maps to it), list the weapon families
      // that proc it (mace / whip / hammer / flail).
      let sourceLine = '';
      const tags = tagsForStatus(id);
      if (tags.length > 0) {
        sourceLine = `${tags.join(' · ')} 속성`;
      } else if (id === 'stun') {
        sourceLine = '둔기 계열 무기 (철퇴 · 채찍 · 망치 · 사슬)';
      } else {
        sourceLine = '특정 무기 부착';
      }

      info.innerHTML = `
        <div class="ach-name">${def.name}</div>
        <div class="ach-blurb">${def.blurb}</div>
        <div class="ach-reward" style="color:#9a9a9a">${sourceLine}</div>`;
      card.appendChild(info);
      statusGrid.appendChild(card);
    }
    statusSec.appendChild(statusGrid);
    scroll.appendChild(statusSec);

    // ──────────────────────────────────────────────────────────
    // SECTION 2: 원소 시너지
    // ──────────────────────────────────────────────────────────
    const tags = discoverTags();
    const synergySec = document.createElement('div');
    synergySec.className = 'page-cat';
    const synergyHead = document.createElement('div');
    synergyHead.className = 'page-cat-name';
    synergyHead.textContent = `원소 시너지 · ${tags.length}`;
    synergySec.appendChild(synergyHead);

    const synergyGrid = document.createElement('div');
    synergyGrid.className = 'page-grid';
    for (const tag of tags) {
      const card = document.createElement('div');
      card.className = 'ach-card';
      const color = TAG_COLORS[tag] || '#cfc8e0';
      card.style.borderLeftColor = color;
      card.style.borderColor = color;

      const info = document.createElement('div');
      info.className = 'ach-info';
      const { status, desc } = tagToStatus(tag);
      const statusName = status ? STATUS[status]?.name || '특수 효과' : '시너지';

      info.innerHTML = `
        <div class="ach-name">${tag.charAt(0).toUpperCase() + tag.slice(1)}</div>
        <div class="ach-blurb">${desc}</div>
        <div class="ach-reward" style="color:${color}">${statusName}</div>`;
      card.appendChild(info);
      synergyGrid.appendChild(card);
    }
    synergySec.appendChild(synergyGrid);
    scroll.appendChild(synergySec);

    // ──────────────────────────────────────────────────────────
    // SECTION 3: 정령 시너지
    // ──────────────────────────────────────────────────────────
    const spiritSec = document.createElement('div');
    spiritSec.className = 'page-cat';
    const spiritHead = document.createElement('div');
    spiritHead.className = 'page-cat-name';
    spiritHead.textContent = `정령 시너지 · ${Object.keys(SPIRITS).length}`;
    spiritSec.appendChild(spiritHead);

    const spiritGrid = document.createElement('div');
    spiritGrid.className = 'page-grid';

    const spiritSynergies = {
      fairy: '체력 회복으로 생존력 강화',
      water: '보호막 생성으로 방어력 상승',
      earth: '바위 투척으로 광역 피해',
      fire: '화염 공격으로 화상 상태 적용',
    };

    for (const [id, def] of Object.entries(SPIRITS)) {
      const card = document.createElement('div');
      card.className = 'ach-card';
      card.appendChild(icon(def.sprites[0]));

      const info = document.createElement('div');
      info.className = 'ach-info';
      info.innerHTML = `
        <div class="ach-name">${def.name}</div>
        <div class="ach-blurb">${def.desc}</div>
        <div class="ach-reward" style="color:#88e0c0">${spiritSynergies[id] || '특수 능력'}</div>`;
      card.appendChild(info);
      spiritGrid.appendChild(card);
    }
    spiritSec.appendChild(spiritGrid);
    scroll.appendChild(spiritSec);

    el.querySelector('#status-close').addEventListener('click', close);
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
