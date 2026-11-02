import { act, fireEvent, render, screen } from '@testing-library/react';
import { ARROW_RIGHT_KEY, ARROW_UP_KEY, END_KEY, HOME_KEY } from '../../utils/browser/browser.events.constants';
import { Provider } from 'react-redux';
import { AppRoute } from '.';
import { PANEL_SIZES_REPOSITORY } from '../../utils/project/panel.sizes.repository';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { ConsoleOpenChanged, selectConsoleSizePercent, selectPanelSizePercents } from '../../utils/states/panel.layout.state';
import { setMatchMediaMatches } from '../../utils/test.support/match.media.mock';

// jsdom does no layout, so the splitter gets a fixed width and a ResizeObserver that reports it; without a width the
// splitter cannot turn a drag into sizes.
const WORKBENCH_WIDTH_PX = 1600;
const DRAG_DISTANCE_PX = 72;
// 20.5rem + 72 px, the rest, and 22rem, at a 16 px root font size, in percent of 1600 px.
const DRAGGED_PERCENTS: number[] = [25, 53, 22];
const DRAGGER_SELECTOR = '.ant-splitter-bar-dragger';
// The bed column gets a fixed height too; dragging its bar 100 px up turns the default 30 % console into 40 %.
const BED_COLUMN_HEIGHT_PX = 1000;
const CONSOLE_DRAG_DISTANCE_PX = -100;
const DRAGGED_CONSOLE_PERCENT = 40;
const BED_COLUMN_DRAGGER_SELECTOR = `.ant-splitter-vertical > .ant-splitter-bar ${DRAGGER_SELECTOR}`;
const ARIA_DISABLED_ATTRIBUTE = 'aria-disabled';
const ARIA_DISABLED_VALUE = 'true';
const DESIGN_HANDLE_LABEL = 'Resize the design panel';
const MACHINE_HANDLE_LABEL = 'Resize the machine panel';
const CONSOLE_HANDLE_LABEL = 'Resize the console';
// The default design panel, 20.5rem of 1600 px, and one 1rem step of 16 px, 1 %, to the right.
const DESIGN_DEFAULT_PERCENT = 20.5;
const DESIGN_STEPPED_PERCENT = 21.5;
// The design panel limits, 16.25rem and 28rem of 1600 px, rounded for the ARIA values.
const DESIGN_MIN_PERCENT = 16;
const DESIGN_MAX_PERCENT = 28;
const DESIGN_MIN_EXACT_PERCENT = 16.25;
// The default console of 30 % grows by one 16 px step of the 1000 px column.
const CONSOLE_STEPPED_PERCENT = 31.6;

class ReportingResizeObserver implements ResizeObserver {
  private readonly resizeCallback: ResizeObserverCallback;

  constructor(resizeCallback: ResizeObserverCallback) {
    this.resizeCallback = resizeCallback;
  }

  public observe(target: Element): void {
    const contentRect: DOMRectReadOnly = target.getBoundingClientRect();

    // Reported after observe returns, like a real observer: antd starts listening only after it calls observe.
    queueMicrotask((): void => {
      this.resizeCallback(
        [{ target, contentRect, borderBoxSize: [], contentBoxSize: [], devicePixelContentBoxSize: [] }],
        this,
      );
    });
  }

  public unobserve(): void {
    // Nothing is tracked, so there is nothing to forget.
  }

  public disconnect(): void {
    // Nothing is tracked, so there is nothing to stop.
  }
}

/** The splitter works the sizes out in floating point, so they are compared to a few decimals. */
const expectPanelSizePercents = (panelSizePercents: number[] | undefined): void => {
  expect(panelSizePercents).toHaveLength(DRAGGED_PERCENTS.length);
  DRAGGED_PERCENTS.forEach((expectedPercent: number, index: number) => {
    expect(panelSizePercents?.[index]).toBeCloseTo(expectedPercent);
  });
};

const getFirstDragger = (): HTMLElement => {
  const dragger: HTMLElement | null = document.querySelector(DRAGGER_SELECTOR);

  if (!dragger) {
    throw new Error('No splitter dragger');
  }

  return dragger;
};

const getBedColumnDragger = (): HTMLElement => {
  const dragger: HTMLElement | null = document.querySelector(BED_COLUMN_DRAGGER_SELECTOR);

  if (!dragger) {
    throw new Error('No bed column dragger');
  }

  return dragger;
};

const renderMeasuredAppRoute = async (store: AppStore): Promise<void> => {
  render(
    <Provider store={store}>
      <AppRoute />
    </Provider>,
  );
  await screen.findByRole('main');
  // Once the splitter knows its width its bars can be dragged.
  await vi.waitFor((): void => {
    expect(getFirstDragger()).not.toHaveAttribute(ARIA_DISABLED_ATTRIBUTE, ARIA_DISABLED_VALUE);
  });
};

const dragFirstSplitterBar = (): void => {
  fireEvent.mouseDown(getFirstDragger(), { clientX: 0, clientY: 0 });
  fireEvent.mouseMove(window, { clientX: DRAG_DISTANCE_PX, clientY: 0 });
};

