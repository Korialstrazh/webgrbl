/**
 * Stops the machine when Escape is pressed in the main view or with a drawer open: a drawer leaves the job running in
 * plain view, so Escape closes it and stops as well. It does nothing while only another overlay is open (Escape then
 * only closes that overlay), while disconnected, on a held key, or during IME composition. The decision reads the
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
import { ESCAPE_KEY, KEYDOWN_EVENT_NAME } from '../../utils/browser/browser.events.constants';
import { selectIsConnected } from '../../utils/states/grbl.connection.state';
import { MachineStopRequested } from '../../utils/states/machine.status.state';
import type { AppRootState, AppStore } from '../../utils/states/new.store';
import { selectIsAnyOverlayOpen, selectIsDrawerOverlayOpen } from '../../utils/states/ui.overlay.state';
import { useAppStore } from '../../utils/states/use.app.store';

const USE_CAPTURE_PHASE = true;

const isFreshEscapePress = (event: KeyboardEvent): boolean =>
  event.key === ESCAPE_KEY && !event.repeat && !event.isComposing;

const canStopMachine = (state: AppRootState): boolean =>
  selectIsConnected(state) && (!selectIsAnyOverlayOpen(state) || selectIsDrawerOverlayOpen(state));

export const StopHotkey = (): ReactNode => {
  const store: AppStore = useAppStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (!isFreshEscapePress(event)) {
        return;
      }

      const state: AppRootState = store.getState();

      if (!canStopMachine(state)) {
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
