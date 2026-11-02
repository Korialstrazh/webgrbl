/**
 * Payload of GcodeExportRequested: whether the user already confirmed the toolpath's warnings.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface GcodeExportRequestPayload {
  /** True when the user confirmed the warnings, so a toolpath with warnings downloads without asking again. */
  isWarningConfirmed: boolean;
}
