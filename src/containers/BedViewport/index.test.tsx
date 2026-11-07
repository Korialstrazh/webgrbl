import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { BedViewport } from '.';
import { BED_PLACEHOLDER_KIND } from '../../utils/bed/bed.constants';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import { MIDDLE_POINTER_BUTTON, PRIMARY_POINTER_BUTTON, SPACE_KEY } from '../../utils/browser/browser.events.constants';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { newProjectObject } from '../../utils/project/new.project.object';
import { ProjectDocumentLoaded } from '../../utils/states/project.document.state';
import { selectSelectedObjectIds } from '../../utils/states/project.selection.state';
import { OverlayOpened } from '../../utils/states/ui.overlay.state';
import { IDENTITY_SVG_MATRIX, mockSvgScreenMatrix } from '../../utils/test.support/svg.screen.matrix.mock';
import { BedObjects } from '../BedObjects';
import { BED_OBJECTS_SURFACE_TEST_ID } from '../BedObjects/bed.objects.constants';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
const VIEW_WIDTH_PX = 800;
const VIEW_HEIGHT_PX = 400;
// Fit leaves 16 px on each side: 300 mm fill 368 px of height, so 1.2267 px per mm, centred on 200, 150.
const FIT_VIEW_BOX: readonly number[] = [-126.087, -13.043, 652.174, 326.087];
// The plus key zooms by 1.25 around the view centre: the view box keeps its centre at 200, 150.
const ZOOMED_IN_VIEW_BOX: readonly number[] = [-60.87, 19.565, 521.739, 260.87];
// 40 px at 1.5333 px per mm move the zoomed view 26.087 mm to the left.
const PANNED_VIEW_BOX: readonly number[] = [-86.957, 19.565, 521.739, 260.87];
const FIT_MARGIN_PX = 16;
const VIEW_BOX_SEPARATOR = ' ';
const ZOOM_IN_LABEL = /^Zoom in/;
const ZOOM_OUT_LABEL = /^Zoom out/;
const FIT_LABEL = /^Fit the bed/;
const VIEW_BOX_ATTRIBUTE = 'viewBox';
const BED_GROUP_NAME = /Laser bed/;
const FULL_PERCENT_TEXT = '100%';
const ZOOMED_PERCENT_TEXT = '125%';
const FIT_BUTTON_NAME = /^Fit/;
const ARIA_PRESSED = 'aria-pressed';
const expectFitted = (isFitted: boolean): void => {
  expect(screen.getByRole('button', { name: FIT_BUTTON_NAME })).toHaveAttribute(ARIA_PRESSED, String(isFitted));
};
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

const OBJECT_TEST_ID = 'drawn-object';
const SHORT_MOVE_CLIENT_X = 101;

