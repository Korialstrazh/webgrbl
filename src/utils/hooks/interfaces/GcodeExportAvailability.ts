/**
 * Whether the G-code export can start now and, when it cannot because something is missing, what the user must do.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface GcodeExportAvailability {
  /** True when there is an active machine profile, at least one layer is on and no generation is running. */
  isGcodeExportEnabled: boolean;
  /** Translation key of what the user must do first; undefined when nothing is missing. */
  gcodeExportBlockedReasonKey: string | undefined;
}
