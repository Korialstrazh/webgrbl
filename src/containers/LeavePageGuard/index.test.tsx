import { act, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { LeavePageGuard } from '.';
import { GRBL_MACHINE_STATE } from '../../utils/grbl/grbl.constants';
import type { GrblResolvedStatus } from '../../utils/grbl/interfaces/GrblResolvedStatus';
import { MachineStatusReceived } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';

const BEFORE_UNLOAD_EVENT_NAME = 'beforeunload';

const NEW_STATUS: GrblResolvedStatus = {
  machineState: GRBL_MACHINE_STATE.IDLE,
  machineSubstate: undefined,
  machinePosition: undefined,
  workPosition: undefined,
  workCoordinateOffset: undefined,
  plannerBlocksAvailable: undefined,
  rxBytesAvailable: undefined,
  feedRate: undefined,
  spindleSpeed: undefined,
  overrides: undefined,
};

const renderLeavePageGuard = (): AppStore => {
  const store: AppStore = newStore();

  render(
    <Provider store={store}>
      <LeavePageGuard />
    </Provider>,
  );

  return store;
};

const receiveState = (store: AppStore, machineState: GrblResolvedStatus['machineState']): void => {
  act(() => {
    store.dispatch(new MachineStatusReceived({ status: { ...NEW_STATUS, machineState } }));
  });
};

const fireBeforeUnload = (): Event => {
  const beforeUnloadEvent: Event = new Event(BEFORE_UNLOAD_EVENT_NAME, { cancelable: true });

  window.dispatchEvent(beforeUnloadEvent);

  return beforeUnloadEvent;
};

describe(LeavePageGuard.name, () => {
  it('leave-page guard prevents unload only while moving', () => {
    const store: AppStore = renderLeavePageGuard();

    receiveState(store, GRBL_MACHINE_STATE.IDLE);

    expect(fireBeforeUnload().defaultPrevented).toBe(false);

    receiveState(store, GRBL_MACHINE_STATE.RUN);

    expect(fireBeforeUnload().defaultPrevented).toBe(true);

    receiveState(store, GRBL_MACHINE_STATE.IDLE);

    expect(fireBeforeUnload().defaultPrevented).toBe(false);
  });
});
