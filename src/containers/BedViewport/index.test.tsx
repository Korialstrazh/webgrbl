import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BedViewport } from '.';
import { BED_PLACEHOLDER_KIND } from '../../utils/bed/bed.constants';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import { MIDDLE_POINTER_BUTTON, PRIMARY_POINTER_BUTTON, SPACE_KEY } from '../../utils/browser/browser.events.constants';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { OverlayOpened } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
const VIEW_WIDTH_PX = 800;
const VIEW_HEIGHT_PX = 400;
const FIT_VIEW_BOX: readonly number[] = [-100, 0, 600, 300];
// The plus key zooms by 1.25 around the view centre: the view box keeps its centre at 200, 150.
const ZOOMED_IN_VIEW_BOX: readonly number[] = [-40, 30, 480, 240];
// 40 px at 5/3 px per mm move the zoomed view 24 mm to the left.
const PANNED_VIEW_BOX: readonly number[] = [-64, 30, 480, 240];
const VIEW_BOX_SEPARATOR = ' ';
const ZOOM_IN_LABEL = /^Zoom in/;
const ZOOM_OUT_LABEL = /^Zoom out/;
const FIT_LABEL = /^Fit the bed/;
const VIEW_BOX_ATTRIBUTE = 'viewBox';
const BED_GROUP_NAME = /Machine bed/;
const FIT_PERCENT_TEXT = '100 %';
const ZOOMED_PERCENT_TEXT = '125 %';
const OVERLAY_ID = 'test-overlay';
const POINTER_ID = 1;
const RULER_LABEL_TEXT = '350';
const RULER_UNIT_TEXT = 'mm';

const getBedSvg = (): HTMLElement => screen.getByRole('group', { name: BED_GROUP_NAME });

const getViewBoxNumbers = (): number[] =>
  (getBedSvg().getAttribute(VIEW_BOX_ATTRIBUTE) ?? '').split(VIEW_BOX_SEPARATOR).map(Number);

/** The view box numbers are worked out in floating point, so they are compared to a few decimals. */
const expectViewBox = (expectedViewBox: readonly number[]): void => {
  const viewBoxNumbers: number[] = getViewBoxNumbers();

  expect(viewBoxNumbers).toHaveLength(expectedViewBox.length);
  expectedViewBox.forEach((expectedNumber: number, index: number) => {
    expect(viewBoxNumbers[index]).toBeCloseTo(expectedNumber);
  });
};

const getViewElement = (): HTMLElement => {
  const viewElement: HTMLElement | null = getBedSvg().parentElement;

  if (!viewElement) {
    throw new Error('No bed view element');
  }

  return viewElement;
};

const renderBedViewport = (store: AppStore = newStore(), isWide: boolean = true): void => {
  const controlsHost: HTMLDivElement = document.createElement('div');

  document.body.append(controlsHost);
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedViewport
          dimensions={DIMENSIONS}
          isWide={isWide}
          controlsHost={controlsHost}
          headPosition={undefined}
          workOriginPosition={undefined}
          placeholderLabel={undefined}
        />
      </AntdTestProvider>
    </Provider>,
  );
};

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => VIEW_WIDTH_PX });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => VIEW_HEIGHT_PX });
  Object.defineProperty(Element.prototype, 'setPointerCapture', { configurable: true, value: vi.fn() });
  Object.defineProperty(Element.prototype, 'releasePointerCapture', { configurable: true, value: vi.fn() });
});

afterAll(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'clientWidth');
  Reflect.deleteProperty(HTMLElement.prototype, 'clientHeight');
});

