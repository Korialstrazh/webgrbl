/**
 * A problem with one field of a palette entry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
