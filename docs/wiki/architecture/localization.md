---
title: Localization
created: 2026-10-30
---

# Localization

CSV-driven i18next setup: translators edit CSVs, a generator writes a typed module, the app imports it once at start-up.

## Key Takeaways

- **CSV is the only editing surface.** `tools/localization/*.csv` (`;`-delimited, first column `key`, one column per language). The basename becomes the exported key group (`default.csv` becomes `DEFAULT`).
- **Generated module.** `npm run locales:update` validates every CSV (key shape, no duplicates across files, every language filled) before writing anything, then writes `src/utils/localization/default.locales.ts` and re-sorts the CSVs. `npm run locales:check` regenerates and fails on any diff.
- **One namespace.** All groups land in i18next's default `translation` namespace; `keySeparator` and `nsSeparator` are off so keys stay opaque.
- **Side-effect import.** `src/main.tsx` and `vitest.setup.ts` import `default.locales` before anything calls `t()`; the first `registerLocales` call initialises i18next.
- **English only** for now (`LANGUAGE_CODE` in `constants.ts`). Tests render through the real i18n instance, so a raw key reaching the DOM fails them.
- **Guard test.** `default.locales.test.ts` checks that every declared key is registered in every language (via `getResourceBundle`, not `t()`), and that keys are SCREAMING_SNAKE.

## Source

- `tools/localization/build.locales.from.csv.cjs`
- `tools/localization/default.csv`
- `src/utils/localization/` (`constants.ts`, `localization.ts`, `default.locales.ts`, `default.locales.test.ts`, `interfaces/`)
- `src/main.tsx`
- `vitest.setup.ts`
