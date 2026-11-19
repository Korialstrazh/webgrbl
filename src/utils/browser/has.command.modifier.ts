/**
 * Whether a key press holds Ctrl or Cmd without Alt, as the undo, redo and save shortcuts need. Alt is left out
 * because Ctrl+Alt is AltGr on many keyboards, which types characters instead of running a shortcut.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { KeyboardModifierState } from './interfaces/KeyboardModifierState';

export const hasCommandModifier = (keyboardEvent: KeyboardModifierState): boolean =>
  (keyboardEvent.ctrlKey || keyboardEvent.metaKey) && !keyboardEvent.altKey;