describe(BedViewport.name, () => {
  it('starts with the whole bed fitted to the view and the rulers labelled', () => {
    renderBedViewport();

    expectViewBox(FIT_VIEW_BOX);
    expect(screen.getByText(FIT_PERCENT_TEXT)).toBeInTheDocument();
    expect(screen.getByText(RULER_LABEL_TEXT)).toBeInTheDocument();
  });

  it('draws the rulers in their own bands beside the drawing area, never on the drawing', () => {
    renderBedViewport();

    for (const rulerLabel of screen.getAllByText(RULER_LABEL_TEXT)) {
      expect(getViewElement()).not.toContainElement(rulerLabel);
    }

    expect(getViewElement()).not.toContainElement(screen.getByText(RULER_UNIT_TEXT));
  });

  it('zooms in and out with the buttons and fits the bed again with Fit', () => {
    renderBedViewport();

    fireEvent.click(screen.getByRole('button', { name: ZOOM_IN_LABEL }));

    expectViewBox(ZOOMED_IN_VIEW_BOX);
    expect(screen.getByText(ZOOMED_PERCENT_TEXT)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: ZOOM_OUT_LABEL }));

    expectViewBox(FIT_VIEW_BOX);

    fireEvent.click(screen.getByRole('button', { name: ZOOM_IN_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: FIT_LABEL }));

    expectViewBox(FIT_VIEW_BOX);
  });

  it('zooms with the wheel around the pointer, keeping the bed point under it', () => {
    renderBedViewport();

    // The pointer is at the view's top-left corner, bed point -100, 0; it stays there while the bed grows.
    fireEvent.wheel(getViewElement(), { deltaY: -100, clientX: 0, clientY: 0 });

    const [viewBoxX, viewBoxY, viewBoxWidth] = getViewBoxNumbers();

    expect(viewBoxX).toBeCloseTo(-100);
    expect(viewBoxY).toBeCloseTo(0);
    expect(viewBoxWidth).toBeLessThan(600);
  });

  it('leaves a plain wheel to the page in a narrow window and zooms with Ctrl held', () => {
    renderBedViewport(newStore(), false);

    fireEvent.wheel(getViewElement(), { deltaY: -100, clientX: 0, clientY: 0 });

    expectViewBox(FIT_VIEW_BOX);

    fireEvent.wheel(getViewElement(), { deltaY: -100, clientX: 0, clientY: 0, ctrlKey: true });

    expect(getViewBoxNumbers()[2]).toBeLessThan(FIT_VIEW_BOX[2] ?? 0);
  });

  it('zooms with the plus and minus keys and fits with zero, but not while an overlay is open', () => {
    const store: AppStore = newStore();

    renderBedViewport(store);
    fireEvent.keyDown(window, { key: '+' });

    expectViewBox(ZOOMED_IN_VIEW_BOX);

    fireEvent.keyDown(window, { key: '0' });

    expectViewBox(FIT_VIEW_BOX);

    act(() => {
      store.dispatch(new OverlayOpened({ overlayId: OVERLAY_ID }));
    });
    fireEvent.keyDown(window, { key: '+' });

    expectViewBox(FIT_VIEW_BOX);
  });

  it('pans with a middle-button drag', () => {
    renderBedViewport();
    fireEvent.click(screen.getByRole('button', { name: ZOOM_IN_LABEL }));

    const viewElement: HTMLElement = getViewElement();

    fireEvent.pointerDown(viewElement, {
      pointerId: POINTER_ID,
      button: MIDDLE_POINTER_BUTTON,
      clientX: 100,
      clientY: 100,
    });
    fireEvent.pointerMove(viewElement, { pointerId: POINTER_ID, clientX: 140, clientY: 100 });
    fireEvent.pointerUp(viewElement, { pointerId: POINTER_ID, clientX: 140, clientY: 100 });

    expectViewBox(PANNED_VIEW_BOX);
  });

  it('pans with a left drag only while Space is held over the bed', () => {
    renderBedViewport();
    fireEvent.click(screen.getByRole('button', { name: ZOOM_IN_LABEL }));

    const viewElement: HTMLElement = getViewElement();
    const dragLeft = (): void => {
      fireEvent.pointerDown(viewElement, {
        pointerId: POINTER_ID,
        button: PRIMARY_POINTER_BUTTON,
        clientX: 100,
        clientY: 100,
      });
      fireEvent.pointerMove(viewElement, { pointerId: POINTER_ID, clientX: 140, clientY: 100 });
      fireEvent.pointerUp(viewElement, { pointerId: POINTER_ID, clientX: 140, clientY: 100 });
    };

    dragLeft();

    expectViewBox(ZOOMED_IN_VIEW_BOX);

    fireEvent.pointerEnter(viewElement);
    fireEvent.keyDown(window, { key: SPACE_KEY });
    dragLeft();
    fireEvent.keyUp(window, { key: SPACE_KEY });

    expectViewBox(PANNED_VIEW_BOX);
  });
});
