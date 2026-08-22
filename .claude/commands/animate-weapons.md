---
description: 무기 애니메이션 (4-5프레임 PNG) 추가 작업 가이드 + 미적용 무기 list + pipeline. 다음 세션에서 참조 또는 batch 진행용.
---

# /animate-weapons

PixelLab 4-5프레임 애니메이션을 무기에 추가하는 작업 가이드. legendary 포함 batch 진행.

> **현재 상태**: 이 파일은 reference doc (수동 체크리스트 + batch 트래킹). 실제 실행은 매 세션 manual orchestration. 다음 작업으로 분리 권장 — 이 doc 내용을 executable dispatcher 스킬로 마이그레이션 (semantic verb cascade 자동화 포함, 자세한 자동화 제안은 wrap-up 세션 ~2026-05-22 분석 결과 참조).

## 현황 (2026-05-22 Batch 24 기준 — 세션 종료)

**총 85 / 93 무기 sprite animated** (weaponAssets.js effective last-wins 기준)

### ✓ Batch 24 — 3/3 신규 PixelLab 생성 (create_1_direction_object × 3, 60 gen)

review 큐 매칭 없는 자산을 신규 생성:

| 무기 | source (신규) | promoted | anim_id | 성공 verb |
|---|---|---|---|---|
| proj_leg_demon_heart | fe28724e (NEW) | 05c2a70d | 6af59ce8 | floating (1차) |
| proj_leg_soul_lantern | 41ec7b3b (NEW) | 61432259 | 721bf5b7 | floating (1차) |
| proj_hawk_swarm | 9ab08366 (NEW) | 07645557 | fd12ad1a | flying (2차) |

신규 PNG 생성도 첫 floating gently 성공률 ≥66%로 review 큐 promote와 비슷한 성공 패턴.

### ✓ Batch 23 — Buff Aura 시각화 (별도 BUFF_ASSETS 시스템)

5 aura_buff weapon (`arcane_field, warcry_pulse, wrath_focus, holy_blessing, garlic_aura`)에 신규 buff_* PNG halo overlay 추가. `src/util/buffAssets.js` + `drawBuffHalo` PNG 오버레이 + 각 weapon def `assetKey` 필드.



### ✓ Batch 22 — 6/6 frame-reuse (이미 사용된 source의 다른 frame index)

신규 PixelLab generation 없이 이전 batch에서 사용한 review object의 미선택 frame index promote — 자산 재사용으로 visual 다양성은 같은 컨셉이지만 다른 무기 ID에 wire:

| 무기 | source (다른 frame) | promoted | anim_id | 성공 verb |
|---|---|---|---|---|
| proj_leg_shadow_arrow | 17bc8c57 idx10 | 665c59af | e911bcb4 | floating (1차) |
| proj_leg_spear | 63d8a46f idx10 | 8a1c2a1b | f2ac49e8 | floating (1차) |
| proj_bible | 02951f23 idx10 | 96074e2a | 8808a97f | glowing (2차) |
| proj_sanctuary | 2e828d16 idx8 | 466076c1 | b733a737 | swirling (2차) |
| proj_leg_judgement_hammer | 3c94607c idx10 | 76ac5e67 | 1cae2775 | glowing (3차) |
| proj_leg_eternal_frost | 9b3ae4d0 idx10 | f1d8c86a | f731ba65 | glowing (3차) |

**Frame-reuse 패턴 검증**: review object는 모든 frame이 promote될 때까지 사라지지 않음 → 같은 source를 multiple weapon에 visual 공유 가능. 신규 generation 0으로 6 weapon 추가 (~14 generation만 animate에 사용).



### ✓ Batch 21 — 6/6 perfect (mix legendary + basic)

