/**
 * Type guard: tells whether an SVG import result is a failure.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SanitizedSvg } from './interfaces/SanitizedSvg';
import type { SvgImportFailure } from './interfaces/SvgImportFailure';

export const isSvgImportFailure = (importResult: SanitizedSvg | SvgImportFailure): importResult is SvgImportFailure =>
  'errorKind' in importResult;
