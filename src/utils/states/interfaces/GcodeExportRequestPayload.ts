/**
 * Payload of GcodeExportRequested: whether the user already confirmed the toolpath's warnings.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface GcodeExportRequestPayload {
  /** True when the user confirmed the warnings, so a toolpath with warnings downloads without asking again. */
  isWarningConfirmed: boolean;
}