| 무기 | source | promoted | anim_id | 성공 verb |
|---|---|---|---|---|
| proj_leg_black_hole | 2eb80079 | 7df02c93 | 6ccb0815 | floating (1차) |
| proj_leg_spectral_bow | d1e06224 | 36f7ee4c | 1d06c5bb | floating (1차) |
| proj_leg_storm_caller | e71d920f | b9fc7b51 | e96b078f | crackling (2차) |
| proj_leg_world_tree | 3c6df7ec | 760cefc9 | cd7a8eaf | swirling (2차) |
| proj_arcane_orb_v2 | fcfc3bd5 | 164e571b | 227c4fe0 | swirling (3차) |
| proj_holy_censer | 99a8a7c3 | a2a30431 | 0f6814f5 | shimmering (3차) |



### ✓ Batch 20 — legendary 6, 5/6 success

| 무기 | source | promoted | anim_id | 성공 verb |
|---|---|---|---|---|
| proj_leg_galaxy_orb | 54172048 | 1632f491 | 901bfd9d | floating (1차) |
| proj_leg_hammer_of_dawn | 3c94607c | 79524a5d | 2908ace3 | floating (1차) |
| proj_leg_nova | 526a260e | 3b7e75ce | 4005f47b | glowing (2차) |
| proj_leg_sun_phoenix | 5607c9e4 | 5607c9e4 | dfeda269 | pulsing (2차) |
| proj_leg_tempest | b8965db8 | bcddf1e1 | e320f41f | glowing (3차) |
| (holdover) proj_leg_thunder_lord | f7a94741 | 5b9f65fb | — | 3 verb fail |

**6슬롯 cap 적용** (다른 세션 캐릭터 작업 공유).



### ✓ Batch 19 — holdover 4차 verb recovery (2/6)

이전 Batch 16-18에서 3 verb cascade 실패한 6 holdover에 4차 verb 시도:

