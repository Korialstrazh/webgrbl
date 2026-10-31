/**
 * Fires the low-power laser pointer while the user holds it and turns it off on the first of the safety cut-offs:
 * release, the window losing focus, the tab being hidden, the connection ending, a stop request, an alarm, or the
 * maximum hold time. The pointer fires only when connected and Idle, never above the power cap, which is a share of
 * the connected laser's reported `$30` when it reports one.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { eventChannel } from 'redux-saga';
import type { EventChannel } from 'redux-saga';
import { call, delay, put, race, select, take } from 'redux-saga/effects';
import {
  BLUR_EVENT_NAME,
  HIDDEN_VISIBILITY_STATE,
  VISIBILITY_CHANGE_EVENT_NAME,
} from '../browser/browser.events.constants';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import type { GrblResolvedStatus } from '../grbl/interfaces/GrblResolvedStatus';
import { getCanFireLaserPointer } from '../machine/get.can.fire.laser.pointer';
import { getPointerOnCommands } from '../machine/get.pointer.on.commands';
import { getPointerSValueMax } from '../machine/get.pointer.s.value.max';
import { MAX_POINTER_HOLD_MS } from '../machine/machine.command.constants';
import { MACHINE_COMMAND } from '../machine/machine.commands';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { ConnectionStatusChanged, selectGrblSettings, selectIsConnected } from './grbl.connection.state';
import {
  LaserPointerFireRequested,
  LaserPointerFiringStarted,
  LaserPointerFiringStopped,
  LaserPointerReleaseRequested,
  selectLaserPointerPowerPercent,
} from './laser.pointer.state';
import { selectActiveMachineProfile } from './machine.profile.state';
import {
  MachineLineRequested,
  MachineStatusReceived,
  MachineStopRequested,
  selectMachineStatus,
} from './machine.status.state';

/** Emits the name of the browser event after which the user may no longer see or hold the pointer button. */
const newPointerFocusLossChannel = (): EventChannel<string> => eventChannel((emit: (eventName: string) => void) => {
  const emitBlur = (): void => emit(BLUR_EVENT_NAME);
  const emitHiddenTab = (): void => {
    if (document.visibilityState === HIDDEN_VISIBILITY_STATE) {
      emit(VISIBILITY_CHANGE_EVENT_NAME);
    }
  };

  window.addEventListener(BLUR_EVENT_NAME, emitBlur);
  document.addEventListener(VISIBILITY_CHANGE_EVENT_NAME, emitHiddenTab);

  return (): void => {
    window.removeEventListener(BLUR_EVENT_NAME, emitBlur);
    document.removeEventListener(VISIBILITY_CHANGE_EVENT_NAME, emitHiddenTab);
  };
});

function* waitForConnectionEnd(): Generator {
  while (true) {
    const action: ConnectionStatusChanged = (yield take(ConnectionStatusChanged.type)) as ConnectionStatusChanged;

    if (action.payload.connectionStatus !== GRBL_CONNECTION_STATUS.CONNECTED) {
      return;
    }
  }
}

function* waitForMachineAlarm(): Generator {
  while (true) {
    const action: MachineStatusReceived = (yield take(MachineStatusReceived.type)) as MachineStatusReceived;

    if (action.payload.status.machineState === GRBL_MACHINE_STATE.ALARM) {
      return;
    }
  }
}

/** Runs only while connected, so the settings are the connected laser's own. */
function* sendPointerOnLines(): Generator {
  const powerPercent: number = (yield select(selectLaserPointerPowerPercent)) as number;
  const laserSettings: Record<number, string> = (yield select(selectGrblSettings)) as Record<number, string>;
  const activeProfile: MachineProfile | undefined =
    (yield select(selectActiveMachineProfile)) as MachineProfile | undefined;
  const sValueMax: number = getPointerSValueMax(laserSettings, activeProfile);

  for (const line of getPointerOnCommands(powerPercent, sValueMax)) {
    yield put(new MachineLineRequested({ line }));
  }
}

/** Without a connection the line could not be sent, and the controller has dropped the laser output anyway. */
function* sendPointerOffLine(): Generator {
  const isConnected: boolean = (yield select(selectIsConnected)) as boolean;

  if (isConnected) {
    yield put(new MachineLineRequested({ line: MACHINE_COMMAND.POINTER_OFF }));
  }
}

function* fireLaserPointer(): Generator {
  const isConnected: boolean = (yield select(selectIsConnected)) as boolean;
  const status: GrblResolvedStatus | undefined = (yield select(selectMachineStatus)) as GrblResolvedStatus | undefined;

  if (!getCanFireLaserPointer(isConnected, status?.machineState)) {
    return;
  }

  const focusLossChannel: EventChannel<string> = (yield call(newPointerFocusLossChannel)) as EventChannel<string>;

  try {
    yield call(sendPointerOnLines);
    yield put(new LaserPointerFiringStarted());
    yield race({
      release: take(LaserPointerReleaseRequested.type),
      focusLoss: take(focusLossChannel),
      connectionEnd: call(waitForConnectionEnd),
      stopRequest: take(MachineStopRequested.type),
      alarm: call(waitForMachineAlarm),
      maximumHold: delay(MAX_POINTER_HOLD_MS),
    });
  } finally {
    focusLossChannel.close();
    yield call(sendPointerOffLine);
    yield put(new LaserPointerFiringStopped());
  }
}

/** Fire requests that arrive while the pointer fires are not taken, so they are ignored. */
export function* watchLaserPointer(): Generator {
  while (true) {
    yield take(LaserPointerFireRequested.type);
    yield call(fireLaserPointer);
  }
}
