/**
 * Language codes the app ships and the defaults used at start-up. English only for now; adding a language means a
 * new code here and a new column in every CSV under tools/localization.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const LANGUAGE_CODE = {
  EN: 'en',
} as const;

export type LanguageCode = (typeof LANGUAGE_CODE)[keyof typeof LANGUAGE_CODE];

/** Language a first-time user sees. */
export const DEFAULT_LANGUAGE: LanguageCode = LANGUAGE_CODE.EN;

/** Language used when a key is missing from the active one. */
export const FALLBACK_LANGUAGE: LanguageCode = LANGUAGE_CODE.EN;

export const STORED_LANGUAGE_KEY = 'selected-language';
