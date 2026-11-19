/**
 * Whether an app keyboard shortcut may act on a key press: not during IME composition, not while focus is in a text
 * field, where the key belongs to the text, and not while an overlay is open, which owns the keyboard then.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { isTextEntryTarget } from './is.text.entry.target';

export const canShortcutAct = (keyboardEvent: KeyboardEvent, isOverlayOpen: boolean): boolean =>
  !keyboardEvent.isComposing && !isTextEntryTarget(keyboardEvent.target) && !isOverlayOpen;