const renderBedViewport = (store: AppStore = newStore(), isWide: boolean = true, children?: ReactNode): void => {
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
        >
          {children}
        </BedViewport>
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
    expect(screen.getByText(FULL_PERCENT_TEXT)).toBeInTheDocument();
    expectFitted(true);
    expect(screen.getByText(RULER_LABEL_TEXT)).toBeInTheDocument();
  });

  it('leaves the fit margin free above and below the bed, the side that limits the fit', () => {
    renderBedViewport();

    const [, viewBoxY, , viewBoxHeight] = getViewBoxNumbers();
    const pixelsPerMm: number = VIEW_HEIGHT_PX / (viewBoxHeight ?? 1);

    expect(-(viewBoxY ?? 0) * pixelsPerMm).toBeCloseTo(FIT_MARGIN_PX);
    expect(((viewBoxHeight ?? 0) + (viewBoxY ?? 0) - DIMENSIONS.heightMm) * pixelsPerMm).toBeCloseTo(FIT_MARGIN_PX);
  });

  it('marks Fit as pressed for a fitted bed and shows the plain percent', () => {
    renderBedViewport();

    expect(screen.getByText(FULL_PERCENT_TEXT)).toBeInTheDocument();
    expectFitted(true);

    fireEvent.click(screen.getByRole('button', { name: ZOOM_IN_LABEL }));

    expectFitted(false);
    expect(screen.getByText(ZOOMED_PERCENT_TEXT)).toBeInTheDocument();
  });

  it('releases Fit at 100% once the view is panned away from the fitted centre', () => {
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
    fireEvent.click(screen.getByRole('button', { name: ZOOM_OUT_LABEL }));

    expectFitted(false);
    expect(screen.getByText(FULL_PERCENT_TEXT)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: FIT_LABEL }));

    expect(screen.getByText(FULL_PERCENT_TEXT)).toBeInTheDocument();
    expectFitted(true);
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

    // The pointer is at the view's top-left corner, the view box corner; it stays there while the bed grows.
    fireEvent.wheel(getViewElement(), { deltaY: -100, clientX: 0, clientY: 0 });

    const [viewBoxX, viewBoxY, viewBoxWidth] = getViewBoxNumbers();

    expect(viewBoxX).toBeCloseTo(FIT_VIEW_BOX[0] ?? 0);
    expect(viewBoxY).toBeCloseTo(FIT_VIEW_BOX[1] ?? 0);
    expect(viewBoxWidth).toBeLessThan(FIT_VIEW_BOX[2] ?? 0);
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

  it('pans with a left drag on empty bed once it passes the drag distance', () => {
    renderBedViewport();
    fireEvent.click(screen.getByRole('button', { name: ZOOM_IN_LABEL }));

    const viewElement: HTMLElement = getViewElement();

    fireEvent.pointerDown(viewElement, {
      pointerId: POINTER_ID,
      button: PRIMARY_POINTER_BUTTON,
      clientX: 100,
      clientY: 100,
    });
    fireEvent.pointerMove(viewElement, { pointerId: POINTER_ID, clientX: SHORT_MOVE_CLIENT_X, clientY: 100 });

    expectViewBox(ZOOMED_IN_VIEW_BOX);
    expect(viewElement.className).not.toMatch(/panning/);

    fireEvent.pointerMove(viewElement, { pointerId: POINTER_ID, clientX: 140, clientY: 100 });

    expect(viewElement.className).toMatch(/panning/);

    fireEvent.pointerUp(viewElement, { pointerId: POINTER_ID, clientX: 140, clientY: 100 });

    expectViewBox(PANNED_VIEW_BOX);
    expect(viewElement.className).not.toMatch(/panning/);
  });

  it('never pans for a left drag on an object unless Space is held', () => {
    renderBedViewport(newStore(), true, <rect data-testid={OBJECT_TEST_ID} data-bed-object />);
    fireEvent.click(screen.getByRole('button', { name: ZOOM_IN_LABEL }));

    const viewElement: HTMLElement = getViewElement();
    const objectElement: HTMLElement = screen.getByTestId(OBJECT_TEST_ID);
    const dragObject = (): void => {
      fireEvent.pointerDown(objectElement, {
        pointerId: POINTER_ID,
        button: PRIMARY_POINTER_BUTTON,
        clientX: 100,
        clientY: 100,
      });
      fireEvent.pointerMove(objectElement, { pointerId: POINTER_ID, clientX: 140, clientY: 100 });
      fireEvent.pointerUp(objectElement, { pointerId: POINTER_ID, clientX: 140, clientY: 100 });
    };

    dragObject();

    expectViewBox(ZOOMED_IN_VIEW_BOX);

    fireEvent.pointerEnter(viewElement);
    fireEvent.keyDown(window, { key: SPACE_KEY });
    dragObject();
    fireEvent.keyUp(window, { key: SPACE_KEY });

    expectViewBox(PANNED_VIEW_BOX);
  });

  it('pans when dragging empty bed with nothing selected, and moves an object dragged on it', () => {
    const store: AppStore = newStore();
    const starObject: ProjectObject = newProjectObject({ name: 'Star', xMm: 10, yMm: 10, widthMm: 20, heightMm: 20 });

    mockSvgScreenMatrix(IDENTITY_SVG_MATRIX, IDENTITY_SVG_MATRIX);
    store.dispatch(new ProjectDocumentLoaded({ document: { objects: [starObject], layers: [] } }));
    renderBedViewport(store, true, <BedObjects dimensions={DIMENSIONS} />);
    fireEvent.click(screen.getByRole('button', { name: ZOOM_IN_LABEL }));

    const viewElement: HTMLElement = getViewElement();
    const surfaceElement: HTMLElement = screen.getByTestId(BED_OBJECTS_SURFACE_TEST_ID);
    const objectElement: HTMLElement = screen.getByRole('img', { name: 'Star' });
    const restingTransform: string | null = objectElement.getAttribute('transform');

    fireEvent.pointerDown(objectElement, {
      pointerId: POINTER_ID,
      button: PRIMARY_POINTER_BUTTON,
      clientX: 20,
      clientY: 280,
    });
    fireEvent.pointerMove(objectElement, { pointerId: POINTER_ID, clientX: 60, clientY: 280 });
    fireEvent.pointerUp(objectElement, { pointerId: POINTER_ID, clientX: 60, clientY: 280 });

    expectViewBox(ZOOMED_IN_VIEW_BOX);
    expect(selectSelectedObjectIds(store.getState())).toEqual([starObject.id]);
    expect(screen.getByRole('img', { name: 'Star' }).getAttribute('transform')).not.toBe(restingTransform);

    fireEvent.pointerDown(surfaceElement, {
      pointerId: POINTER_ID,
      button: PRIMARY_POINTER_BUTTON,
      clientX: 100,
      clientY: 100,
    });

    expect(selectSelectedObjectIds(store.getState())).toEqual([]);

    fireEvent.pointerMove(viewElement, { pointerId: POINTER_ID, clientX: 140, clientY: 100 });
    fireEvent.pointerUp(viewElement, { pointerId: POINTER_ID, clientX: 140, clientY: 100 });

    expectViewBox(PANNED_VIEW_BOX);
  });
});
