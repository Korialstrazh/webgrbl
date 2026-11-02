import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { StatusStrip } from '.';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { selectIsConsoleOpen } from '../../utils/states/panel.layout.state';
import { ToolpathReady, ToolpathRequested, selectToolpathDocumentVersion } from '../../utils/states/toolpath.state';
import { FakeToolpathWorkerClient } from '../../utils/toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../../utils/toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../../utils/toolpath/test.support/new.toolpath.move';

const CONSOLE_TOGGLE_LABEL = 'Console';
const INPUT_LABEL = 'Console command';
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

  it('opens and closes the console panel with the toggle', () => {
    const store: AppStore = newStore();
    renderStatusStrip(store);

    fireEvent.click(screen.getByRole('switch', { name: CONSOLE_TOGGLE_LABEL }));

    expect(selectIsConsoleOpen(store.getState())).toBe(true);
    expect(screen.getByRole('switch', { name: CONSOLE_TOGGLE_LABEL })).toBeChecked();

    fireEvent.click(screen.getByRole('switch', { name: CONSOLE_TOGGLE_LABEL }));

    expect(selectIsConsoleOpen(store.getState())).toBe(false);
  });

  it('never draws the console inside the strip', () => {
    renderStatusStrip();

    fireEvent.click(screen.getByRole('switch', { name: CONSOLE_TOGGLE_LABEL }));

    expect(screen.queryByLabelText(INPUT_LABEL)).not.toBeInTheDocument();
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
