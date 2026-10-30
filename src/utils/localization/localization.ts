/**
 * i18next set-up. Generated locale groups register their bundles here; the first registration initialises
 * i18next, later ones merge into it.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import i18next from 'i18next';
import type { Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, FALLBACK_LANGUAGE, LANGUAGE_CODE, STORED_LANGUAGE_KEY } from './constants';
import type { LanguageCode } from './constants';
import type { LocalesCollection } from './interfaces/LocalesCollection';

export const TRANSLATION_NAMESPACE = 'translation';

export const i18n: typeof i18next = i18next;

let isInitialized = false;

const getInitialLanguage = (): string => {
  try {
    return window.localStorage.getItem(STORED_LANGUAGE_KEY) || DEFAULT_LANGUAGE;
  } catch {
    // Storage can be disabled; the code default still works.
    return DEFAULT_LANGUAGE;
  }
};

const getResourcesByLanguage = (locales: LocalesCollection): Resource => {
  const resources: Resource = {};

  for (const locale of Object.values(locales)) {
    resources[locale.code] = { [TRANSLATION_NAMESPACE]: locale.translation };
  }

  return resources;
};

/**
 * Registers one generated key group. Import order between groups does not
 * matter because later calls merge into the running instance.
 */
export const registerLocales = (locales: LocalesCollection): void => {
  const resources: Resource = getResourcesByLanguage(locales);

  if (!isInitialized) {
    void i18n.use(initReactI18next).init({
      resources,
      lng: getInitialLanguage(),
      fallbackLng: FALLBACK_LANGUAGE,
      // A stale or unknown stored language falls back instead of rendering keys.
      supportedLngs: Object.values(LANGUAGE_CODE),
      // Keys are opaque identifiers, not paths. Without these, a dot or a
      // colon in a key would be read as a path or namespace separator.
      keySeparator: false,
      nsSeparator: false,
      interpolation: { escapeValue: false },
    });
    isInitialized = true;

    return;
  }

  for (const [code, resource] of Object.entries(resources)) {
    i18n.addResourceBundle(code, TRANSLATION_NAMESPACE, resource[TRANSLATION_NAMESPACE], true, true);
  }
};

/** Switches the language and remembers the choice for the next start. */
export const setLanguage = async (language: LanguageCode): Promise<void> => {
  try {
    window.localStorage.setItem(STORED_LANGUAGE_KEY, language);
  } catch {
    // Not being able to persist must not block the switch.
  }

  await i18n.changeLanguage(language);
};
