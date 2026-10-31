/**
 * Stops the machine when Escape is pressed in the main view. It does nothing while an overlay is open (Escape then
 * only closes the overlay), while disconnected, on a held key, or during IME composition. The decision reads the
 * store at the moment of the key press, so it never acts on an outdated overlay state.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useStore } from 'react-redux';
import { ESCAPE_KEY, KEYDOWN_EVENT_NAME } from '../../utils/browser/browser.events.constants';
import { selectIsConnected } from '../../utils/states/grbl.connection.state';
import { MachineStopRequested } from '../../utils/states/machine.status.state';
import type { AppStore } from '../../utils/states/new.store';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';

const USE_CAPTURE_PHASE = true;

const isFreshEscapePress = (event: KeyboardEvent): boolean =>
  event.key === ESCAPE_KEY && !event.repeat && !event.isComposing;

export const StopHotkey = (): ReactNode => {
  const store: AppStore = useStore() as AppStore;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (!isFreshEscapePress(event)) {
        return;
      }

      const state: ReturnType<AppStore['getState']> = store.getState();

      if (!selectIsConnected(state) || selectIsAnyOverlayOpen(state)) {
        return;
      }

      store.dispatch(new MachineStopRequested());
    };

    window.addEventListener(KEYDOWN_EVENT_NAME, handleKeyDown, USE_CAPTURE_PHASE);

    return () => {
      window.removeEventListener(KEYDOWN_EVENT_NAME, handleKeyDown, USE_CAPTURE_PHASE);
    };
  }, [store]);

  return null;
};
