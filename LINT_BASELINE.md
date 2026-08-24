# Lint & Format Baseline Report

**Date:** 2026-08-24  
**Branch:** develop  
**Status:** Baseline established (no fixes applied)

## Configuration Summary

### 1. ESLint 9 (Flat Config)
- **Config file:** `eslint.config.js`
- **Base:** @eslint/js recommended rules
- **Globals:** browser + node
- **Ignored:** `dist/`, `node_modules/`, `docs/`, `public/`
- **Special rules:** `no-unused-vars: warn`

### 2. Prettier
- **Config file:** `.prettierrc.json`
- **Chosen option:** A (custom style)
- **Rationale:** Option A had 86 files with style issues vs Option B's 104 files
- **Configuration:**
  ```json
  {
    "tabWidth": 2,
    "semi": true,
    "trailingComma": "all",
    "printWidth": 80,
    "arrowParens": "avoid",
    "singleQuote": true
  }
  ```
- **Ignore file:** `.prettierignore`
  - dist, node_modules, docs, public, src/assets/art

### 3. NPM Scripts
- `npm run lint` — Run ESLint
- `npm run format` — Apply Prettier fixes
- `npm run format:check` — Check Prettier compliance without fixing

## Debt Metrics (Baseline)

### ESLint
- **Total problems:** 340 (290 errors, 50 warnings)
- **Fixable:** 1 warning
- **Primary issues:** 
  - Duplicate keys in object literals (weaponAssets.js)
  - Unused eslint-disable directive (zzfx.js)

### Prettier
- **Files with style issues:** 86 (Option A adoption)
  - Most violations are formatting (spacing, semicolons, quotes)
  - No actual reformat required on current run (0 files would be reformatted)

### Tests
- **Status:** ✓ All 282 tests pass
- **Duration:** 2.12s
- **Test files:** 27 passed

## Next Steps

1. **No full reformat applied** — Debt is intentionally preserved as baseline
2. **Point-fix approach:** Address violations incrementally during regular development
3. **Lint gate:** Consider blocking new violations via CI once baseline is stable
4. **Future expansion:** After debt is reduced, consider adding:
   - Stricter ESLint rules (e.g., unicorn, security-focused plugins)
   - Husky pre-commit hooks for lint + format enforcement

## Key Design Decisions

- **No pre-commit hooks:** Allows flexibility during development; team can decide when to enforce
- **Warn-only for no-unused-vars:** Builds are not blocked by unused variables; deprecation warnings suffice
- **Prettier as single formatter:** Ensures consistency without manual debate on style
- **Preserved debt:** Reflects real state of codebase; reductions should be deliberate and measured
