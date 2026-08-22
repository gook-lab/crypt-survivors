---
description: balance.js autoPick weapon-new score를 WEAPON_SLOTS 변경에 맞춰 자동 재튠 + 5 seed × 10min harness 실행하여 회귀 검출 — slot 4→5 확장 같은 빌드 자유도 변경 후 1단계 자동 검증.
---

# /tune-autopick

`scripts/balance.js`의 `autoPick` 휴리스틱은 4 slot 시대에 튠된 weapon-new score 80을 가짐. WEAPON_SLOTS가 변경되면 휴리스틱이 빌드 분산을 과도하게 끌어내려 sim 결과가 회귀처럼 보임. 이 command는 그 coupling을 surface + auto-retune.

## Why this exists

`autopick-slot-coupling` memory: WEAPON_SLOTS 4→5 적용 시 autoPick이 weapon-new 80 우선순위로 5개 슬롯 모두 채우려 함 → 빌드 wider but shallower → balance.js 5 seed 모두 sub-200s 사망. weapon-new를 multi(72) 아래로 (예: 65) 낮춰야 baseline 회복.

## Steps

1. Read `src/choices.js` `WEAPON_SLOTS` 상수 + `scripts/balance.js` `autoPick`의 weapon-new score.
2. Compare to 4 slot baseline (weapon-new=80, multi=72):
   - 4 slots → weapon-new 80 (default)
   - 5 slots → weapon-new 65 (below multi)
   - 6 slots → weapon-new 55 (well below all offensive passives)
   - General: `weapon-new ≈ 80 - 7 × (slots - 4)`
3. 현재 balance.js autoPick score가 이 공식에서 ±5 이상 벗어나면 mismatch warning.
4. AskUserQuestion으로 새 score 적용 여부 묻기 (default: 공식 값).
5. 사용자 승인 후 `scripts/balance.js` autoPick 수정 + comment 갱신 (slot count + 변경 사유 명시).
6. `node scripts/balance.js` 실행 → 5 seed × 10min 결과 출력.
7. 결과 분석:
   - 0/5 survive 10:00 → 추가 monster scaling 완화 권고 (`hpPerMinute` 우선 — `levelscale-floor-masks-hpperlevel` 메모리 참조)
   - 1-3/5 survive → baseline OK
   - 4-5/5 survive → 너무 쉬워졌을 가능성, hpPerMinute 올리기 권고
8. bipolar distribution (강 빌드 600s, 약 빌드 sub-150s) 정상으로 표시 — `bipolar-build-distribution` 메모리 참조.

## What it does NOT do

- WEAPON_SLOTS 자체는 변경 안 함 (그건 design 결정)
- `hpPerMinute`/`hpPerLevel` 자동 조정 안 함 (별도 PR scope)
- in-game $B 검증 안 함 (수동)
- PASSIVE_SLOTS coupling은 검사 안 함 (현재 autoPick에 passive-new score 없음 — passive-up과 passive-new 동일 score)

## Known incidents this would catch

- **Slot 4→5 expansion (2026-05-22)**: autoPick weapon-new 80 그대로 두면 sub-200s 사망 회귀. 65로 낮추면 seed 5: 332s/Lv 25 회복. 수동으로 5분 디버깅 후 발견 → 이 command로 즉시 자동.

## Output format

```
=== Slot/AutoPick Coupling Check ===
Current WEAPON_SLOTS:   5
Current weapon-new score: 80 ⚠️  (expected ~65 for 5 slots)
Suggested:               65 (passive 'multi'=72 보다 낮음)

Apply suggested score? [Y/n]
... (after apply)

=== Balance harness (5 seed × 10min) ===
seed 1: ...
...
1/5 survive 10:00 ✓ baseline 회복
seed 5 peak levelScale 1.62 ✓ monster scaling 자기조절 작동
```

## See also

- `/validate-balance-harness` — signature drift (별개 issue, autoPick coupling 안 잡음)
- `[[autopick-slot-coupling]]` memory — coupling 이론
- `[[bipolar-build-distribution]]` memory — 분포 해석
- `[[levelscale-floor-masks-hpperlevel]]` memory — 회귀 fix 시 hpPerMinute 우선
