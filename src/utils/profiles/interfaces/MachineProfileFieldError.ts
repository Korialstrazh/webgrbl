/**
 * A problem with one field of a machine profile.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineProfile } from './MachineProfile';

export interface MachineProfileFieldError {
  /** Profile field that has the problem. */
  field: keyof MachineProfile;
  /** Localization key of the message to show. */
  messageKey: string;
  /** Values for the placeholders of the message, such as the allowed limits. */
  messageParameters?: Record<string, number>;
}
