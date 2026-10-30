# Localization

Every user-visible string goes through i18next. Translations live in CSV files; a generator turns them into a typed TypeScript module.

## Add a string

1. Add a row to `tools/localization/default.csv` (or another CSV there; the file name becomes the key group, e.g. `errors.csv` becomes `ERRORS`):

   ```csv
   key;en
   JOB_START_BUTTON;Start job
   ```

2. Regenerate:

   ```
   npm run locales:update
   ```

3. Use it:

   ```tsx
   const { t } = useTranslation();

   return <button type="button">{t(DEFAULT.JOB_START_BUTTON)}</button>;
   ```

## Rules of thumb

- Never edit `src/utils/localization/default.locales.ts` by hand. `npm run locales:check` (part of `npm run check`) fails when it does not match the CSVs.
- Keys are `SCREAMING_SNAKE_CASE`. Plurals use i18next suffixes (`ITEM_COUNT_one`, `ITEM_COUNT_other`) and are called with the bare key plus `{ count }`.
- Outside React (sagas, error mappers) pass the key around and call `t()` where it renders.
- Adding a language: add its code to `LANGUAGE_CODE` in `src/utils/localization/constants.ts` and a column to every CSV.
