/**
 * One reminder of the safety checklist.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SafetyReminderKind } from '../safety.reminder.constants';

export interface SafetyReminder {
  /** What the reminder is about; it picks the animation. */
  kind: SafetyReminderKind;
  /** Locale key of the reminder's one-line title. */
  titleKey: string;
  /** Locale key of the short hint under the title. */
  hintKey: string;
}
