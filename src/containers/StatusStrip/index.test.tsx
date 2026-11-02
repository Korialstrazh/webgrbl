import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { StatusStrip } from '.';
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import { ConsoleCommandSubmitted } from '../../utils/states/grbl.console.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { ToolpathReady, ToolpathRequested, selectToolpathDocumentVersion } from '../../utils/states/toolpath.state';
import { FakeToolpathWorkerClient } from '../../utils/toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../../utils/toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../../utils/toolpath/test.support/new.toolpath.move';

const CONSOLE_TOGGLE_LABEL = 'Console';
const INPUT_LABEL = 'Console command';
const SETTINGS_COMMAND = '$$';
const ENTER_KEY = 'Enter';
const FIXED_HEIGHT_CLASS_NAME = 'fixedHeightBar';
const READOUT_LABELS: readonly string[] = ['Cursor', 'Job size', 'Estimate'];
const ESTIMATE_LABEL = 'Estimate';
const SIXTY_SIX_SECONDS_TEXT = '1 min 6 s';
// One burn at 6000 mm/min from rest to rest with the default 1000 mm/s2: 65.9 s cruising plus 0.1 s of ramps.
const SIXTY_SIX_SECOND_MOVE_END_X_MM = 6590;

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
  it('shows the estimate of a ready 66 s toolpath as 1 min 6 s', () => {
    const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true));

    act(() => {
      store.dispatch(new ToolpathRequested());
      store.dispatch(new ToolpathReady({
        toolpath: newToolpath({
          moves: [newToolpathMove({ to: { x: SIXTY_SIX_SECOND_MOVE_END_X_MM, y: 0 } })],
        }),
        documentVersion: selectToolpathDocumentVersion(store.getState()),
      }));
    });
    renderStatusStrip(store);

    const estimateReadout: HTMLElement | null = screen.getByText(ESTIMATE_LABEL).closest('div');

    expect(estimateReadout).toHaveTextContent(`${ESTIMATE_LABEL}${SIXTY_SIX_SECONDS_TEXT}`);
    expect(estimateReadout?.closest('[inert]')).toBeNull();
  });

  it('shows no estimate while there is no ready toolpath', () => {
    renderStatusStrip();

    expect(screen.queryByText(SIXTY_SIX_SECONDS_TEXT)).not.toBeInTheDocument();
  });
});
