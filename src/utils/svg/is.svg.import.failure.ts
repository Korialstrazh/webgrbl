/**
 * Type guard: tells whether an SVG import result is a failure.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SanitizedSvg } from './interfaces/SanitizedSvg';
import type { SvgImportFailure } from './interfaces/SvgImportFailure';

export const isSvgImportFailure = (importResult: SanitizedSvg | SvgImportFailure): importResult is SvgImportFailure =>
  'errorKind' in importResult;
