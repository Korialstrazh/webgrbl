import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MachinePanel } from '.';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE } from '../../utils/grbl/grbl.constants';
import type { GrblResolvedStatus } from '../../utils/grbl/interfaces/GrblResolvedStatus';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import {
  MachineResetRequested,
  MachineStatusReceived,
  MachineUnlockRequested,
} from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { selectIsConnectionPopoverOpen } from '../../utils/states/ui.overlay.state';

const WORK_POSITION_TEXT = '8.000';
const MACHINE_POSITION_TEXT = '10.500';
const FEED_RATE = 1200;
const SPINDLE_SPEED = 750;
// The one empty-readout mark, an em dash.
const MISSING_VALUE_TEXT = '\u2014';
const IDLE_LABEL = 'Idle';
const RUN_LABEL = 'Run';
const RESET_LABEL = 'Reset';
const UNLOCK_LABEL = 'Unlock';
const STOP_LABEL = 'Stop';
const NOT_CONNECTED_TEXT = 'Not connected';
const STATUS_CARD_TITLE = 'Status';
const STATUS_CONNECT_LABEL = 'Connect...';
const ANTD_PRIMARY_BUTTON_CLASS = 'ant-btn-primary';
const EXPORT_GCODE_LABEL = 'Export G-code';
const PRIMARY_CALL_TO_ACTION_SELECTOR = '.ant-btn-primary:not(.ant-btn-dangerous)';
const CARD_TITLES_IN_ORDER: readonly string[] = ['Status', 'Job', 'Move', 'Laser pointer'];
const COMING_SOON_TITLES: readonly string[] = ['Laser pointer', 'Job'];

const NEW_STATUS: GrblResolvedStatus = {
  machineState: GRBL_MACHINE_STATE.RUN,
  machineSubstate: undefined,
  machinePosition: { x: 10.5, y: 0, z: 0 },
  workPosition: { x: 8, y: 1.25, z: 0 },
  workCoordinateOffset: undefined,
  plannerBlocksAvailable: undefined,
  rxBytesAvailable: undefined,
  feedRate: FEED_RATE,
  spindleSpeed: SPINDLE_SPEED,
  overrides: undefined,
};

const renderMachinePanel = (store: AppStore = newStore(), isWide: boolean = true): AppStore => {
  render(
    <Provider store={store}>
      <MachinePanel isWide={isWide} />
    </Provider>,
  );

  return store;
};

const connect = (store: AppStore): void => {
  act(() => {
    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
  });
};

const receiveState = (store: AppStore, machineState: GrblResolvedStatus['machineState']): void => {
  act(() => {
    store.dispatch(new MachineStatusReceived({ status: { ...NEW_STATUS, machineState } }));
  });
};

