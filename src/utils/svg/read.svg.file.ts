/**
 * Reads and sanitises one SVG file; the byte size is checked before the text is read.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSanitizedSvg } from './get.sanitized.svg';
import type { SanitizedSvg } from './interfaces/SanitizedSvg';
import type { SvgImportFailure } from './interfaces/SvgImportFailure';
import { MAX_SVG_FILE_BYTES, SVG_IMPORT_ERROR_KIND } from './svg.constants';

export const readSvgFile = async (file: File): Promise<SanitizedSvg | SvgImportFailure> => {
  if (file.size > MAX_SVG_FILE_BYTES) {
    return { errorKind: SVG_IMPORT_ERROR_KIND.TOO_LARGE };
  }

  try {
    return getSanitizedSvg(await file.text());
  } catch {
    // An unreadable file is reported like any file that is not an SVG; the read error is never shown.
    return { errorKind: SVG_IMPORT_ERROR_KIND.NOT_SVG };
  }
};
