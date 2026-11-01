/**
 * Whether a key press holds any of Ctrl, Cmd or Alt. Plain-key shortcuts such as the bed's arrow and Delete keys
 * leave such a press alone, so they never take over a browser or system shortcut; Shift is not counted.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { KeyboardModifierState } from './interfaces/KeyboardModifierState';

export const hasCtrlMetaOrAltModifier = (keyboardEvent: KeyboardModifierState): boolean =>
  keyboardEvent.ctrlKey || keyboardEvent.metaKey || keyboardEvent.altKey;