describe(MachinePanel.name, () => {
  it('collapses the status card to one line while not connected, without readouts or buttons', () => {
    renderMachinePanel();

    const statusCard: HTMLElement = screen.getByRole('region', { name: STATUS_CARD_TITLE });

    expect(within(statusCard).getByText(NOT_CONNECTED_TEXT)).toBeInTheDocument();
    expect(within(statusCard).queryByText(MISSING_VALUE_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: RESET_LABEL })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: UNLOCK_LABEL })).not.toBeInTheDocument();
  });

  it('offers Connect in the status card while not connected, which opens the connection popover of the pill', () => {
    const store: AppStore = renderMachinePanel();

    fireEvent.click(screen.getByRole('button', { name: STATUS_CONNECT_LABEL }));

    expect(selectIsConnectionPopoverOpen(store.getState())).toBe(true);
  });

  it('keeps Export G-code the only filled primary button while not connected', () => {
    renderMachinePanel();

    expect(screen.getByRole('button', { name: STATUS_CONNECT_LABEL })).not.toHaveClass(ANTD_PRIMARY_BUTTON_CLASS);
    // STOP is a danger button of its own, not a next step, so it is not counted.
    expect(document.querySelectorAll(PRIMARY_CALL_TO_ACTION_SELECTOR)).toHaveLength(1);
    expect(screen.getByRole('button', { name: EXPORT_GCODE_LABEL })).toHaveClass(ANTD_PRIMARY_BUTTON_CLASS);
  });

  it('drops the Connect button from the status card once connected', () => {
    const store: AppStore = renderMachinePanel();

    connect(store);

    expect(screen.queryByRole('button', { name: STATUS_CONNECT_LABEL })).not.toBeInTheDocument();
  });

  it('shows dashes while connected without a status yet', () => {
    const store: AppStore = renderMachinePanel();

    connect(store);

    expect(screen.queryByText(NOT_CONNECTED_TEXT)).not.toBeInTheDocument();
    expect(screen.getAllByText(MISSING_VALUE_TEXT).length).toBeGreaterThan(0);
    expect(screen.queryByText(IDLE_LABEL)).not.toBeInTheDocument();
  });

  it('puts the main task first: status, job, move, then the laser pointer', () => {
    renderMachinePanel();

    const cardTitles: (string | null)[] = screen.getAllByRole('heading')
      .map((heading: HTMLElement) => heading.textContent);

    expect(cardTitles).toEqual(CARD_TITLES_IN_ORDER);
  });

  it('shows the state, positions with three decimals, feed and power after a status report', () => {
    const store: AppStore = renderMachinePanel();

    connect(store);
    act(() => {
      store.dispatch(new MachineStatusReceived({ status: NEW_STATUS }));
    });

    expect(screen.getByText(RUN_LABEL)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(WORK_POSITION_TEXT))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(MACHINE_POSITION_TEXT))).toBeInTheDocument();
    expect(screen.getByText(String(FEED_RATE))).toBeInTheDocument();
    expect(screen.getByText(String(SPINDLE_SPEED))).toBeInTheDocument();
  });

  it('enables reset when connected, and unlock only in alarm', () => {
    const store: AppStore = renderMachinePanel();

    connect(store);
    receiveState(store, GRBL_MACHINE_STATE.IDLE);

    expect(screen.getByRole('button', { name: RESET_LABEL })).toBeEnabled();
    expect(screen.getByRole('button', { name: UNLOCK_LABEL })).toBeDisabled();

    receiveState(store, GRBL_MACHINE_STATE.ALARM);

    expect(screen.getByRole('button', { name: UNLOCK_LABEL })).toBeEnabled();
  });

  it('dispatches the reset and unlock requests when their buttons are clicked', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderMachinePanel(store);
    connect(store);
    receiveState(store, GRBL_MACHINE_STATE.ALARM);
    fireEvent.click(screen.getByRole('button', { name: RESET_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: UNLOCK_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(MachineResetRequested));
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(MachineUnlockRequested));
  });

  it('shows every coming-soon card', () => {
    renderMachinePanel();

    for (const cardTitle of COMING_SOON_TITLES) {
      expect(screen.getByRole('heading', { name: cardTitle })).toBeInTheDocument();
    }
  });

  it('renders STOP only in a wide window', () => {
    const { unmount } = render(
      <Provider store={newStore()}>
        <MachinePanel isWide />
      </Provider>,
    );

    expect(screen.getByRole('button', { name: STOP_LABEL })).toBeInTheDocument();

    unmount();
    renderMachinePanel(newStore(), false);

    expect(screen.queryByRole('button', { name: STOP_LABEL })).not.toBeInTheDocument();
  });

  it('puts STOP in a footer after the scrolling cards, never over them', () => {
    renderMachinePanel();

    const stopFooter: HTMLElement | null = screen.getByRole('button', { name: STOP_LABEL }).parentElement;
    const cardsArea: Element | null | undefined = stopFooter?.previousElementSibling;

    expect(stopFooter?.parentElement).toBe(cardsArea?.parentElement);
    expect(cardsArea).toContainElement(screen.getByText(NOT_CONNECTED_TEXT));
    expect(cardsArea).not.toContainElement(stopFooter ?? null);
  });
});
