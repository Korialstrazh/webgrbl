/**
 * One line of the G-code export confirmation: an affected object and one of its warnings.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgUnsupportedKind } from '../../../utils/svg/geometry/svg.shape.constants';

export interface GcodeWarningLine {
  /** Unique key of the line in the list. */
  lineKey: string;
  /** Id of the affected object. */
  objectId: string;
  /** Display name of the affected object. */
  objectName: string;
  /** Kind of the warning, for its icon. */
  kind: SvgUnsupportedKind;
  /** Translation key of the warning text. */
  warningTextKey: string;
}
