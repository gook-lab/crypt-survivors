---
description: PixelLab REVIEW 자산을 게임 시그니처/무기에 통합하는 8단계 자동화 파이프라인 (promote → 다운로드 → sigAssets → signatures/weapons → 테스트 → 무기고 검증)
---

# /integrate-pixellab-asset

PixelLab `review` 상태 객체를 시그니처(signatures.js) 또는 무기(weapons.js)의
임팩트/메테오/존/이펙트 자산으로 끝까지 통합한다. 이 세션에서 `tesla_burst`
(Porta tesla_field) + `gennaro_blood_splash` (Gennaro blade_volley) 두 사이클로
검증된 절차의 자동화. CLAUDE.md "Add / replace a PixelLab signature impact"의
실행 가능 버전.

## 사용법

```
/integrate-pixellab-asset <review_id> <key> <target_field> <target_id> [frames]
```

인자:
- `review_id` — `mcp__pixellab__list_objects --status review`로 얻은 UUID
- `key` — sigAssets 키 (snake_case, 예: `tesla_burst`, `gennaro_blood_splash`)
- `target_field` — `impactAsset` | `meteorAsset` | `groundAsset` | `effectAsset`
- `target_id` — `signatures.js`의 시그니처 키 (예: `tesla_field`) 또는
  `weapons.js`의 무기 ID
- `frames` (옵션) — 콤마 구분 4개 인덱스. 기본 `3,7,11,15` (16-pack burst
  균등분포 — birth → expand → peak → decay). 다른 시퀀스 원하면 명시

대화형 호출 (인자 없이) — 빠진 인자를 AskUserQuestion으로 차례로 확인.

## 8단계 파이프라인

1. **검증**
   `mcp__pixellab__get_object(review_id, include_preview=false)`
   status가 `review`인지 확인. 아니면 abort + 사용자에게 보고.

2. **Promote**
   `mcp__pixellab__select_object_frames(review_id, indices=<frames>, common_tag=<key>)`

3. **다운로드**
   각 frame URL을 `curl -sSfL "<frame URL>" -o public/sigs/<key>_<i>.png`로
   저장 (i = 0..3). HTTP 실패 시 즉시 보고.

4. **sigAssets.js 등록**
   `src/util/sigAssets.js`의 `SIG_ASSETS`에 추가:
   ```js
   <key>: {
     frames: [
       '/sigs/<key>_0.png',
       '/sigs/<key>_1.png',
       '/sigs/<key>_2.png',
       '/sigs/<key>_3.png',
     ],
     fps: 12,
   },
   ```
   유사 자산(`knight_flare`, `tesla_burst` 등) 옆에 배치.

5. **타겟 연결**
   - 시그니처면 `src/content/signatures.js`의 `<target_id>`에 `<target_field>: '<key>'` 추가/교체
   - 무기면 `src/content/weapons.js`에서 동일하게
   기존 `<target_field>` 값이 있으면 교체, 없으면 신규 라인 추가.

6. **테스트**
   `npx vitest run --reporter=basic` — 204+ tests 통과 확인. 실패하면 어느
   파일/테스트인지 사용자에게 보고하고 멈춤 (자동 롤백 안 함 — 사용자 판단).

7. **무기고 시각 검증**
   dev 서버 가동 중이 아니면 `npm run dev` 백그라운드 시작 후 포트 대기:
   `until curl -sSf http://localhost:7154/ > /dev/null 2>&1 || curl -sSf http://localhost:7155/ > /dev/null 2>&1; do sleep 1; done`
   gstack browse로 진입:
   ```
   $B goto "http://localhost:<port>/"
   $B click "text=무기고"
   $B waitfor "text=시그니처" --timeout 3000
   $B screenshot /tmp/arsenal-<key>.png
   ```

8. **검증 보고**
   스크린샷을 사용자에게 보여주고, `<target_id>` 카드에 "PixelLab" 라벨이
   떴는지 확인. "Graphics fallback"이 그대로면 sigAssets 키 매칭 오타 의심.

## 차별화 규칙 (적용 전 확인)

동일 `kind`(arrows/beam/meteor)를 공유하는 다른 시그니처가 같은 키를 쓰면
무기고에서 둘이 동일하게 보임. 이번 세션에서 huntress `arrow_rain` /
gennaro `blade_volley` 둘 다 `arrow_impact` 쓰던 게 정확히 그 버그. 이 커맨드
실행 전:

```bash
grep -n "<target_field>: '<key>'" src/content/signatures.js src/content/weapons.js
```

다른 곳에서 같은 키 쓰면 사용자에게 알리고 진행할지 확인. 동일 사용은 의도된
경우(예: `arrow_impact`를 모든 huntress 활을 위한 공유)도 있으니 강제 abort
하지 말 것.

## 실패 처리

- review status 아님 → "이미 promote됐거나 dismiss됐을 수 있음. list_objects --status completed 확인" 보고
- frame URL 404 → 다른 indices로 재시도 제안 (예: 0,4,8,12)
- vitest 실패 → 변경 파일 diff 보여주고 사용자 판단 대기
- 무기고 카드 라벨 없음 → sigAssets 키 정확히 일치 확인 (오타 / 대소문자)
- 자산 부족 (review에 적합한 게 없음) → `mcp__pixellab__create_object` 호출
  제안 (description 작성 → 1-2분 대기 → 새 review_id로 재실행)

## 참고

- 절차의 데이터/원칙: `CLAUDE.md` "Add / replace a PixelLab signature impact"
- 차별화 원칙: `.claude/rules/game-architecture.md` "Signature visual differentiation"
- 검증 통로: `src/ui/arsenal.js` 시그니처 섹션
- 실제 적용 사례: `tesla_burst` (review id f4292727, frames 10,2,14,5),
  `gennaro_blood_splash` (review id 29e8dcae, frames 3,7,11,15)
