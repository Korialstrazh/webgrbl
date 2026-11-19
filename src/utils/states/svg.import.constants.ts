/**
 * Fixed values of the SVG import: the toast message per failure reason.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DEFAULT } from '../localization/default.locales';
import { SVG_IMPORT_ERROR_KIND } from '../svg/svg.constants';
import type { SvgImportErrorKind } from '../svg/svg.constants';

export const SVG_IMPORT_FAILURE_TOAST_KEY: Record<SvgImportErrorKind, string> = {
  [SVG_IMPORT_ERROR_KIND.NOT_SVG]: DEFAULT.TOAST_SVG_IMPORT_FAILED_NOT_SVG,
  [SVG_IMPORT_ERROR_KIND.NO_SIZE]: DEFAULT.TOAST_SVG_IMPORT_FAILED_NO_SIZE,
  [SVG_IMPORT_ERROR_KIND.TOO_LARGE]: DEFAULT.TOAST_SVG_IMPORT_FAILED_TOO_LARGE,
};
