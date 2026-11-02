/**
 * The translation key of the short label of each kind of object warning, with its count, for the warnings chip of the
 * Toolpath view: it says what part of an object is affected and what happens to it, for example "text left out (2)".
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../localization/default.locales';
import { SVG_UNSUPPORTED_KIND } from '../svg/geometry/svg.shape.constants';
import type { SvgUnsupportedKind } from '../svg/geometry/svg.shape.constants';

export const OBJECT_WARNING_KIND_LABEL_KEY: Readonly<Record<SvgUnsupportedKind, string>> = {
  [SVG_UNSUPPORTED_KIND.TEXT]: DEFAULT.TOOLPATH_WARNINGS_KIND_TEXT,
  [SVG_UNSUPPORTED_KIND.IMAGE]: DEFAULT.TOOLPATH_WARNINGS_KIND_IMAGE,
  [SVG_UNSUPPORTED_KIND.USE_LIMIT]: DEFAULT.TOOLPATH_WARNINGS_KIND_USE_LIMIT,
  [SVG_UNSUPPORTED_KIND.OFF_PAGE]: DEFAULT.TOOLPATH_WARNINGS_KIND_OFF_PAGE,
  [SVG_UNSUPPORTED_KIND.CLIPPED]: DEFAULT.TOOLPATH_WARNINGS_KIND_CLIPPED,
};
