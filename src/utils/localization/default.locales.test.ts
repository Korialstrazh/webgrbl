import { LANGUAGE_CODE } from './constants';
import type { LanguageCode } from './constants';
import { LOCALE_GROUPS } from './default.locales';
import { i18n, TRANSLATION_NAMESPACE } from './localization';

const MINIMUM_EXPECTED_KEYS = 5;
const OPAQUE_KEY_PATTERN = /^[A-Z][A-Z0-9_]*$/;
const PLURAL_KEY_PATTERN = /^(.+)_(zero|one|two|few|many|other)$/;

type LocaleKeyGroup = Record<string, string>;

// All groups share one namespace, so parity is checked over every group at once.
const LANGUAGE_CODES: LanguageCode[] = Object.values(LANGUAGE_CODE);

const getDeclaredKeys = (): Set<string> => new Set<string>(
  Object.values(LOCALE_GROUPS).flatMap((group: LocaleKeyGroup) => Object.values(group)),
);

// A plural row (ITEM_COUNT_one) belongs to the key code uses (ITEM_COUNT).
const getBaseKey = (registeredKey: string): string => PLURAL_KEY_PATTERN.exec(registeredKey)?.[1] ?? registeredKey;

const getRegisteredKeys = (language: LanguageCode): string[] =>
  Object.keys(i18n.getResourceBundle(language, TRANSLATION_NAMESPACE));

describe('registered locales', () => {
  it.each(LANGUAGE_CODES)('registers every declared key in %s, and nothing extra', (language: LanguageCode) => {
    const declaredKeys: Set<string> = getDeclaredKeys();
    // getResourceBundle, not t(): t() falls back to another language and would hide a gap.
    const registeredKeys: Set<string> = new Set(getRegisteredKeys(language).map(getBaseKey));
    const missingKeys: string[] = [...declaredKeys].filter((key: string) => !registeredKeys.has(key));
    const extraKeys: string[] = [...registeredKeys].filter((key: string) => !declaredKeys.has(key));

    expect(missingKeys, `missing from ${language}`).toEqual([]);
    expect(extraKeys, 'not declared in any CSV').toEqual([]);
  });

  // Guards the parity test against passing on an emptied bundle.
  it('has a non-trivial number of keys', () => {
    expect(getDeclaredKeys().size).toBeGreaterThan(MINIMUM_EXPECTED_KEYS);
  });

  it('uses opaque SCREAMING_SNAKE keys', () => {
    const malformedKeys: string[] = [...getDeclaredKeys()].filter((key: string) => !OPAQUE_KEY_PATTERN.test(key));

    expect(malformedKeys).toEqual([]);
  });
});
