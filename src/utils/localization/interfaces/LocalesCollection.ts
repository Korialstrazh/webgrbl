/**
 * Language bundles of one generated key group, keyed by language code.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { LanguageCode } from '../constants';
import type { Locale } from './Locale';

export type LocalesCollection = {
  [code in LanguageCode]?: Locale;
};
