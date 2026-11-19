/**
 * P alone switches the laser pointer on and off in the main view, with the same guards as the pointer button: only
 * while connected, Idle and no job runs. It never acts with Ctrl, Cmd, Alt or Shift held, on a held key, during IME
 * composition, while the focus is in a text field or while an overlay is open. The saga still ends a pointer that is
 * left on after its maximum hold time, on a stop, an alarm or when the window loses the focus.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { KEYDOWN_EVENT_NAME, POINTER_TOGGLE_KEY } from '../../utils/browser/browser.events.constants';
import { canShortcutAct } from '../../utils/browser/can.shortcut.act';
import { hasCtrlMetaOrAltModifier } from '../../utils/browser/has.ctrl.meta.or.alt.modifier';
import { getCanFireLaserPointer } from '../../utils/machine/get.can.fire.laser.pointer';
import { selectIsConnected } from '../../utils/states/grbl.connection.state';
import { selectIsJobRunActive } from '../../utils/states/job.run.state';
import {
  LaserPointerFireRequested,
  LaserPointerReleaseRequested,
  selectIsLaserPointerFiring,
} from '../../utils/states/laser.pointer.state';
import { selectMachineStatus } from '../../utils/states/machine.status.state';
import type { AppRootState, AppStore } from '../../utils/states/new.store';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { useAppStore } from '../../utils/states/use.app.store';

const isPointerTogglePress = (keyboardEvent: KeyboardEvent): boolean =>
  keyboardEvent.key.toLowerCase() === POINTER_TOGGLE_KEY
  && !keyboardEvent.repeat
  && !keyboardEvent.shiftKey
  && !hasCtrlMetaOrAltModifier(keyboardEvent);

const canPointerFire = (state: AppRootState): boolean => getCanFireLaserPointer(
  selectIsConnected(state),
  selectMachineStatus(state)?.machineState,
  selectIsJobRunActive(state),
);

export const PointerHotkey = (): ReactNode => {
  const store: AppStore = useAppStore();

  useEffect(() => {
    const handleKeyDown = (keyboardEvent: KeyboardEvent): void => {
      const state: AppRootState = store.getState();

      if (!isPointerTogglePress(keyboardEvent) || !canShortcutAct(keyboardEvent, selectIsAnyOverlayOpen(state))) {
        return;
      }

      if (selectIsLaserPointerFiring(state)) {
        store.dispatch(new LaserPointerReleaseRequested());
      } else if (canPointerFire(state)) {
        store.dispatch(new LaserPointerFireRequested());
      }
    };

    window.addEventListener(KEYDOWN_EVENT_NAME, handleKeyDown);

    return () => {
      window.removeEventListener(KEYDOWN_EVENT_NAME, handleKeyDown);
    };
  }, [store]);

  return null;
};
