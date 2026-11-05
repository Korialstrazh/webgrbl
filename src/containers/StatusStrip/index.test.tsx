import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { StatusStrip } from '.';
import { BED_CURSOR_STORE } from '../../utils/bed/bed.cursor.store';
import { OFFLINE_EVENT_NAME, ONLINE_EVENT_NAME } from '../../utils/browser/browser.events.constants';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { selectIsConsoleOpen } from '../../utils/states/panel.layout.state';
import { ToolpathReady, ToolpathRequested, selectToolpathDocumentVersion } from '../../utils/states/toolpath.state';
import { AnimationFrameStub } from '../../utils/test.support/animation.frame.stub';
import { FakeToolpathWorkerClient } from '../../utils/toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../../utils/toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../../utils/toolpath/test.support/new.toolpath.move';

const CONSOLE_TOGGLE_LABEL = 'Console';
const INPUT_LABEL = 'Console command';
const FIXED_HEIGHT_CLASS_NAME = 'fixedHeightBar';
const READOUT_LABELS: readonly string[] = ['Cursor', 'Job size', 'Estimate'];
const ESTIMATE_LABEL = 'Estimate';
const CURSOR_LABEL = 'Cursor';
const JOB_SIZE_LABEL = 'Job size';
const SOON_LABEL = 'Soon';
const OFFLINE_LABEL = 'Offline';
// The one empty-readout mark, an em dash.
const MISSING_VALUE_TEXT = '\u2014';
const CURSOR_POINT = { xMm: 123.45, yMm: 6.7 };
const CURSOR_TEXT = 'X 123.5 Y 6.7 mm';
const JOB_SIZE_TEXT = '196.0 \u00D7 196.6 mm';
const JOB_SIZE_HINT_TEXT = 'Worked out in the background from the layers that are switched on, after each change.';
const JOB_SIZE_EXPLANATION_START = /^The area the laser covers/;
const CALCULATING_TEXT = 'Calculating...';
const FRAME_TIME_MS = 16;
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
  it('shows Offline only while the browser has no network', () => {
    renderStatusStrip();

    expect(screen.queryByText(OFFLINE_LABEL)).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event(OFFLINE_EVENT_NAME));
    });

    expect(screen.getByText(OFFLINE_LABEL)).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event(ONLINE_EVENT_NAME));
    });

    expect(screen.queryByText(OFFLINE_LABEL)).not.toBeInTheDocument();
  });

  it('keeps the console collapsed by default', () => {
    renderStatusStrip();

    expect(screen.getByRole('button', { name: CONSOLE_TOGGLE_LABEL })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByLabelText(INPUT_LABEL)).not.toBeInTheDocument();
  });

  it('shows the cursor, job size and estimate readouts as real readouts, without a Soon tag', () => {
    renderStatusStrip();

    for (const readoutLabel of READOUT_LABELS) {
      expect(screen.getByText(readoutLabel)).toBeInTheDocument();
    }

    expect(screen.queryByText(SOON_LABEL)).not.toBeInTheDocument();
  });

  it('shows the bed point under the pointer once the next frame comes, and a dash after the pointer leaves', () => {
    const animationFrames: AnimationFrameStub = new AnimationFrameStub();

    animationFrames.install();
    renderStatusStrip();
    const cursorReadout: HTMLElement | null = screen.getByText(CURSOR_LABEL).closest('div');

    expect(cursorReadout).toHaveTextContent(`${CURSOR_LABEL}${MISSING_VALUE_TEXT}`);

    act(() => {
      BED_CURSOR_STORE.setBedCursorPoint({ xMm: 12.34, yMm: 56.78 });
      BED_CURSOR_STORE.setBedCursorPoint(CURSOR_POINT);
    });

    expect(cursorReadout).toHaveTextContent(`${CURSOR_LABEL}${MISSING_VALUE_TEXT}`);
    expect(animationFrames.getRequestCount()).toBe(1);

    animationFrames.runFrame(FRAME_TIME_MS);

    expect(cursorReadout).toHaveTextContent(CURSOR_TEXT);

    act(() => {
      BED_CURSOR_STORE.setBedCursorPoint(undefined);
    });
    animationFrames.runFrame(FRAME_TIME_MS);

    expect(cursorReadout).toHaveTextContent(`${CURSOR_LABEL}${MISSING_VALUE_TEXT}`);
    vi.unstubAllGlobals();
  });

  it('shows a dash for the job size, with the reason in a tooltip, until a toolpath is ready', async () => {
    renderStatusStrip();
    const jobSizeValue: HTMLElement = within(screen.getByText(JOB_SIZE_LABEL).closest('div') ?? document.body)
      .getByText(MISSING_VALUE_TEXT);

    fireEvent.focus(jobSizeValue);

    expect(await screen.findByText(JOB_SIZE_HINT_TEXT)).toBeInTheDocument();
  });

  it('shows the size of the ready toolpath as the job size', () => {
    const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true));

    act(() => {
      store.dispatch(new ToolpathRequested());
      store.dispatch(new ToolpathReady({
        toolpath: newToolpath({ bounds: { minX: 10, minY: 20, maxX: 206, maxY: 216.6 } }),
        documentVersion: selectToolpathDocumentVersion(store.getState()),
      }));
    });
    renderStatusStrip(store);

    expect(screen.getByText(JOB_SIZE_LABEL).closest('div')).toHaveTextContent(`${JOB_SIZE_LABEL}${JOB_SIZE_TEXT}`);
  });

  it('says what the job size measures in a tooltip once it is shown', async () => {
    const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true));

    act(() => {
      store.dispatch(new ToolpathRequested());
      store.dispatch(new ToolpathReady({
        toolpath: newToolpath({ bounds: { minX: 10, minY: 20, maxX: 206, maxY: 216.6 } }),
        documentVersion: selectToolpathDocumentVersion(store.getState()),
      }));
    });
    renderStatusStrip(store);
    fireEvent.focus(screen.getByText(JOB_SIZE_TEXT));

    expect(await screen.findByText(JOB_SIZE_EXPLANATION_START)).toBeInTheDocument();
  });

  it('shows Calculating for the job size and the estimate while the toolpath is generated', () => {
    const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true));

    act(() => {
      store.dispatch(new ToolpathRequested());
    });
    renderStatusStrip(store);

    expect(screen.getByText(JOB_SIZE_LABEL).closest('div')).toHaveTextContent(`${JOB_SIZE_LABEL}${CALCULATING_TEXT}`);
    expect(screen.getByText(ESTIMATE_LABEL).closest('div')).toHaveTextContent(`${ESTIMATE_LABEL}${CALCULATING_TEXT}`);
  });

  it('opens and closes the console panel with the toggle', () => {
    const store: AppStore = newStore();
    renderStatusStrip(store);

    fireEvent.click(screen.getByRole('button', { name: CONSOLE_TOGGLE_LABEL }));

    expect(selectIsConsoleOpen(store.getState())).toBe(true);
    expect(screen.getByRole('button', { name: CONSOLE_TOGGLE_LABEL })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: CONSOLE_TOGGLE_LABEL }));

    expect(selectIsConsoleOpen(store.getState())).toBe(false);
  });

  it('never draws the console inside the strip', () => {
    renderStatusStrip();

    fireEvent.click(screen.getByRole('button', { name: CONSOLE_TOGGLE_LABEL }));

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
