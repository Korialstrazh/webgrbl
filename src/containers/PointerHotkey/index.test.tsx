import { act, fireEvent, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PointerHotkey } from '.';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE } from '../../utils/grbl/grbl.constants';
import type { GrblResolvedStatus } from '../../utils/grbl/interfaces/GrblResolvedStatus';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import {
  LaserPointerFireRequested,
  LaserPointerFiringStarted,
  LaserPointerReleaseRequested,
} from '../../utils/states/laser.pointer.state';
import { MachineStatusReceived } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';

const POINTER_KEY = 'p';
const OTHER_KEY = 'o';

const IDLE_STATUS: GrblResolvedStatus = {
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

const renderPointerHotkey = (isReady: boolean = true): AppStore => {
  const store: AppStore = newStore();

  if (isReady) {
    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    store.dispatch(new MachineStatusReceived({ status: IDLE_STATUS }));
  }

  render(
    <Provider store={store}>
      <PointerHotkey />
      <input aria-label="field" />
    </Provider>,
  );

  return store;
};

const getDispatchedTypes = (dispatchSpy: ReturnType<typeof vi.spyOn>): string[] =>
  dispatchSpy.mock.calls.map(([action]: unknown[]): string => (action as { type: string }).type);

describe(PointerHotkey.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('asks to fire the pointer on P when the pointer button could fire', () => {
    const store: AppStore = renderPointerHotkey();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    fireEvent.keyDown(window, { key: POINTER_KEY });

    expect(getDispatchedTypes(dispatchSpy)).toEqual([LaserPointerFireRequested.type]);
  });

  it('asks to release the pointer on P while it fires', () => {
    const store: AppStore = renderPointerHotkey();

    act(() => {
      store.dispatch(new LaserPointerFiringStarted());
    });
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    fireEvent.keyDown(window, { key: POINTER_KEY });

    expect(getDispatchedTypes(dispatchSpy)).toEqual([LaserPointerReleaseRequested.type]);
  });

  it('does nothing while disconnected, like the disabled pointer button', () => {
    const store: AppStore = renderPointerHotkey(false);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    fireEvent.keyDown(window, { key: POINTER_KEY });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('does nothing while the machine is not Idle', () => {
    const store: AppStore = renderPointerHotkey();

    act(() => {
      store.dispatch(new MachineStatusReceived({ status: { ...IDLE_STATUS, machineState: GRBL_MACHINE_STATE.RUN } }));
    });
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    fireEvent.keyDown(window, { key: POINTER_KEY });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it.each([
    { ctrlKey: true },
    { metaKey: true },
    { altKey: true },
    { shiftKey: true },
    { repeat: true },
  ])('ignores P with %o', (modifiers: Record<string, boolean>) => {
    const store: AppStore = renderPointerHotkey();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    fireEvent.keyDown(window, { key: POINTER_KEY, ...modifiers });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('ignores P typed into a text field', () => {
    const store: AppStore = renderPointerHotkey();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const field: HTMLElement = document.querySelector('input') as HTMLElement;

    fireEvent.keyDown(field, { key: POINTER_KEY });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('ignores other keys', () => {
    const store: AppStore = renderPointerHotkey();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    fireEvent.keyDown(window, { key: OTHER_KEY });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
