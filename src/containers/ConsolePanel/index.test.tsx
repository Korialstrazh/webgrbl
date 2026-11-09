import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ConsolePanel } from '.';
import {
  GRBL_CONSOLE_DIRECTION,
  GRBL_REALTIME_COMMAND,
  SIMULATED_LASER_PORT_ID,
} from '../../utils/grbl/grbl.constants';
import { ANSWER_SETTLE_MS } from '../../utils/grbl/test.support/grbl.answer.settle';
import { DEFAULT } from '../../utils/localization/default.locales';
import { ConnectRequested, SerialPortSelected } from '../../utils/states/grbl.connection.state';
import { ConsoleEntryReceived, ConsoleInfoAdded, selectIsStatusReportVisible } from '../../utils/states/grbl.console.state';
import { newStore } from '../../utils/states/new.store';
import { ConsoleOpenChanged, selectIsConsoleOpen } from '../../utils/states/panel.layout.state';
import type { AppStore } from '../../utils/states/new.store';

const INPUT_LABEL = 'Console command';
const STATUS_REPORTS_LABEL = 'Show status reports';
const SETTINGS_COMMAND = '$$';
const UNLOCK_COMMAND = '$X';
const EDITED_COMMAND = '$$ edited';
const OK_TEXT = 'ok';
const ENTER_KEY = 'Enter';
const ARROW_UP_KEY = 'ArrowUp';
const ARROW_DOWN_KEY = 'ArrowDown';
const SENT_PREFIX = '>';
const BLANK_COMMAND = '   ';
const EMPTY_TEXT = '';
const RAW_ERROR_DETAIL = 'port exploded';
const FEED_HOLD_LABEL = 'Feed hold';
const FEED_HOLD_TEXT = '!';
const ENTRY_TIMESTAMP = 1_000;
const ANTD_INPUT_CLASS_NAME = 'ant-input';
const ANTD_CHECKBOX_CLASS_NAME = 'ant-checkbox-input';
const EMPTY_HINT_TEXT = 'No messages yet. Connect a laser to see what it sends.';
const CLOSE_LABEL = 'Close the console';
const EXPAND_LABEL = 'Open the console log in a large view';
const LOG_DIALOG_TITLE = 'Console log';

const renderConsolePanel = (): AppStore => {
  const store: AppStore = newStore();

  render(
    <Provider store={store}>
      <ConsolePanel />
    </Provider>,
  );

  return store;
};

const settle = async (): Promise<void> => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
  });
};

const connect = async (store: AppStore): Promise<void> => {
  act(() => {
    store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));
    store.dispatch(new ConnectRequested());
  });
  await settle();
};

const getInput = (): HTMLInputElement => {
  const input: HTMLElement = screen.getByLabelText(INPUT_LABEL);

  if (!(input instanceof HTMLInputElement)) {
    throw new TypeError('The console input is not an input element');
  }

  return input;
};

const typeCommand = (commandText: string): void => {
  fireEvent.change(getInput(), { target: { value: commandText } });
};

const pressKey = (key: string): void => {
  fireEvent.keyDown(getInput(), { key });
};

const submitCommand = async (commandText: string): Promise<void> => {
  typeCommand(commandText);
  pressKey(ENTER_KEY);
  await settle();
};

