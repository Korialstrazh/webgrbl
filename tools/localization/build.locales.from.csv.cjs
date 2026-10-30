/**
 * Generates src/utils/localization/default.locales.ts from every *.csv in
 * this directory. The CSV basename becomes the exported key-group constant
 * (errors.csv -> ERRORS). Run via `npm run locales:update`.
 */
const fs = require('fs');
const path = require('path');

const DELIMITER = ';';
const KEY_COLUMN = 'key';
const KEY_PATTERN = /^[A-Z][A-Z0-9_]*$/;
// i18next plural keys: GROUPS_MATCH_COUNT_one, GROUPS_MATCH_COUNT_other. The
// suffixes are the Intl.PluralRules categories; code uses the bare base key
// with a `count` option, and i18next picks the row.
const PLURAL_KEY_PATTERN = /^(.+)_(zero|one|two|few|many|other)$/;
const OUTPUT_PATH = path.resolve(__dirname, '../../src/utils/localization/default.locales.ts');

const BANNER = `/* eslint-disable */
/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * Add or change translations in the CSV files under tools/localization,
 * then run:
 *
 *   npm run locales:update
 *
 * Any manual edit here is overwritten by the next generator run, and CI
 * fails the build when this file does not match the CSV sources.
 */
import { registerLocales } from './localization';
`;

const errors = [];
const fail = (fileName, message) => errors.push(`${fileName}: ${message}`);

/** default.csv -> DEFAULT, success.messages.csv -> SUCCESS_MESSAGES */
const getGroupName = (fileName) => path
  .basename(fileName, '.csv')
  .replace(/[^a-zA-Z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '')
  .toUpperCase();

/** DEFAULT -> Default, SUCCESS_MESSAGES -> SuccessMessages */
const getTypeName = (groupName) => groupName
  .split('_')
  .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
  .join('');

const splitRow = (line) => line.split(DELIMITER).map((cell) => cell.trim());

// A line ending in the delimiter (a trailing empty column) is allowed; empty cells inside the row are not.
const dropTrailingEmptyCells = (cells) => {
  const trimmedCells = [...cells];

  while (trimmedCells.length && !trimmedCells[trimmedCells.length - 1].length) {
    trimmedCells.pop();
  }

  return trimmedCells;
};

// The generated module exports this name itself, so no CSV may produce it.
const RESERVED_GROUP_NAMES = new Set(['LOCALE_GROUPS']);

const readLines = (fileName) => fs
  .readFileSync(path.join(__dirname, fileName), 'utf8')
  .replace(/^\uFEFF/, '') // Excel writes a BOM; it would corrupt the `key` header.
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.length);

const csvNames = fs.readdirSync(__dirname)
  .filter((fileName) => fileName.endsWith('.csv'))
  .sort();

if (!csvNames.length) {
  console.error('No CSV files found in tools/localization.');
  process.exit(1);
}

/** GROUPS_MATCH_COUNT_one -> GROUPS_MATCH_COUNT; a plain key is its own base. */
const getBaseKey = (key) => {
  const pluralMatch = PLURAL_KEY_PATTERN.exec(key);

  return pluralMatch ? pluralMatch[1] : key;
};

const isPluralKey = (key) => PLURAL_KEY_PATTERN.test(key);

const groups = [];
const groupFiles = new Map(); // group name -> the CSV that produced it first
const seenKeys = new Map(); // key -> the CSV that declared it first
const pluralRowFiles = new Map(); // plural base key -> every CSV that declares one of its rows
const plainKeys = new Set();

for (const fileName of csvNames) {
  const lines = readLines(fileName);
  const groupName = getGroupName(fileName);

  if (lines.length < 2) {
    fail(fileName, 'has a header but no rows');
    continue;
  }

  if (!KEY_PATTERN.test(groupName)) {
    fail(fileName, `basename yields "${groupName}", which is not a valid identifier`);
    continue;
  }

  if (RESERVED_GROUP_NAMES.has(groupName)) {
    fail(fileName, `basename yields "${groupName}", which the generated module already exports`);
    continue;
  }

  if (groupFiles.has(groupName)) {
    fail(fileName, `basename yields "${groupName}", which ${groupFiles.get(groupName)} already produces`);
    continue;
  }

  groupFiles.set(groupName, fileName);

  const headerCells = dropTrailingEmptyCells(splitRow(lines[0]));

  if (headerCells.some((cell) => !cell.length)) {
    fail(fileName, 'header has an empty column between language columns');
    continue;
  }

  const [keyHeader, ...languages] = headerCells;

  if (keyHeader !== KEY_COLUMN) {
    fail(fileName, `first header cell must be "${KEY_COLUMN}", found "${keyHeader}"`);
    continue;
  }

  if (!languages.length) {
    fail(fileName, 'declares no language columns');
    continue;
  }

  const rows = [];

  for (const line of lines.slice(1)) {
    const [key, ...values] = dropTrailingEmptyCells(splitRow(line));

    const baseKey = getBaseKey(key);

    if (!KEY_PATTERN.test(baseKey)) {
      fail(fileName, `key "${key}" must match ${KEY_PATTERN}, optionally with a plural suffix`);
      continue;
    }

    if (seenKeys.has(key)) {
      fail(fileName, `key "${key}" is already declared in ${seenKeys.get(key)}`);
      continue;
    }

    if (values.length > languages.length) {
      fail(fileName, `key "${key}" has more cells than languages - does a translation contain "${DELIMITER}"?`);
      continue;
    }

    const missing = languages.filter((language, index) => !values[index]);

    if (missing.length) {
      fail(fileName, `key "${key}" has no translation for: ${missing.join(', ')}`);
      continue;
    }

    seenKeys.set(key, fileName);
    rows.push({ key, baseKey, values });

    if (isPluralKey(key)) {
      pluralRowFiles.set(baseKey, new Set([...(pluralRowFiles.get(baseKey) ?? []), fileName]));
    } else {
      plainKeys.add(key);
    }
  }

  rows.sort((left, right) => left.key.localeCompare(right.key));

  groups.push({ fileName, header: lines[0], groupName, languages, rows });
}

