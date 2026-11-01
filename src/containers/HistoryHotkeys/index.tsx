/**
 * Undoes and redoes project changes from the keyboard: Ctrl or Cmd plus Z undoes, Ctrl or Cmd plus Shift plus Z and
 * Ctrl or Cmd plus Y redo. It does nothing while focus is in a text field (the field keeps its own undo), while an
 * overlay is open or during IME composition. The decision reads the store at the moment of the key press.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { KEYDOWN_EVENT_NAME } from '../../utils/browser/browser.events.constants';
import { canShortcutAct } from '../../utils/browser/can.shortcut.act';
import { selectIsBedGestureActive } from '../../utils/states/bed.gesture.state';
import type { AppRootState, AppStore } from '../../utils/states/new.store';
import { ProjectRedoRequested, ProjectUndoRequested } from '../../utils/states/project.document.state';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { useAppStore } from '../../utils/states/use.app.store';
import { getHistoryHotkeyAction } from './get.history.hotkey.action';

// A drag or handle gesture commits onto the document as it is when the pointer comes up, so a history step taken
// in the middle of it would be overwritten or lost.
const canHistoryHotkeyAct = (keyboardEvent: KeyboardEvent, state: AppRootState): boolean =>
  canShortcutAct(keyboardEvent, selectIsAnyOverlayOpen(state)) && !selectIsBedGestureActive(state);

export const HistoryHotkeys = (): ReactNode => {
  const store: AppStore = useAppStore();

  useEffect(() => {
    const handleKeyDown = (keyboardEvent: KeyboardEvent): void => {
      const historyAction: ProjectUndoRequested | ProjectRedoRequested | undefined =
        getHistoryHotkeyAction(keyboardEvent);

      if (!historyAction || !canHistoryHotkeyAct(keyboardEvent, store.getState())) {
        return;
      }

      // Stops the browser from running its own undo on the page.
      keyboardEvent.preventDefault();
      store.dispatch(historyAction);
    };

    window.addEventListener(KEYDOWN_EVENT_NAME, handleKeyDown);

    return () => {
      window.removeEventListener(KEYDOWN_EVENT_NAME, handleKeyDown);
    };
  }, [store]);

  return null;
};
