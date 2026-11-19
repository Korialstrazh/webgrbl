/**
 * One language bundle as registered with i18next.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { LanguageCode } from '../constants';
import type { Translation } from './Translation';

export interface Locale {
  code: LanguageCode;
  translation: Translation;
}
