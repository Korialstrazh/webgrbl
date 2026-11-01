/**
 * One line of the G-code export confirmation: an affected object and one of its warnings.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface GcodeWarningLine {
  /** Unique key of the line in the list. */
  lineKey: string;
  /** Display name of the affected object. */
  objectName: string;
  /** Translation key of the warning text. */
  warningTextKey: string;
}
