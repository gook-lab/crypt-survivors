---
description: Claude memory + project .claude 문서 + gstack 스킬 + game 프로젝트 소스를 Desktop에 4개 zip으로 압축. 집/다른 기기 작업 이관용.
---

# /backup-claude

네 가지 백업을 한 번에 만들어 Desktop에 timestamped zip으로 저장:

1. **game-claude-memory-YYYYMMDD-HHMM.zip** — `~/.claude/projects/-Users-kyb-ontact-sonix-toy-game/memory/`
2. **game-claude-docs-YYYYMMDD-HHMM.zip** — `<project>/.claude/` (rules + commands + settings.local.json)
3. **gstack-skills-YYYYMMDD-HHMM.zip** — `~/.claude/skills/gstack/` (dist/node_modules/.git/zips 제외)
4. **game-project-YYYYMMDD-HHMM.zip** — 게임 프로젝트 소스 (node_modules/dist/.git/.vite 제외)

## 실행

```bash
DATE=$(date +%Y%m%d-%H%M)
DESK=~/Desktop

# 1. Project memory (memory/ 폴더만 — 대화 history는 100MB+라 제외)
cd "/Users/kyb-ontact/.claude/projects/-Users-kyb-ontact-sonix-toy-game"
zip -r "$DESK/game-claude-memory-${DATE}.zip" memory/ -q

# 2. Project .claude (rules + commands + settings.local.json)
cd /Users/kyb-ontact/sonix/toy/game
zip -r "$DESK/game-claude-docs-${DATE}.zip" .claude/ -q

# 3. gstack skills (lean — 빌드 산출물 + node_modules + git 제외)
cd /Users/kyb-ontact/.claude/skills
zip -r "$DESK/gstack-skills-${DATE}.zip" gstack/ -q \
  -x "gstack/browse/dist/*" \
  -x "gstack/**/node_modules/*" \
  -x "gstack/.git/*" \
  -x "gstack/**/.git/*" \
  -x "gstack/**/*.zip" \
  -x "gstack/**/*.tar.gz"

# 4. Game project source (소스 + public 자산. 빌드 산출물 + 의존성 + git 제외)
cd /Users/kyb-ontact/sonix/toy
zip -r "$DESK/game-project-${DATE}.zip" game/ -q \
  -x "game/node_modules/*" \
  -x "game/dist/*" \
  -x "game/.git/*" \
  -x "game/.vite/*" \
  -x "game/coverage/*" \
  -x "game/.DS_Store" \
  -x "game/**/.DS_Store"

echo "=== Created ==="
ls -lh "$DESK"/*${DATE}*.zip
```

## 복원 (다른 기기에서)

```bash
# 0. 게임 프로젝트 본체 복원 (다른 기기에 처음 받을 때)
mkdir -p /Users/<user>/sonix/toy
unzip game-project-*.zip -d /Users/<user>/sonix/toy/
cd /Users/<user>/sonix/toy/game && npm install

# memory 복원
mkdir -p "/Users/<user>/.claude/projects/-Users-<user>-sonix-toy-game"
unzip game-claude-memory-*.zip -d "/Users/<user>/.claude/projects/-Users-<user>-sonix-toy-game/"

# project .claude 복원
unzip game-claude-docs-*.zip -d /Users/<user>/sonix/toy/game/

# gstack 복원 (이미 설치되어 있으면 skip 또는 덮어쓰기 주의)
unzip gstack-skills-*.zip -d /Users/<user>/.claude/skills/
```

## 주의

- `-` (dash)로 시작하는 폴더명은 `./` 또는 `--` 접두사 없으면 zip이 flag로 오해석. 위 스크립트는 `cd` 후 상대경로로 우회.
- 대화 history (`*.jsonl` + UUID 폴더들)는 일부러 제외 — 100MB+이고 새 기기에선 의미 없음 (memory/ 만이 영구 자산).
- gstack은 빌드된 dist 제외라 새 기기에서 `cd ~/.claude/skills/gstack && ./setup` 한 번 필요할 수 있음.
