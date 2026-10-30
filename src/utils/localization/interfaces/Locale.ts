/**
 * One language bundle as registered with i18next.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { LanguageCode } from '../constants';
import type { Translation } from './Translation';

export interface Locale {
  code: LanguageCode;
  translation: Translation;
}
