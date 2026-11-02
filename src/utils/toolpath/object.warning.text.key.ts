/**
 * The translation key of the text of each kind of object warning, shared by the export confirmation, the Toolpath
 * view and the Objects list.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../localization/default.locales';
import { SVG_UNSUPPORTED_KIND } from '../svg/geometry/svg.shape.constants';
import type { SvgUnsupportedKind } from '../svg/geometry/svg.shape.constants';

export const OBJECT_WARNING_TEXT_KEY: Readonly<Record<SvgUnsupportedKind, string>> = {
  [SVG_UNSUPPORTED_KIND.TEXT]: DEFAULT.OBJECT_WARNING_TEXT,
  [SVG_UNSUPPORTED_KIND.IMAGE]: DEFAULT.OBJECT_WARNING_IMAGE,
  [SVG_UNSUPPORTED_KIND.USE_LIMIT]: DEFAULT.OBJECT_WARNING_USE_LIMIT,
  [SVG_UNSUPPORTED_KIND.OFF_PAGE]: DEFAULT.OBJECT_WARNING_OFF_PAGE,
  [SVG_UNSUPPORTED_KIND.CLIPPED]: DEFAULT.OBJECT_WARNING_CLIPPED,
};
