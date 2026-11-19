/**
 * The reminders of the safety checklist: what each one is about, and the texts that name it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DEFAULT } from '../../utils/localization/default.locales';
import type { SafetyReminder } from './interfaces/SafetyReminder';

export const SAFETY_REMINDER_KIND = {
  GOGGLES: 'goggles',
  VENTILATION: 'ventilation',
  FIRE: 'fire',
  STAY: 'stay',
} as const;

export type SafetyReminderKind = (typeof SAFETY_REMINDER_KIND)[keyof typeof SAFETY_REMINDER_KIND];

export const SAFETY_REMINDERS: readonly SafetyReminder[] = [
  {
    kind: SAFETY_REMINDER_KIND.GOGGLES,
    titleKey: DEFAULT.SAFETY_CHECKLIST_GOGGLES_TITLE,
    hintKey: DEFAULT.SAFETY_CHECKLIST_GOGGLES_HINT,
  },
  {
    kind: SAFETY_REMINDER_KIND.VENTILATION,
    titleKey: DEFAULT.SAFETY_CHECKLIST_VENTILATION_TITLE,
    hintKey: DEFAULT.SAFETY_CHECKLIST_VENTILATION_HINT,
  },
  {
    kind: SAFETY_REMINDER_KIND.FIRE,
    titleKey: DEFAULT.SAFETY_CHECKLIST_FIRE_TITLE,
    hintKey: DEFAULT.SAFETY_CHECKLIST_FIRE_HINT,
  },
  {
    kind: SAFETY_REMINDER_KIND.STAY,
    titleKey: DEFAULT.SAFETY_CHECKLIST_STAY_TITLE,
    hintKey: DEFAULT.SAFETY_CHECKLIST_STAY_HINT,
  },
];
