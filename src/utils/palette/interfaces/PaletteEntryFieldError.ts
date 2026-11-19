/**
 * A problem with one field of a palette entry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PaletteEntry } from './PaletteEntry';

export interface PaletteEntryFieldError {
  /** Entry field that has the problem. */
  field: keyof PaletteEntry;
  /** Localization key of the message to show. */
  messageKey: string;
  /** Values for the placeholders of the message, such as the allowed limits. */
  messageParameters?: Record<string, number>;
}