/** The plural categories a language distinguishes, e.g. one/other for en and de, one/few/many/other for pl. */
const getPluralCategories = (language) => new Intl.PluralRules(language).resolvedOptions().pluralCategories;

// Checked only once every row is valid: a rejected row would otherwise also be
// reported as a missing plural row.
const validatePluralKeys = () => {
  for (const [baseKey, fileNames] of pluralRowFiles) {
    const [fileName] = fileNames;

    if (fileNames.size > 1) {
      fail(fileName, `plural key "${baseKey}" has rows in more than one CSV: ${[...fileNames].join(', ')}`);
      continue;
    }

    if (plainKeys.has(baseKey)) {
      fail(fileName, `key "${baseKey}" is declared both plain and with plural suffixes`);
      continue;
    }

    // i18next does not fall back from a missing category row to `other`; it shows the raw key.
    const { languages } = groups.find((group) => group.fileName === fileName);
    const requiredSuffixes = new Set(languages.flatMap(getPluralCategories));
    const missingRows = [...requiredSuffixes]
      .map((suffix) => `${baseKey}_${suffix}`)
      .filter((rowKey) => !seenKeys.has(rowKey));

    if (missingRows.length) {
      fail(fileName, `plural key "${baseKey}" needs rows for: ${missingRows.join(', ')}`);
    }
  }
};

if (!errors.length) {
  validatePluralKeys();
}

// Nothing is written until every CSV has passed validation. Rejected rows are
// dropped from `rows`, so rewriting a source file mid-loop would delete the
// translator's bad row instead of reporting it.
if (errors.length) {
  console.error(`Locale generation failed:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}

// Rewrite each source CSV sorted and LF-normalised, so a translator's
// appended row does not show up as a reordered diff next time.
for (const { fileName, header, rows } of groups) {
  fs.writeFileSync(
    path.join(__dirname, fileName),
    `${[header, ...rows.map(({ key, values }) => [key, ...values].join(DELIMITER))].join('\n')}\n`,
    'utf8',
  );
}

const buildGroup = ({ groupName, languages, rows }) => {
  const keyConstants = [...new Set(rows.map(({ baseKey }) => baseKey))]
    .sort((left, right) => left.localeCompare(right))
    .map((baseKey) => `  ${baseKey}: '${baseKey}',`)
    .join('\n');

  const getTranslationKey = (key, baseKey) => (key === baseKey
    ? `[${groupName}.${key}]`
    : `[\`\${${groupName}.${baseKey}}${key.slice(baseKey.length)}\`]`);

  const localeEntries = languages
    .map((language, index) => {
      const translations = rows
        .map(({ key, baseKey, values }) => `      ${getTranslationKey(key, baseKey)}: ${JSON.stringify(values[index])},`)
        .join('\n');

      return `  ${language}: {\n    code: '${language}',\n    translation: {\n${translations}\n    },\n  },`;
    })
    .join('\n');

  return `// #region ${groupName}
export const ${groupName} = {
${keyConstants}
} as const;

export type ${getTypeName(groupName)}LocaleKey = (typeof ${groupName})[keyof typeof ${groupName}];

registerLocales({
${localeEntries}
});
// #endregion
`;
};

const localeKeyUnion = groups
  .map(({ groupName }) => `${getTypeName(groupName)}LocaleKey`)
  .join(' | ');

// Every group in one object, so a test can assert bundle parity over all of
// them without naming each group by hand.
const groupsAggregate = `export const LOCALE_GROUPS = {
${groups.map(({ groupName }) => `  ${groupName},`).join('\n')}
} as const;`;

const output = [
  BANNER,
  ...groups.map(buildGroup),
  groupsAggregate,
  '',
  `export type LocaleKey = ${localeKeyUnion};`,
  '/* eslint-enable */',
].join('\n');

fs.writeFileSync(OUTPUT_PATH, `${output}\n`, 'utf8');

const keyCount = new Set([...seenKeys.keys()].map(getBaseKey)).size;

console.log(`Wrote ${OUTPUT_PATH} (${keyCount} keys from ${seenKeys.size} rows, ${groups.length} group(s)).`);
