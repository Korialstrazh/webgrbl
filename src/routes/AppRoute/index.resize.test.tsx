import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AppRoute } from '.';
import { DESIGN_COLUMN_WIDTH_PROPERTY } from '../../utils/layout.constants';
import { PANEL_SIZES_REPOSITORY } from '../../utils/project/panel.sizes.repository';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { selectPanelSizePercents } from '../../utils/states/panel.layout.state';
import { setMatchMediaMatches } from '../../utils/test.support/match.media.mock';

// jsdom does no layout, so the splitter gets a fixed width and a ResizeObserver that reports it; without a width the
// splitter cannot turn a drag into sizes.
const WORKBENCH_WIDTH_PX = 1600;
const DRAG_DISTANCE_PX = 100;
// 17.5rem + 100 px, the rest, and 22rem, at a 16 px root font size, in percent of 1600 px.
const DRAGGED_PERCENTS: number[] = [23.75, 54.25, 22];
const DRAGGER_SELECTOR = '.ant-splitter-bar-dragger';
const ARIA_DISABLED_ATTRIBUTE = 'aria-disabled';
const ARIA_DISABLED_VALUE = 'true';

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

const getFirstDragger = (): HTMLElement => {
  const dragger: HTMLElement | null = document.querySelector(DRAGGER_SELECTOR);

  if (!dragger) {
    throw new Error('No splitter dragger');
  }

  return dragger;
};

const renderMeasuredAppRoute = async (store: AppStore): Promise<HTMLElement> => {
  const { container } = render(
    <Provider store={store}>
      <AppRoute />
    </Provider>,
  );
  await screen.findByRole('main');
  // Once the splitter knows its width its bars can be dragged.
  await vi.waitFor((): void => {
    expect(getFirstDragger()).not.toHaveAttribute(ARIA_DISABLED_ATTRIBUTE, ARIA_DISABLED_VALUE);
  });

  const rootElement: Element | null = container.firstElementChild;

  if (!(rootElement instanceof HTMLElement)) {
    throw new Error('No workbench root');
  }

  return rootElement;
};

const dragFirstSplitterBar = (): void => {
  fireEvent.mouseDown(getFirstDragger(), { clientX: 0, clientY: 0 });
  fireEvent.mouseMove(window, { clientX: DRAG_DISTANCE_PX, clientY: 0 });
};

describe('AppRoute panel resizing', () => {
  beforeAll(() => {
    vi.stubGlobal('ResizeObserver', ReportingResizeObserver);
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(WORKBENCH_WIDTH_PX);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    setMatchMediaMatches(true);
  });

  it('moves the console overlay with the columns while dragging, without storing yet', async () => {
    const store: AppStore = newStore();
    const setPanelSizesSpy = vi.spyOn(PANEL_SIZES_REPOSITORY, 'setPanelSizePercents');
    const rootElement: HTMLElement = await renderMeasuredAppRoute(store);

    dragFirstSplitterBar();

    expect(rootElement.style.getPropertyValue(DESIGN_COLUMN_WIDTH_PROPERTY)).toBe('23.75%');
    expect(setPanelSizesSpy).not.toHaveBeenCalled();
    expect(selectPanelSizePercents(store.getState())).toBeUndefined();
  });

  it('stores the panel sizes in percent when the drag ends', async () => {
    const store: AppStore = newStore();
    await renderMeasuredAppRoute(store);

    dragFirstSplitterBar();
    fireEvent.mouseUp(window);

    expect(selectPanelSizePercents(store.getState())).toEqual(DRAGGED_PERCENTS);
    await vi.waitFor(async (): Promise<void> => {
      expect(await PANEL_SIZES_REPOSITORY.getPanelSizePercents()).toEqual(DRAGGED_PERCENTS);
    });
  });
});
