/**
 * Language bundles of one generated key group, keyed by language code.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { LanguageCode } from '../constants';
import type { Locale } from './Locale';

export type LocalesCollection = {
  [code in LanguageCode]?: Locale;
};