| 무기 | 시도 verb 4종 | 결과 |
|---|---|---|
| proj_meteor | float/glow/pulse/**spinning** | ✓ 4차 spinning 성공 (b207866d) |
| proj_spear | float/spin/drift/**shimmering** | ✓ 4차 shimmering 성공 (a7f28f67) |
| proj_spell_shadow_flame | float/drift/swirl/**pulse** | ✗ 4 verb fail — alt source 필요 |
| proj_elemental_burst | float/crackle/glow/**shimmer** | ✗ 4 verb fail — alt source 필요 |
| proj_leg_frozen_throne | float/glow/shimmer/**pulse** | ✗ 4 verb fail — alt source 필요 |
| proj_leg_seraph_wing | float/shimmer/drift/**glow** | ✗ 4 verb fail — alt source 필요 |

**관찰**: 4 verb 시도 후에도 fail인 source는 stubborn-source 패턴 확정. 4 permanent holdover 모두 64x64 큰 자산 (zone/AoE) — PixelLab이 큰 자산 animate에 약한 경향 재확인. 다음 세션에서 alt source swap 또는 정적 fallback 유지.

### ✓ 이번 세션 추가 wire (Batch 16+17+18 = 18개) — verb cascade + holdover 관리

총 24 promote → 18 animate 성공 (6 holdover, 75% 성공률):

**Batch 16 (basic 8, 6/8 = 75%)**:
| 무기 | source | promoted | anim_id | 성공 verb |
|---|---|---|---|---|
| proj_dawnbreaker | 30422565 | 2be9f868 | 7e0997bc | floating gently (1차) |
| proj_hunters_blade | f89fc734 | 00585024 | d297d25c | floating gently (1차) |
| proj_scythe | e1b4e9d9 | eb9c1e32 | a8092268 | swinging (2차) |
| proj_ice_spear | ddd3ac51 | 2a20c256 | a4059f45 | drifting (2차) |
| proj_divine_hammer | 7b923b8c | d3e1d94d | 70efb7a0 | rotating (3차) |
| proj_phantom_arrow | 17bc8c57 | 4e18200d | b832e13d | shimmering (3차) |
| (holdover) proj_meteor | 6062d5a0 | db604e0e | — | 3 verb fail |
| (holdover) proj_spear | 63d8a46f | e9849e73 | — | 3 verb fail |

**Batch 17 (basic 8, 6/8 = 75%)**:
| 무기 | source | promoted | anim_id | 성공 verb |
|---|---|---|---|---|
| proj_consecrate | 2e828d16 | a2eb517a | 8f2ecf43 | floating gently (1차) |
| proj_glacial_lance | 9b3ae4d0 | 008bbcac | b046bf07 | floating gently (1차) |
| proj_smite | 5e21eb7e | 7719d4db | 7dbecfcb | pulsing (2차) |
| proj_throw_axes | 2ab67c37 | e5f5ae1c | f462df9c | spinning (2차) |
| proj_shield_throw | b6bb945f | 39549f2f | 0e4b4778 | shimmering (3차) |
| proj_spell_rune_circle | 4ec38e59 | a35d10d0 | bef8556f | glowing (3차) |
| (holdover) proj_spell_shadow_flame | 7996d731 | 3fce0fdc | — | 3 verb fail |
| (holdover) proj_elemental_burst | 3987bbb9 | d3c2894d | — | 3 verb fail |

**Batch 18 (legendary 8, 6/8 = 75%)**:
| 무기 | source | promoted | anim_id | 성공 verb |
|---|---|---|---|---|
| proj_leg_arrow | 5d5fd336 | 4715958a | 9dd05b18 | floating gently (1차) |
| proj_leg_axe | 72bfb3d0 | bbf83306 | fb04c248 | floating gently (1차) |
| proj_leg_bible | 02951f23 | 70fb3b84 | e08af5b3 | glowing (2차) |
| proj_leg_crimson_knives | b412f62f | e29ca747 | 43e36afa | spinning (2차) |
| proj_leg_cross | 32d5f34a | e09531db | 979d677d | glowing (3차) |
| proj_leg_inferno_wall | 0f95d6d9 | 8df4f91d | f349cdb1 | swirling (3차) |
| (holdover) proj_leg_frozen_throne | bb9afc1d | 377cc489 | — | 3 verb fail |
| (holdover) proj_leg_seraph_wing | a285d7d5 | 8340be04 | — | 3 verb fail |

**Batch 16-18 핵심 관찰**:
- 1차 floating gently 성공률 25-37%, 2차/3차 다른 verb로 75% 도달
- PixelLab 서비스 오늘 매우 불안정 — 보통 Batch 14 수준의 50%+ 첫 시도가 25%로 떨어짐
- 64x64 큰 zone/AoE 자산 (consecrate, spell_rune_circle, leg_inferno_wall, leg_frozen_throne)이 더 실패 잦음
- Holdover 6개 → 다음 세션에서 alt source swap 권장 (Batch 15 패턴)
- 209/209 vitest 통과 (Batch 15 종료 시 207 → choices/active 신규 테스트 추가)

### ✓ 이전 세션 wire (Batch 15, 6개) — alternate source object swap 검증

전 세션 4차 retry 까지 실패했던 6개 무기를 review 큐의 **alternate** review object로 swap → frame promote → animate verb cascade 적용해 전부 성공. `pixellab-stubborn-source-swap` 메모리 패턴 검증 완료:

| 무기 | alt source_id | promoted_id | anim_id | 성공 verb (시도 횟수) |
|---|---|---|---|---|
| proj_meat_cleaver | 45707869 | b524a314 | a7e1f8d8 | floating gently (1차) |
| proj_gladius_throw | 77324042 | 21219f5a | 088abf44 | floating gently (1차) |
| proj_warcry_pulse | 9d368efa | 178c3608 | cc1e6b19 | pulsing (2차) |
| proj_spike_burst | f27040d2 | 447fa9fa | 6022eb00 | shimmering (2차) |
| proj_berserker_axe | 0a8ab354 | ca1cb665 | 45e77a9c | rotating (3차) |
| proj_crusader_lance | 817c09de | 435ea555 | 628594d3 | drifting (3차) |

**핵심 관찰**:
- 4 verb cascade (구체→단일→floating gently→대체) 대신 source swap 후 첫 시도 `floating gently`로 2개 즉시 성공
- 나머지 4개도 retry 2-3차로 모두 성공 (시도 verb: pulsing / shimmering / rotating / drifting)
- alternate source는 같은 review 큐 내 비슷한 컨셉의 다른 PNG로 충분 (description 키워드 매칭)
- 같은 source 4차+ retry보다 alternate source 1-3차 retry가 generation 절약 (각 ~3-5 saving)

### ✓ 이전 세션 wire (Batch 14, 8개)

별도 PixelLab 생성 없이 review 큐 promote만 사용 — `floating gently` verb 평균 2-3차 retry로 성공:

| 무기 | source_id | anim_id | tier | 비고 |
|---|---|---|---|---|
| proj_barbed_net | ab7aa4a3 | 688059cf | basic | spreading and snapping shut (1차) |
| proj_aegis_throw | edc1a080 | 48dd05d6 | basic | spinning slowly (1차) |
| proj_anvil_drop | fbd4e8a4 | 3c7da588 | basic | falling (2차) |
| proj_whirlwind_blade | c75cb94c | 4dfdc22a | basic | floating gently (3차) |
| proj_bear_trap | e81e1c31 | d64f7bfa | basic | floating gently (3차) |
| proj_salvo_shot | 228e2755 | 7d44b463 | basic | floating gently (1차) |
| proj_piercing_arrow | ff578555 | bd5b6b6f | basic | floating gently (2차) |
| proj_guardian_orbit | 343ff99d | 4d33c3d7 | basic | floating gently (2차) |

추가로 frost_nova / holy_nova도 4차 retry로 PNG 생성 + weaponAssets registry 등록했으나, 둘 다 weapon 정의에서 이미 `effectAsset: *_nova_fx` (sigAssets) 사용 중이라 실제 렌더는 변화 없음 (fallback layer만 보완).

### ✓ 이전 세션 누적 (Tier S 11 + Batch 13 pre-animated)

확정 적용된 무기 sprite (registry effective animated):
proj_arrow, proj_astral_staff, proj_axe, proj_chain_void, proj_cross,
proj_dagger_blade, proj_dagger_legendary, proj_divine_rain, proj_frost_nova\*,
proj_holy_nova\*, proj_judgement_beam, proj_lightning, proj_magma_burst,
proj_marksman_shot, proj_rune_violet, proj_rune_void, proj_spell_arcane_swirl,
proj_storm_arc, proj_tesla_arc, proj_vanguard_slash, proj_wand, proj_warhammer
+ 이번 세션 8개 (위 Batch 14)

(\* frost_nova / holy_nova는 effectAsset 우선)

### ✓ 적용 완료 (Tier S 11)

| 무기 | 컨셉 | base id | anim id |
|---|---|---|---|
| `proj_axe` | 회전 great-axe 5f | 65c11b27 | bb744656 |
| `proj_hunters_bow` | green energy arrow streak 5f | aee107cb | — |
| `proj_lightning` | crackle blue bolt 5f | fc42a65e | — |
| `proj_vanguard_slash` | golden holy slash 5f | 80489f55 | 6cb8244d |
| `proj_leg_blade` | frost-holy dawn crescent 5f | c376a89c | — |
| `proj_leg_scythe` | green poison reap 5f | c046e23a | — |
| `proj_leg_whip` | crimson chain lash 5f | e4de77d5 | — |
| `proj_leg_obsidian_blade` | purple-black shadow slash 5f | 3716b669 | — |
| `proj_spell_arcane_swirl` (wand) | pulsing arcane swirl 5f | 5818d7d7 | d7afb293 |
| `proj_cross` | spinning holy radiance 5f | e474b005 | 93b4cd5a |
| `proj_warhammer` | spinning rotating slow 5f | 6d8f0138 | 173c65a4 |
| `proj_astral_staff` | pulsing cosmic radiance 5f | 0d3f2cc6 | f1b2d40b |
| `proj_arrow` | east-pointing flying 5f | 330e354a | f80fd997 |
| `proj_rune_violet` (runetracer) | rotating violet rune 5f | a5fe2b6b | 5097373d |
| `proj_rune_void` (nox_runica) | pulsing void corruption 5f | e68a8697 | a99b7c76 |
| `proj_dagger_blade` (dagger_fan) | floating silver dagger 5f | 6bf54280 | 64e362eb |
| `proj_dagger_legendary` (dagger_storm) | flipping crimson dagger 5f | 921434f0 | 8e94accc |
| `proj_tesla_arc` (tesla_ring) | floating electric pulse 5f | d6cae0f6 | 0c17d3e6 |
| `proj_storm_arc` (storm_crown) | crackling golden halo 5f | dee2a130 | e1691829 |

### ⚪ 미적용 (우선순위 list, 2026-05-22 PM 갱신)

Batch 14+15에서 가져간 14개를 차감한 list:

**기타 basic 미적용 ~28개**:
- 사출기: nova, spear, knives, sword, holy_nova\*, divine_rain, soul_arrow, marksman_shot, phantom_arrow, hunters_blade, arcane_orb_v2, frost_nova\*, magma_burst, glacial_lance, chain_void, elemental_burst, meteor, scythe, dawnbreaker, judgement_beam
- 설치/aoe: holywater\*, firewall\*, divine_hammer, smite, time_stop, void_sphere
- aura damage: sanctuary, consecrate, leg_world_tree, arcane_orb
- buff aura (PNG 애니 불필요): wrath_focus, holy_blessing, garlic_aura, arcane_field, heal_beam

(\* 일부 weaponAssets registry 등록되었으나 weapon 정의의 effectAsset(sigAssets)이 우선해 시각 효과는 sigAssets 측에 있음 — Phase E 참고)

## 비용 추정

| 항목 | 1개당 | Tier S 11개 | 전체 ~50개 |
|---|---|---|---|
| PixelLab generations | 21 (create 20 + animate 1) | 231 | ~1050 |
| Claude 토큰 | ~4-5k | ~50k | ~200k |
| 벽시간 (병렬 batch) | — | ~15분 | ~40-60분 |

PixelLab subscription 현재 972/5000 — Batch 24 종료. 미적용 8개 (스킵 권장: leg_necro_skull 캐릭터 컨셉 미사용 + 5 permanent holdover 4-verb fail + 2 reserved).

## Pipeline (1 무기당)

### A. 신규 자산 생성

```js
mcp__pixellab__create_1_direction_object({
  description: "east-pointing horizontal slash/arrow/bolt PNG, ...",
  size: 48,
  view: "top-down",
})
// → ~90s 후 review (16 candidates)
```

**prompt 작성 원칙**:
- "east-pointing horizontal" — spriteAngles 0 (default) 매칭
- "transparent background"
- "Vampire Survivors style"
- 색상/컨셉 명시 (예: glowing emerald green, purple-black shadow, frost-pale-blue)

### B. Frame promote

```js
mcp__pixellab__select_object_frames({
  object_id: <review_id>,
  indices: [7], // 중간 균등 pick
  common_tag: "proj_X",
})
// → 1 completed object (new_id)
```

### C. Animate

```js
mcp__pixellab__animate_object({
  object_id: <new_id>,
  animation_description: "spinning slowly / streaking forward / crackling pulsing",
  frame_count: 4,
  animation_name: "proj_X_motion",
})
// → ~180s 후 5 frames (frame_count + 1)
```

### D. 다운로드

```bash
BASE="https://backblaze.pixellab.ai/file/pixellab-characters/objects/9c338ce6-1b8f-4f3e-a302-31dde0bad543/<new_id>/animations/<anim_id>/unknown"
for i in 0 1 2 3 4; do
  curl -sSfL --retry 3 --retry-delay 2 "$BASE/$i.png" -o "public/projectiles/anim/proj_X_$i.png" &
done
wait
```

### E. weaponAssets.js 등록

```js
proj_X: {
  frames: [
    '/projectiles/anim/proj_X_0.png',
    '/projectiles/anim/proj_X_1.png',
    '/projectiles/anim/proj_X_2.png',
    '/projectiles/anim/proj_X_3.png',
    '/projectiles/anim/proj_X_4.png',
  ],
  fps: 10~16, // 회전 10, streak 12, crackle 14, snap slash 16
},
```

### F. spriteAngles.js (필요 시)

PNG가 east-pointing이면 entry 불필요 (default 0). north-pointing이면 `-Math.PI / 2`. 호의 안쪽이 motion 반대면 `Math.PI`.

### G. 테스트

```bash
npx vitest run --reporter=basic
```

## 우선순위 추천 (다음 세션)

### Phase A — 보류 6개 alternate-source 재시도 (저비용 우선)
같은 promoted object에 retry는 효과 없음이 입증됨. 다음 단계:
1. `list_objects --status review --limit 50`로 alternate 후보 검색
2. description으로 weapon 매칭 (예: 45707869 "rusty butcher cleaver" → meat_cleaver)
3. 새 review object에서 `select_object_frames([8])` → `animate_object(... 'floating gently')`
4. 동일 절차로 wire

### Phase B — Review 큐 ~70 남은 자산 추가 promote
86개 중 8개 사용. 약 70+ review object가 promote 대기 — pickup 13개 (별도 pickupAssets.js로) 분리하면 weapon용 ~57개. weapon 매칭 후 batch 8개씩 진행.

### Phase C — Legendary 25개 신규 생성
review 큐에 매칭 없는 legendary (leg_axe, leg_arrow, leg_cross, leg_bible, leg_demon_heart 등) — `create_1_direction_object`로 신규 생성 (각 20 gen). 후반 보상 임팩트 큼.

### Phase D — 자주 보이는 basic 직선 무기
nova, spear, knives, sword, smite — 게임플레이 노출 빈도 높음.

## 주의

- PixelLab 동시 잡 10개 한도 — 11번째 hard fail. semaphore 8~9 또는 batch.
- frame_count=4 → 5 frames 반환 (PixelLab inclusive endpoint).
- 다운로드 시 일부 frame 520 error 가능 — `--retry 3 --retry-delay 2` 권장.
- 같은 source object에 frame_count 동일 indices [3,7,11,15] 호출 시 conflict — 다른 index (예: [8])로.
- **animate_object 실패율 ~50% (2026-05-22 관측)** — verb 단순화 cascade (구체→단일→"floating gently") 2-4차 retry로 ~70% 성공. 4차까지 fail이면 source object 자체 문제로 간주, alternate review로 swap.
- `effectAsset` (sigAssets) 사용 무기는 weaponAssets entry보다 우선순위 높음 — 시각 변화 보려면 weapon 정의의 effectAsset 제거 또는 sigAssets 확장 필요.

## 관련 메모리

- `weapon-asset-frames-schema.md` — {frames, fps} 객체 schema
- `melee-qi-design-pattern.md` — 검기 sprite 공유 + 반경/색 차등
- `pixellab-rate-limit.md` — 동시 잡 10개 한도
- `pixellab-description-vs-actual-mismatch.md` — preview 확인 후 mapping
- `pixellab-animate-retry-verbs.md` — verb cascade (구체→단일→"floating gently")
- `pixellab-stubborn-source-swap.md` — 같은 source 4차+ fail 시 alternate로 교체 (이번 세션 추가)
- `effectasset-vs-weaponassets-priority.md` — effectAsset 우선순위로 weaponAssets 무효화 가능 (이번 세션 추가)
