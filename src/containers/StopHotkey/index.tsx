/**
 * Stops the machine when Escape is pressed in the main view. While an overlay is open, Escape only closes the overlay,
 * unless the user turned on the preference that Escape stops the laser even then: it then closes the overlay and stops.
 * It never acts while disconnected, on a held key, or during IME composition. The decision reads the
 * store at the moment of the key press, so it never acts on an outdated overlay state.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { ESCAPE_KEY, KEYDOWN_EVENT_NAME } from '../../utils/browser/browser.events.constants';
import { selectIsEscStoppingWithOverlayOpen } from '../../utils/states/app.preferences.state';
import { selectIsConnected } from '../../utils/states/grbl.connection.state';
import { MachineStopRequested } from '../../utils/states/machine.status.state';
import type { AppRootState, AppStore } from '../../utils/states/new.store';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { useAppStore } from '../../utils/states/use.app.store';

const USE_CAPTURE_PHASE = true;

const isFreshEscapePress = (event: KeyboardEvent): boolean =>
  event.key === ESCAPE_KEY && !event.repeat && !event.isComposing;

const isEscapeFreeToStop = (state: AppRootState): boolean =>
  selectIsEscStoppingWithOverlayOpen(state) || !selectIsAnyOverlayOpen(state);

const canStopMachine = (state: AppRootState): boolean => selectIsConnected(state) && isEscapeFreeToStop(state);

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
