import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { StatusStrip } from '.';
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import { ConsoleCommandSubmitted } from '../../utils/states/grbl.console.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';

const CONSOLE_TOGGLE_LABEL = 'Console';
const INPUT_LABEL = 'Console command';
const SETTINGS_COMMAND = '$$';
const ENTER_KEY = 'Enter';
const FIXED_HEIGHT_CLASS_NAME = 'fixedHeightBar';
const READOUT_LABELS: readonly string[] = ['Cursor', 'Job size', 'Estimate'];

const renderStatusStrip = (store: AppStore = newStore()): void => {
  render(
    <Provider store={store}>
      <StatusStrip />
    </Provider>,
  );
};

describe(StatusStrip.name, () => {
  it('keeps the console collapsed by default', () => {
    renderStatusStrip();

    expect(screen.getByRole('switch', { name: CONSOLE_TOGGLE_LABEL })).not.toBeChecked();
    expect(screen.queryByLabelText(INPUT_LABEL)).not.toBeInTheDocument();
  });

  it('shows the coming-soon readouts', () => {
    renderStatusStrip();

    for (const readoutLabel of READOUT_LABELS) {
      expect(screen.getByText(readoutLabel)).toBeInTheDocument();
    }
  });

  it('opens and closes the console with the toggle', () => {
    renderStatusStrip();

    fireEvent.click(screen.getByRole('switch', { name: CONSOLE_TOGGLE_LABEL }));

    expect(screen.getByLabelText(INPUT_LABEL)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('switch', { name: CONSOLE_TOGGLE_LABEL }));

    expect(screen.queryByLabelText(INPUT_LABEL)).not.toBeInTheDocument();
  });

  it('submits a command typed into the opened console', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderStatusStrip(store);
    act(() => {
      store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    });
    fireEvent.click(screen.getByRole('switch', { name: CONSOLE_TOGGLE_LABEL }));

    const input: HTMLElement = screen.getByLabelText(INPUT_LABEL);

    fireEvent.change(input, { target: { value: SETTINGS_COMMAND } });
    fireEvent.keyDown(input, { key: ENTER_KEY });

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(ConsoleCommandSubmitted));
  });

  it('keeps a fixed height on one row', () => {
    renderStatusStrip();

    expect(screen.getByRole('contentinfo').className).toContain(FIXED_HEIGHT_CLASS_NAME);
  });
});
