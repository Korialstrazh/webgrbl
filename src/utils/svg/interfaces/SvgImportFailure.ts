/**
 * The result of a rejected SVG import.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgImportErrorKind } from '../svg.constants';

export interface SvgImportFailure {
  errorKind: SvgImportErrorKind;
}