describe('AppRoute panel resizing', () => {
  beforeAll(() => {
    vi.stubGlobal('ResizeObserver', ReportingResizeObserver);
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(WORKBENCH_WIDTH_PX);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(BED_COLUMN_HEIGHT_PX);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    setMatchMediaMatches(true);
  });

  it('stores nothing while a bar is still being dragged', async () => {
    const store: AppStore = newStore();
    const setPanelSizesSpy = vi.spyOn(PANEL_SIZES_REPOSITORY, 'setPanelSizePercents');
    await renderMeasuredAppRoute(store);

    dragFirstSplitterBar();

    expect(setPanelSizesSpy).not.toHaveBeenCalled();
    expect(selectPanelSizePercents(store.getState())).toBeUndefined();
  });

  it('stores the panel sizes in percent when the drag ends', async () => {
    const store: AppStore = newStore();
    await renderMeasuredAppRoute(store);

    dragFirstSplitterBar();
    fireEvent.mouseUp(window);

    expectPanelSizePercents(selectPanelSizePercents(store.getState()));
    await vi.waitFor(async (): Promise<void> => {
      expectPanelSizePercents(await PANEL_SIZES_REPOSITORY.getPanelSizePercents());
    });
  });

  it('stores the console height in percent when a drag of the bed column bar ends', async () => {
    const store: AppStore = newStore();
    await renderMeasuredAppRoute(store);
    act(() => {
      store.dispatch(new ConsoleOpenChanged({ isConsoleOpen: true }));
    });
    await vi.waitFor((): void => {
      expect(getBedColumnDragger()).not.toHaveAttribute(ARIA_DISABLED_ATTRIBUTE, ARIA_DISABLED_VALUE);
    });

    fireEvent.mouseDown(getBedColumnDragger(), { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(window, { clientX: 0, clientY: CONSOLE_DRAG_DISTANCE_PX });
    fireEvent.mouseUp(window);

    expect(selectConsoleSizePercent(store.getState())).toBe(DRAGGED_CONSOLE_PERCENT);
    await vi.waitFor(async (): Promise<void> => {
      expect(await PANEL_SIZES_REPOSITORY.getConsoleSizePercent()).toBe(DRAGGED_CONSOLE_PERCENT);
    });
  });

  it('names each bar handle and reports the bar position and range in percent', async () => {
    await renderMeasuredAppRoute(newStore());

    const designHandle: HTMLElement = screen.getByRole('separator', { name: DESIGN_HANDLE_LABEL });

    expect(designHandle).toHaveAttribute('tabindex', '0');
    expect(designHandle).toHaveAttribute('aria-orientation', 'vertical');
    expect(designHandle).toHaveAttribute('aria-valuenow', String(Math.round(DESIGN_DEFAULT_PERCENT)));
    expect(designHandle).toHaveAttribute('aria-valuemin', String(DESIGN_MIN_PERCENT));
    expect(designHandle).toHaveAttribute('aria-valuemax', String(DESIGN_MAX_PERCENT));
    expect(screen.getByRole('separator', { name: MACHINE_HANDLE_LABEL })).toBeInTheDocument();
  });

  it('steps the design panel one rem wider with the right arrow key and stores the sizes', async () => {
    const store: AppStore = newStore();
    await renderMeasuredAppRoute(store);

    fireEvent.keyDown(screen.getByRole('separator', { name: DESIGN_HANDLE_LABEL }), { key: ARROW_RIGHT_KEY });

    expect(selectPanelSizePercents(store.getState())?.[0]).toBeCloseTo(DESIGN_STEPPED_PERCENT);
    await vi.waitFor(async (): Promise<void> => {
      expect((await PANEL_SIZES_REPOSITORY.getPanelSizePercents())?.[0]).toBeCloseTo(DESIGN_STEPPED_PERCENT);
    });
  });

  it('sends the design panel to its maximum with End and its minimum with Home', async () => {
    const store: AppStore = newStore();
    await renderMeasuredAppRoute(store);
    const designHandle: HTMLElement = screen.getByRole('separator', { name: DESIGN_HANDLE_LABEL });

    fireEvent.keyDown(designHandle, { key: END_KEY });

    expect(selectPanelSizePercents(store.getState())?.[0]).toBeCloseTo(DESIGN_MAX_PERCENT);

    fireEvent.keyDown(designHandle, { key: HOME_KEY });

    expect(selectPanelSizePercents(store.getState())?.[0]).toBeCloseTo(DESIGN_MIN_EXACT_PERCENT);
  });

  it('ignores keys that do not move a bar', async () => {
    const store: AppStore = newStore();
    await renderMeasuredAppRoute(store);

    fireEvent.keyDown(screen.getByRole('separator', { name: DESIGN_HANDLE_LABEL }), { key: ARROW_UP_KEY });

    expect(selectPanelSizePercents(store.getState())).toBeUndefined();
  });

  it('grows the console one step with the up arrow key on its handle', async () => {
    const store: AppStore = newStore();
    await renderMeasuredAppRoute(store);
    act(() => {
      store.dispatch(new ConsoleOpenChanged({ isConsoleOpen: true }));
    });

    fireEvent.keyDown(await screen.findByRole('separator', { name: CONSOLE_HANDLE_LABEL }), { key: ARROW_UP_KEY });

    expect(selectConsoleSizePercent(store.getState())).toBeCloseTo(CONSOLE_STEPPED_PERCENT);
  });
});