describe(ConsolePanel.name, () => {
  it('says what will appear while the log is empty, and drops the hint at the first line', () => {
    const store: AppStore = renderConsolePanel();

    expect(screen.getByText(EMPTY_HINT_TEXT)).toBeInTheDocument();

    act(() => {
      store.dispatch(new ConsoleInfoAdded({
        messageKey: DEFAULT.CONSOLE_RAW_ERROR,
        isError: true,
        timestamp: ENTRY_TIMESTAMP,
        messageParameters: { detail: RAW_ERROR_DETAIL },
      }));
    });

    expect(screen.queryByText(EMPTY_HINT_TEXT)).not.toBeInTheDocument();
  });

  it('opens the log in a large dialog with the same lines', () => {
    const store: AppStore = renderConsolePanel();

    act(() => {
      store.dispatch(new ConsoleInfoAdded({
        messageKey: DEFAULT.CONSOLE_RAW_ERROR,
        isError: true,
        timestamp: ENTRY_TIMESTAMP,
        messageParameters: { detail: RAW_ERROR_DETAIL },
      }));
    });
    fireEvent.click(screen.getByRole('button', { name: EXPAND_LABEL }));

    expect(within(screen.getByRole('log', { name: LOG_DIALOG_TITLE })).getByText(RAW_ERROR_DETAIL)).toBeInTheDocument();
  });

  it('closes itself from the close button in its header', () => {
    const store: AppStore = renderConsolePanel();

    act(() => {
      store.dispatch(new ConsoleOpenChanged({ isConsoleOpen: true }));
    });
    fireEvent.click(screen.getByRole('button', { name: CLOSE_LABEL }));

    expect(selectIsConsoleOpen(store.getState())).toBe(false);
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('disables the input while disconnected', () => {
    renderConsolePanel();

    expect(getInput()).toBeDisabled();
  });

  it('typing $$ and Enter shows sent and received console lines', async () => {
    const store: AppStore = renderConsolePanel();

    await connect(store);

    const sentBefore: number = screen.queryAllByText(SETTINGS_COMMAND).length;
    const receivedBefore: number = screen.queryAllByText(OK_TEXT).length;

    await submitCommand(SETTINGS_COMMAND);

    expect(screen.getAllByText(SETTINGS_COMMAND)).toHaveLength(sentBefore + 1);
    expect(screen.getAllByText(OK_TEXT).length).toBeGreaterThan(receivedBefore);
    expect(screen.getAllByText(SENT_PREFIX).length).toBeGreaterThan(0);
    expect(getInput().value).toBe(EMPTY_TEXT);
  });

  it('ignores an empty or blank command', async () => {
    const store: AppStore = renderConsolePanel();

    await connect(store);

    const sentBefore: number = screen.queryAllByText(SENT_PREFIX).length;

    await submitCommand(BLANK_COMMAND);

    expect(screen.queryAllByText(SENT_PREFIX)).toHaveLength(sentBefore);
  });

  it('ArrowUp recalls the previous command and ArrowDown walks back to an empty input', async () => {
    const store: AppStore = renderConsolePanel();

    await connect(store);
    await submitCommand(SETTINGS_COMMAND);
    await submitCommand(UNLOCK_COMMAND);

    pressKey(ARROW_UP_KEY);

    expect(getInput().value).toBe(UNLOCK_COMMAND);

    pressKey(ARROW_UP_KEY);

    expect(getInput().value).toBe(SETTINGS_COMMAND);

    pressKey(ARROW_UP_KEY);

    expect(getInput().value).toBe(SETTINGS_COMMAND);

    pressKey(ARROW_DOWN_KEY);

    expect(getInput().value).toBe(UNLOCK_COMMAND);

    pressKey(ARROW_DOWN_KEY);

    expect(getInput().value).toBe(EMPTY_TEXT);
  });

  it('typing after a recall starts the history again from the newest command', async () => {
    const store: AppStore = renderConsolePanel();

    await connect(store);
    await submitCommand(SETTINGS_COMMAND);
    await submitCommand(UNLOCK_COMMAND);
    pressKey(ARROW_UP_KEY);
    pressKey(ARROW_UP_KEY);

    typeCommand(EDITED_COMMAND);
    pressKey(ARROW_UP_KEY);

    expect(getInput().value).toBe(UNLOCK_COMMAND);
  });

  it('builds the command input and the status reports checkbox from antd', () => {
    renderConsolePanel();

    expect(getInput()).toHaveClass(ANTD_INPUT_CLASS_NAME);
    expect(screen.getByRole('checkbox', { name: STATUS_REPORTS_LABEL })).toHaveClass(ANTD_CHECKBOX_CLASS_NAME);
  });

  it('toggles the status report visibility', () => {
    const store: AppStore = renderConsolePanel();

    fireEvent.click(screen.getByLabelText(STATUS_REPORTS_LABEL));

    expect(selectIsStatusReportVisible(store.getState())).toBe(true);
  });

  it('translates app-added lines and labels realtime entries', () => {
    const store: AppStore = renderConsolePanel();

    act(() => {
      store.dispatch(new ConsoleInfoAdded({
        messageKey: DEFAULT.CONSOLE_RAW_ERROR,
        isError: true,
        timestamp: ENTRY_TIMESTAMP,
        messageParameters: { detail: RAW_ERROR_DETAIL },
      }));
      store.dispatch(new ConsoleEntryReceived({
        entry: {
          direction: GRBL_CONSOLE_DIRECTION.REALTIME,
          text: FEED_HOLD_TEXT,
          realtimeCommand: GRBL_REALTIME_COMMAND.FEED_HOLD,
          isStatusReport: false,
          timestamp: ENTRY_TIMESTAMP,
        },
      }));
    });

    expect(screen.getByText(RAW_ERROR_DETAIL)).toBeInTheDocument();
    expect(screen.getByText(FEED_HOLD_LABEL)).toBeInTheDocument();
  });
});
