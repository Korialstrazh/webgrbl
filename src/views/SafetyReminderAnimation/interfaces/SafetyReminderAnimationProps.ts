/**
 * Props of SafetyReminderAnimation.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SafetyReminderKind } from '../safety.reminder.constants';

export interface SafetyReminderAnimationProps {
  /** Which reminder to show in motion. */
  kind: SafetyReminderKind;
}
