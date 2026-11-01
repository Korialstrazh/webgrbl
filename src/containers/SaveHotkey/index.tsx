/**
 * Saves the project on Ctrl or Cmd plus S and stops the browser from opening its own save dialog. It works inside
 * text fields and with an overlay open, since saving is harmless there, and it does nothing during IME composition.
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
import { KEYDOWN_EVENT_NAME, SAVE_KEY } from '../../utils/browser/browser.events.constants';
import type { AppStore } from '../../utils/states/new.store';
import { ProjectSaveRequested } from '../../utils/states/project.state';
import { useAppStore } from '../../utils/states/use.app.store';

const isSavePress = (keyboardEvent: KeyboardEvent): boolean =>
  (keyboardEvent.ctrlKey || keyboardEvent.metaKey)
  && !keyboardEvent.altKey
  && !keyboardEvent.shiftKey
  && !keyboardEvent.isComposing
  && keyboardEvent.key.toLowerCase() === SAVE_KEY;

export const SaveHotkey = (): ReactNode => {
  const store: AppStore = useAppStore();

  useEffect(() => {
    const handleKeyDown = (keyboardEvent: KeyboardEvent): void => {
      if (!isSavePress(keyboardEvent)) {
        return;
      }

      keyboardEvent.preventDefault();

      if (!keyboardEvent.repeat) {
        store.dispatch(new ProjectSaveRequested());
      }
    };

    window.addEventListener(KEYDOWN_EVENT_NAME, handleKeyDown);

    return () => {
      window.removeEventListener(KEYDOWN_EVENT_NAME, handleKeyDown);
    };
  }, [store]);

  return null;
};
