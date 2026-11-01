/**
 * Whether a key press holds Ctrl or Cmd without Alt, as the undo, redo and save shortcuts need. Alt is left out
 * because Ctrl+Alt is AltGr on many keyboards, which types characters instead of running a shortcut.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { KeyboardModifierState } from './interfaces/KeyboardModifierState';

export const hasCommandModifier = (keyboardEvent: KeyboardModifierState): boolean =>
  (keyboardEvent.ctrlKey || keyboardEvent.metaKey) && !keyboardEvent.altKey;
