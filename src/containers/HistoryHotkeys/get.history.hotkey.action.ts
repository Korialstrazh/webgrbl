/**
 * Gets the history action a key press asks for: Ctrl or Cmd plus Z undoes, Ctrl or Cmd plus Shift plus Z and Ctrl or
 * Cmd plus Y redo. Any other press, and a press with Alt held, asks for nothing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { REDO_KEY, UNDO_KEY } from '../../utils/browser/browser.events.constants';
import { hasCommandModifier } from '../../utils/browser/has.command.modifier';
import { ProjectRedoRequested, ProjectUndoRequested } from '../../utils/states/project.document.state';

const isRedoPress = (keyboardEvent: KeyboardEvent, pressedKey: string): boolean =>
  (pressedKey === UNDO_KEY && keyboardEvent.shiftKey) || (pressedKey === REDO_KEY && !keyboardEvent.shiftKey);

export const getHistoryHotkeyAction = (
  keyboardEvent: KeyboardEvent,
): ProjectUndoRequested | ProjectRedoRequested | undefined => {
  if (!hasCommandModifier(keyboardEvent)) {
    return undefined;
  }

  const pressedKey: string = keyboardEvent.key.toLowerCase();

  if (isRedoPress(keyboardEvent, pressedKey)) {
    return new ProjectRedoRequested();
  }

  return pressedKey === UNDO_KEY ? new ProjectUndoRequested() : undefined;
};
