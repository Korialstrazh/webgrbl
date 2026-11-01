import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { BedObjects } from '.';
import { BED_PLACEHOLDER_KIND } from '../../utils/bed/bed.constants';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import {
  ARROW_RIGHT_KEY,
  ARROW_UP_KEY,
  BACKSPACE_KEY,
  DELETE_KEY,
  ESCAPE_KEY,
  UNDO_KEY,
} from '../../utils/browser/browser.events.constants';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { newProjectObject } from '../../utils/project/new.project.object';
import { newStore } from '../../utils/states/new.store';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import {
  ProjectDocumentLoaded,
  ProjectObjectsDeleted,
  ProjectObjectsTransformed,
  ProjectUndoRequested,
  selectCanUndo,
  selectProjectObjects,
} from '../../utils/states/project.document.state';
import { ProjectSelectionChanged, selectSelectedObjectIds } from '../../utils/states/project.selection.state';
import { OverlayOpened } from '../../utils/states/ui.overlay.state';
import type { SvgScreenMatrixMock } from '../../utils/test.support/interfaces/SvgScreenMatrixMock';
import { IDENTITY_SVG_MATRIX, mockSvgScreenMatrix } from '../../utils/test.support/svg.screen.matrix.mock';
import { BED_TOOL } from '../BedPanel/bed.toolbar.constants';
import { HistoryHotkeys } from '../HistoryHotkeys';
import type { BedTool } from '../BedPanel/bed.toolbar.constants';
import {
  BED_OBJECT_HANDLE,
  BED_OBJECT_HANDLE_TEST_ID,
  BED_OBJECT_OUTSIDE_OUTLINE_TEST_ID,
  BED_OBJECTS_SURFACE_TEST_ID,
  SELECTION_HANDLE_SIZE_MM,
} from './bed.objects.constants';
import type { BedObjectHandle } from './bed.objects.constants';

const BED: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
const FIRST_NAME = 'Star';
const SECOND_NAME = 'Moon';
const OBJECT_SIZE_MM = 20;
const FIRST_X_MM = 10;
const FIRST_Y_MM = 10;
const SECOND_X_MM = 100;
const SECOND_Y_MM = 50;
const DRAG_RIGHT_MM = 20;
const DRAG_UP_MM = 10;
// Inside the first object's box: SVG y is the bed height minus the machine y.
const FIRST_GRAB_X = 15;
const FIRST_GRAB_Y = 280;
const SECOND_GRAB_X = 105;
const SECOND_GRAB_Y = 240;
const POINTER_ID = 1;
const SECONDARY_BUTTON = 2;
// A bed drawn with zero size, and what DOMMatrix.inverse() gives for it.
const ZERO_SIZE_MATRIX: SvgScreenMatrixMock = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 };
const SINGULAR_INVERSE_MATRIX: SvgScreenMatrixMock = { a: NaN, b: NaN, c: NaN, d: NaN, e: NaN, f: NaN };
const TWO_PIXELS_PER_MM_MATRIX: SvgScreenMatrixMock = { a: 2, b: 0, c: 0, d: 2, e: 0, f: 0 };
const HALF_MM_PER_PIXEL_MATRIX: SvgScreenMatrixMock = { a: 0.5, b: 0, c: 0, d: 0.5, e: 0, f: 0 };
const HANDLE_SIZE_PX = 10;
const OBJECTS_LAYER_NAME = 'Design objects: arrow keys move the selection, Delete removes it';
const WIDTH_ATTRIBUTE = 'width';
const HANDLE_ATTRIBUTE = 'data-handle';
const RESTING_TRANSFORM = 'translate(20 280) rotate(0)';
const SELECTED_ATTRIBUTE = 'data-selected';
const TRANSFORM_ATTRIBUTE = 'transform';
const TRUE_TEXT = 'true';
const FALSE_TEXT = 'false';
const OUTSIDE_ATTRIBUTE = 'data-outside-bed';
const WIDE_WIDTH_MM = 100;
const WIDE_HEIGHT_MM = 50;
const WIDE_X_MM = 50;
const WIDE_Y_MM = 50;
const HANDLE_DRAG_RIGHT_MM = 50;
// The top-right handle of the wide object sits on its selection box corner: SVG y is the bed height minus machine y.
const TOP_RIGHT_HANDLE_X = 151;
const TOP_RIGHT_HANDLE_Y = 199;
// The wide object's box centre in SVG units, with the rotate handle 25 + 1 + 24 mm above it at one pixel per mm.
const WIDE_CENTER_X = 100;
const WIDE_CENTER_Y = 225;
const ROTATE_HANDLE_Y = 175;
const ROTATE_RADIUS_MM = 50;
const QUARTER_TURN_DEG = 90;
const SNAPPED_TURN_DEG = 30;
const UNSNAPPED_TURN_DEG = 37;
const DEGREES_PER_HALF_TURN = 180;
const NUDGE_MM = 1;
const SHIFT_NUDGE_MM = 10;
const OVERLAY_ID = 'test-overlay';
const INPUT_LABEL = 'Project name';

const wideObject: ProjectObject = newProjectObject({
  name: FIRST_NAME,
  xMm: WIDE_X_MM,
  yMm: WIDE_Y_MM,
  widthMm: WIDE_WIDTH_MM,
  heightMm: WIDE_HEIGHT_MM,
});

const firstObject: ProjectObject = newProjectObject({
  name: FIRST_NAME,
  xMm: FIRST_X_MM,
  yMm: FIRST_Y_MM,
  widthMm: OBJECT_SIZE_MM,
  heightMm: OBJECT_SIZE_MM,
});
const secondObject: ProjectObject = newProjectObject({
  name: SECOND_NAME,
  svgText: '<svg xmlns="http://www.w3.org/2000/svg"><circle r="1"/></svg>',
  xMm: SECOND_X_MM,
  yMm: SECOND_Y_MM,
  widthMm: OBJECT_SIZE_MM,
  heightMm: OBJECT_SIZE_MM,
});

const renderObjects = (projectObjects: ProjectObject[], activeTool: BedTool = BED_TOOL.SELECT): AppStore => {
  const store: AppStore = newStore();

  store.dispatch(new ProjectDocumentLoaded({ document: { objects: projectObjects } }));
  render(
    <Provider store={store}>
      <svg>
        <BedObjects dimensions={BED} activeTool={activeTool} />
      </svg>
    </Provider>,
  );

  return store;
};

const renderSelectedObjects = (projectObjects: ProjectObject[], activeTool: BedTool = BED_TOOL.SELECT): AppStore => {
  const store: AppStore = renderObjects(projectObjects, activeTool);

  act(() => {
    store.dispatch(new ProjectSelectionChanged({
      objectIds: projectObjects.map((projectObject: ProjectObject): string => projectObject.id),
    }));
  });

  return store;
};

/** The objects with the undo and redo hotkeys mounted, as in the app, and the selection set to all of them. */
const renderObjectsWithHistoryHotkeys = (projectObjects: ProjectObject[]): AppStore => {
  const store: AppStore = newStore();

  store.dispatch(new ProjectDocumentLoaded({ document: { objects: projectObjects } }));
  store.dispatch(new ProjectSelectionChanged({
    objectIds: projectObjects.map((projectObject: ProjectObject): string => projectObject.id),
  }));
  render(
    <Provider store={store}>
      <HistoryHotkeys />
      <svg>
        <BedObjects dimensions={BED} activeTool={BED_TOOL.SELECT} />
      </svg>
    </Provider>,
  );

  return store;
};

const pressUndoHotkey = (): void => {
  fireEvent.keyDown(window, { key: UNDO_KEY, ctrlKey: true });
};

const getObjectsLayer = (): HTMLElement => screen.getByRole('group', { name: OBJECTS_LAYER_NAME });

const getHandleElement = (handle: BedObjectHandle): HTMLElement => {
  const handleElement: HTMLElement | undefined = screen.getAllByTestId(BED_OBJECT_HANDLE_TEST_ID).find(
    (testedElement: HTMLElement): boolean => testedElement.getAttribute(HANDLE_ATTRIBUTE) === handle,
  );

  if (!handleElement) {
    throw new Error(`no ${handle} handle`);
  }

  return handleElement;
};

const getObjectElement = (objectName: string): HTMLElement => screen.getByRole('img', { name: objectName });

const clickElement = (element: Element, clientX: number, clientY: number, shiftKey: boolean = false): void => {
  fireEvent.pointerDown(element, { pointerId: POINTER_ID, clientX, clientY, shiftKey });
  fireEvent.pointerUp(element, { pointerId: POINTER_ID, clientX, clientY, shiftKey });
};

const dragElement = (element: Element, clientX: number, clientY: number): void => {
  const endX: number = clientX + DRAG_RIGHT_MM;
  const endY: number = clientY - DRAG_UP_MM;

  fireEvent.pointerDown(element, { pointerId: POINTER_ID, clientX, clientY });
  fireEvent.pointerMove(element, { pointerId: POINTER_ID, clientX: endX, clientY: endY });
  fireEvent.pointerUp(element, { pointerId: POINTER_ID, clientX: endX, clientY: endY });
};

type ActionClass = abstract new (...parameters: never[]) => unknown;

const getDispatchCount = (dispatchSpy: MockInstance<AppDispatch>, actionClass: ActionClass): number =>
  dispatchSpy.mock.calls.filter((callArguments: unknown[]): boolean => callArguments[0] instanceof actionClass).length;

const getTransformedDispatchCount = (dispatchSpy: MockInstance<AppDispatch>): number =>
  getDispatchCount(dispatchSpy, ProjectObjectsTransformed);

const pressKey = (key: string, shiftKey: boolean = false): boolean =>
  fireEvent.keyDown(getObjectsLayer(), { key, shiftKey });

const dragHandle = (handle: BedObjectHandle, start: number[], end: number[], shiftKey: boolean = false): void => {
  const handleElement: HTMLElement = getHandleElement(handle);
  const [startX, startY] = start;
  const [endX, endY] = end;

  fireEvent.pointerDown(handleElement, { pointerId: POINTER_ID, clientX: startX, clientY: startY, shiftKey });
  fireEvent.pointerMove(handleElement, { pointerId: POINTER_ID, clientX: endX, clientY: endY, shiftKey });
  fireEvent.pointerUp(handleElement, { pointerId: POINTER_ID, clientX: endX, clientY: endY, shiftKey });
};

/** The SVG point at a turn from straight above the wide object's centre, counter-clockwise on screen. */
const getPointAfterTurn = (turnDeg: number): number[] => {
  const angleRadians: number = (QUARTER_TURN_DEG + turnDeg) * Math.PI / DEGREES_PER_HALF_TURN;

  return [
    WIDE_CENTER_X + ROTATE_RADIUS_MM * Math.cos(angleRadians),
    WIDE_CENTER_Y - ROTATE_RADIUS_MM * Math.sin(angleRadians),
  ];
};

const getStoredObject = (store: AppStore, objectId: string): ProjectObject | undefined =>
  selectProjectObjects(store.getState()).find((projectObject: ProjectObject): boolean => projectObject.id === objectId);

beforeAll(() => {
  Object.defineProperty(Element.prototype, 'setPointerCapture', { configurable: true, value: vi.fn() });
});

beforeEach(() => {
  mockSvgScreenMatrix(IDENTITY_SVG_MATRIX, IDENTITY_SVG_MATRIX);
});

describe(BedObjects.name, () => {
  it('draws each object as an SVG image', () => {
    renderObjects([firstObject, secondObject]);

    const imageLinks: string[] = [...document.querySelectorAll('image')].map(
      (imageElement: SVGImageElement): string => imageElement.getAttribute('href') ?? '',
    );

    expect(imageLinks).toHaveLength(2);
    expect(imageLinks[0]).toMatch(/^data:image\/svg\+xml/);
    expect(imageLinks[1]).toMatch(/^data:image\/svg\+xml/);
  });

  it('turns an object counter-clockwise on screen with a negative SVG rotation', () => {
    renderObjects([{ ...firstObject, rotationDeg: 90 }]);

    expect(getObjectElement(FIRST_NAME)).toHaveAttribute(TRANSFORM_ATTRIBUTE, 'translate(20 280) rotate(-90)');
  });

  it('selects an object on click', () => {
    const store: AppStore = renderObjects([firstObject, secondObject]);

    clickElement(getObjectElement(FIRST_NAME), FIRST_GRAB_X, FIRST_GRAB_Y);

    expect(selectSelectedObjectIds(store.getState())).toEqual([firstObject.id]);
    expect(getObjectElement(FIRST_NAME)).toHaveAttribute(SELECTED_ATTRIBUTE, TRUE_TEXT);
    expect(getObjectElement(SECOND_NAME)).toHaveAttribute(SELECTED_ATTRIBUTE, FALSE_TEXT);
  });

  it('adds an object to the selection on Shift-click and removes it on a second one', () => {
    const store: AppStore = renderObjects([firstObject, secondObject]);

    clickElement(getObjectElement(FIRST_NAME), FIRST_GRAB_X, FIRST_GRAB_Y);
    clickElement(getObjectElement(SECOND_NAME), SECOND_GRAB_X, SECOND_GRAB_Y, true);

    expect(selectSelectedObjectIds(store.getState())).toEqual([firstObject.id, secondObject.id]);

    clickElement(getObjectElement(SECOND_NAME), SECOND_GRAB_X, SECOND_GRAB_Y, true);

    expect(selectSelectedObjectIds(store.getState())).toEqual([firstObject.id]);
  });

  it('narrows a selection of several objects to the one clicked', () => {
    const store: AppStore = renderObjects([firstObject, secondObject]);

    clickElement(getObjectElement(FIRST_NAME), FIRST_GRAB_X, FIRST_GRAB_Y);
    clickElement(getObjectElement(SECOND_NAME), SECOND_GRAB_X, SECOND_GRAB_Y, true);
    clickElement(getObjectElement(SECOND_NAME), SECOND_GRAB_X, SECOND_GRAB_Y);

    expect(selectSelectedObjectIds(store.getState())).toEqual([secondObject.id]);
  });

  it('clears the selection on a click on empty bed', () => {
    const store: AppStore = renderObjects([firstObject, secondObject]);

    clickElement(getObjectElement(FIRST_NAME), FIRST_GRAB_X, FIRST_GRAB_Y);
    clickElement(screen.getByTestId(BED_OBJECTS_SURFACE_TEST_ID), 1, 1);

    expect(selectSelectedObjectIds(store.getState())).toEqual([]);
  });

  it('does not move an object on a click', () => {
    const store: AppStore = renderObjects([firstObject]);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    clickElement(getObjectElement(FIRST_NAME), FIRST_GRAB_X, FIRST_GRAB_Y);

    expect(getTransformedDispatchCount(dispatchSpy)).toBe(0);
    expect(selectCanUndo(store.getState())).toBe(false);
  });

  it('moves every selected object with one transform when dragged 20 mm right and 10 mm up', () => {
    const store: AppStore = renderObjects([firstObject, secondObject]);

    clickElement(getObjectElement(FIRST_NAME), FIRST_GRAB_X, FIRST_GRAB_Y);
    clickElement(getObjectElement(SECOND_NAME), SECOND_GRAB_X, SECOND_GRAB_Y, true);

    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    dragElement(getObjectElement(FIRST_NAME), FIRST_GRAB_X, FIRST_GRAB_Y);

    expect(getTransformedDispatchCount(dispatchSpy)).toBe(1);
    expect(getStoredObject(store, firstObject.id)).toMatchObject({
      xMm: FIRST_X_MM + DRAG_RIGHT_MM,
      yMm: FIRST_Y_MM + DRAG_UP_MM,
    });
    expect(getStoredObject(store, secondObject.id)).toMatchObject({
      xMm: SECOND_X_MM + DRAG_RIGHT_MM,
      yMm: SECOND_Y_MM + DRAG_UP_MM,
    });
  });

  it('undoes a drag in one step', () => {
    const store: AppStore = renderObjects([firstObject, secondObject]);

    dragElement(getObjectElement(FIRST_NAME), FIRST_GRAB_X, FIRST_GRAB_Y);
    act(() => {
      store.dispatch(new ProjectUndoRequested());
    });

    expect(getStoredObject(store, firstObject.id)).toMatchObject({ xMm: FIRST_X_MM, yMm: FIRST_Y_MM });
    expect(selectCanUndo(store.getState())).toBe(false);
  });

  it('selects and moves only an unselected object that is dragged', () => {
    const store: AppStore = renderObjects([firstObject, secondObject]);

    clickElement(getObjectElement(FIRST_NAME), FIRST_GRAB_X, FIRST_GRAB_Y);
    dragElement(getObjectElement(SECOND_NAME), SECOND_GRAB_X, SECOND_GRAB_Y);

    expect(selectSelectedObjectIds(store.getState())).toEqual([secondObject.id]);
    expect(getStoredObject(store, secondObject.id)).toMatchObject({
      xMm: SECOND_X_MM + DRAG_RIGHT_MM,
      yMm: SECOND_Y_MM + DRAG_UP_MM,
    });
    expect(getStoredObject(store, firstObject.id)).toMatchObject({ xMm: FIRST_X_MM, yMm: FIRST_Y_MM });
  });

  it('shows the drag offset while the pointer is still down', () => {
    renderObjects([firstObject]);

    fireEvent.pointerDown(getObjectElement(FIRST_NAME), {
      pointerId: POINTER_ID,
      clientX: FIRST_GRAB_X,
      clientY: FIRST_GRAB_Y,
    });
    fireEvent.pointerMove(getObjectElement(FIRST_NAME), {
      pointerId: POINTER_ID,
      clientX: FIRST_GRAB_X + DRAG_RIGHT_MM,
      clientY: FIRST_GRAB_Y - DRAG_UP_MM,
    });

    expect(getObjectElement(FIRST_NAME)).toHaveAttribute(TRANSFORM_ATTRIBUTE, 'translate(40 270) rotate(0)');
  });

  it('ignores the undo hotkey while a drag runs, so the drag lands on the document it started from', () => {
    const store: AppStore = renderObjectsWithHistoryHotkeys([firstObject]);
    pressKey(ARROW_RIGHT_KEY);
    const objectElement: HTMLElement = getObjectElement(FIRST_NAME);
    const dragEnd: PointerEventInit = {
      pointerId: POINTER_ID,
      clientX: FIRST_GRAB_X + NUDGE_MM + DRAG_RIGHT_MM,
      clientY: FIRST_GRAB_Y - DRAG_UP_MM,
    };

    fireEvent.pointerDown(objectElement, {
      pointerId: POINTER_ID,
      clientX: FIRST_GRAB_X + NUDGE_MM,
      clientY: FIRST_GRAB_Y,
    });
    fireEvent.pointerMove(objectElement, dragEnd);
    pressUndoHotkey();
    fireEvent.pointerUp(objectElement, dragEnd);

    expect(getStoredObject(store, firstObject.id)).toMatchObject({
      xMm: FIRST_X_MM + NUDGE_MM + DRAG_RIGHT_MM,
      yMm: FIRST_Y_MM + DRAG_UP_MM,
    });

    pressUndoHotkey();

    expect(getStoredObject(store, firstObject.id)).toMatchObject({ xMm: FIRST_X_MM + NUDGE_MM, yMm: FIRST_Y_MM });
  });

  it('drops a cancelled drag without moving anything', () => {
    const store: AppStore = renderObjects([firstObject]);

    fireEvent.pointerDown(getObjectElement(FIRST_NAME), {
      pointerId: POINTER_ID,
      clientX: FIRST_GRAB_X,
      clientY: FIRST_GRAB_Y,
    });
    fireEvent.pointerMove(getObjectElement(FIRST_NAME), {
      pointerId: POINTER_ID,
      clientX: FIRST_GRAB_X + DRAG_RIGHT_MM,
      clientY: FIRST_GRAB_Y,
    });
    fireEvent.pointerCancel(getObjectElement(FIRST_NAME), { pointerId: POINTER_ID });

    expect(getStoredObject(store, firstObject.id)).toMatchObject({ xMm: FIRST_X_MM, yMm: FIRST_Y_MM });
    expect(getObjectElement(FIRST_NAME)).toHaveAttribute(TRANSFORM_ATTRIBUTE, RESTING_TRANSFORM);
  });

  it('drops the drag without moving anything when the pointer capture is lost', () => {
    const store: AppStore = renderObjects([firstObject]);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    fireEvent.pointerDown(getObjectElement(FIRST_NAME), {
      pointerId: POINTER_ID,
      clientX: FIRST_GRAB_X,
      clientY: FIRST_GRAB_Y,
    });
    fireEvent.pointerMove(getObjectElement(FIRST_NAME), {
      pointerId: POINTER_ID,
      clientX: FIRST_GRAB_X + DRAG_RIGHT_MM,
      clientY: FIRST_GRAB_Y,
    });
    fireEvent.lostPointerCapture(getObjectElement(FIRST_NAME), { pointerId: POINTER_ID });

    expect(getObjectElement(FIRST_NAME)).toHaveAttribute(TRANSFORM_ATTRIBUTE, RESTING_TRANSFORM);

    fireEvent.pointerUp(getObjectElement(FIRST_NAME), {
      pointerId: POINTER_ID,
      clientX: FIRST_GRAB_X + DRAG_RIGHT_MM,
      clientY: FIRST_GRAB_Y,
    });

    expect(getTransformedDispatchCount(dispatchSpy)).toBe(0);
    expect(getStoredObject(store, firstObject.id)).toMatchObject({ xMm: FIRST_X_MM, yMm: FIRST_Y_MM });
  });

  it('commits a fast flick from where the pointer comes up, with no move in between', () => {
    const store: AppStore = renderObjects([firstObject]);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    fireEvent.pointerDown(getObjectElement(FIRST_NAME), {
      pointerId: POINTER_ID,
      clientX: FIRST_GRAB_X,
      clientY: FIRST_GRAB_Y,
    });
    fireEvent.pointerUp(getObjectElement(FIRST_NAME), {
      pointerId: POINTER_ID,
      clientX: FIRST_GRAB_X + DRAG_RIGHT_MM,
      clientY: FIRST_GRAB_Y,
    });

    expect(getTransformedDispatchCount(dispatchSpy)).toBe(1);
    expect(getStoredObject(store, firstObject.id)).toMatchObject({ xMm: FIRST_X_MM + DRAG_RIGHT_MM, yMm: FIRST_Y_MM });
  });

  it('starts no drag when the screen matrix cannot be inverted', () => {
    const store: AppStore = renderObjects([firstObject]);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    mockSvgScreenMatrix(ZERO_SIZE_MATRIX, SINGULAR_INVERSE_MATRIX);
    dragElement(getObjectElement(FIRST_NAME), FIRST_GRAB_X, FIRST_GRAB_Y);

    expect(getTransformedDispatchCount(dispatchSpy)).toBe(0);
    expect(getStoredObject(store, firstObject.id)).toMatchObject({ xMm: FIRST_X_MM, yMm: FIRST_Y_MM });
    expect(getObjectElement(FIRST_NAME)).toHaveAttribute(TRANSFORM_ATTRIBUTE, RESTING_TRANSFORM);
  });

  it('ignores a press of the secondary mouse button', () => {
    const store: AppStore = renderObjects([firstObject]);

    fireEvent.pointerDown(getObjectElement(FIRST_NAME), {
      pointerId: POINTER_ID,
      button: SECONDARY_BUTTON,
      clientX: FIRST_GRAB_X,
      clientY: FIRST_GRAB_Y,
    });

    expect(selectSelectedObjectIds(store.getState())).toEqual([]);
  });

  it('marks an object outside the bed with the danger outline', () => {
    renderObjects([{ ...firstObject, xMm: -OBJECT_SIZE_MM }, secondObject]);

    expect(getObjectElement(FIRST_NAME)).toHaveAttribute(OUTSIDE_ATTRIBUTE, TRUE_TEXT);
    expect(getObjectElement(SECOND_NAME)).toHaveAttribute(OUTSIDE_ATTRIBUTE, FALSE_TEXT);
    expect(screen.getAllByTestId(BED_OBJECT_OUTSIDE_OUTLINE_TEST_ID)).toHaveLength(1);
  });

  describe('handles', () => {
    it('draws four corner handles and a rotate handle only for a single selection', () => {
      renderSelectedObjects([firstObject, secondObject]);

      expect(screen.queryAllByTestId(BED_OBJECT_HANDLE_TEST_ID)).toHaveLength(0);

      clickElement(getObjectElement(FIRST_NAME), FIRST_GRAB_X, FIRST_GRAB_Y);

      expect(screen.getAllByTestId(BED_OBJECT_HANDLE_TEST_ID).map(
        (handleElement: HTMLElement): string | null => handleElement.getAttribute(HANDLE_ATTRIBUTE),
      )).toEqual(Object.values(BED_OBJECT_HANDLE));
    });

    it('keeps the handles the same size on screen however large the bed is drawn', () => {
      mockSvgScreenMatrix(TWO_PIXELS_PER_MM_MATRIX, HALF_MM_PER_PIXEL_MATRIX);
      renderSelectedObjects([wideObject]);

      expect(getHandleElement(BED_OBJECT_HANDLE.TOP_RIGHT)).toHaveAttribute(
        WIDTH_ATTRIBUTE,
        String(HANDLE_SIZE_PX / 2),
      );
    });

    it('falls back to the millimetre handle size while the bed has no screen matrix', () => {
      mockSvgScreenMatrix(ZERO_SIZE_MATRIX, SINGULAR_INVERSE_MATRIX);
      renderSelectedObjects([wideObject]);

      expect(getHandleElement(BED_OBJECT_HANDLE.TOP_RIGHT)).toHaveAttribute(
        WIDTH_ATTRIBUTE,
        String(SELECTION_HANDLE_SIZE_MM),
      );
    });

    it('scales around the opposite corner with the aspect ratio kept, in one transform', () => {
      const store: AppStore = renderSelectedObjects([wideObject]);
      const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

      dragHandle(
        BED_OBJECT_HANDLE.TOP_RIGHT,
        [TOP_RIGHT_HANDLE_X, TOP_RIGHT_HANDLE_Y],
        [TOP_RIGHT_HANDLE_X + HANDLE_DRAG_RIGHT_MM, TOP_RIGHT_HANDLE_Y],
      );

      expect(getTransformedDispatchCount(dispatchSpy)).toBe(1);
      expect(getStoredObject(store, wideObject.id)).toMatchObject({
        xMm: WIDE_X_MM,
        yMm: WIDE_Y_MM,
        widthMm: 150,
        heightMm: 75,
      });
    });

    it('scales freely with Shift held', () => {
      const store: AppStore = renderSelectedObjects([wideObject]);

      dragHandle(
        BED_OBJECT_HANDLE.TOP_RIGHT,
        [TOP_RIGHT_HANDLE_X, TOP_RIGHT_HANDLE_Y],
        [TOP_RIGHT_HANDLE_X + HANDLE_DRAG_RIGHT_MM, TOP_RIGHT_HANDLE_Y],
        true,
      );

      expect(getStoredObject(store, wideObject.id)).toMatchObject({
        xMm: WIDE_X_MM,
        yMm: WIDE_Y_MM,
        widthMm: 150,
        heightMm: WIDE_HEIGHT_MM,
      });
    });

    it('keeps the selection when a handle is pressed', () => {
      const store: AppStore = renderSelectedObjects([wideObject]);

      dragHandle(
        BED_OBJECT_HANDLE.TOP_RIGHT,
        [TOP_RIGHT_HANDLE_X, TOP_RIGHT_HANDLE_Y],
        [TOP_RIGHT_HANDLE_X + HANDLE_DRAG_RIGHT_MM, TOP_RIGHT_HANDLE_Y],
      );

      expect(selectSelectedObjectIds(store.getState())).toEqual([wideObject.id]);
    });

    it('ignores the undo hotkey while a handle gesture runs', () => {
      const store: AppStore = renderObjectsWithHistoryHotkeys([wideObject]);
      pressKey(ARROW_UP_KEY);
      const handleElement: HTMLElement = getHandleElement(BED_OBJECT_HANDLE.TOP_RIGHT);
      const gestureEnd: PointerEventInit = {
        pointerId: POINTER_ID,
        clientX: TOP_RIGHT_HANDLE_X + HANDLE_DRAG_RIGHT_MM,
        clientY: TOP_RIGHT_HANDLE_Y - NUDGE_MM,
      };

      fireEvent.pointerDown(handleElement, {
        pointerId: POINTER_ID,
        clientX: TOP_RIGHT_HANDLE_X,
        clientY: TOP_RIGHT_HANDLE_Y - NUDGE_MM,
      });
      fireEvent.pointerMove(handleElement, gestureEnd);
      pressUndoHotkey();
      fireEvent.pointerUp(handleElement, gestureEnd);

      expect(getStoredObject(store, wideObject.id)).toMatchObject({
        xMm: WIDE_X_MM,
        yMm: WIDE_Y_MM + NUDGE_MM,
        widthMm: 150,
        heightMm: 75,
      });

      pressUndoHotkey();

      expect(getStoredObject(store, wideObject.id)).toMatchObject({
        yMm: WIDE_Y_MM + NUDGE_MM,
        widthMm: WIDE_WIDTH_MM,
        heightMm: WIDE_HEIGHT_MM,
      });
    });

    it('drops a cancelled scale without changing the object', () => {
      const store: AppStore = renderSelectedObjects([wideObject]);
      const handleElement: HTMLElement = getHandleElement(BED_OBJECT_HANDLE.TOP_RIGHT);

      fireEvent.pointerDown(handleElement, {
        pointerId: POINTER_ID,
        clientX: TOP_RIGHT_HANDLE_X,
        clientY: TOP_RIGHT_HANDLE_Y,
      });
      fireEvent.pointerMove(handleElement, {
        pointerId: POINTER_ID,
        clientX: TOP_RIGHT_HANDLE_X + HANDLE_DRAG_RIGHT_MM,
        clientY: TOP_RIGHT_HANDLE_Y,
      });
      fireEvent.lostPointerCapture(handleElement, { pointerId: POINTER_ID });
      fireEvent.pointerUp(handleElement, {
        pointerId: POINTER_ID,
        clientX: TOP_RIGHT_HANDLE_X + HANDLE_DRAG_RIGHT_MM,
        clientY: TOP_RIGHT_HANDLE_Y,
      });

      expect(getStoredObject(store, wideObject.id)).toMatchObject({ widthMm: WIDE_WIDTH_MM, heightMm: WIDE_HEIGHT_MM });
      expect(selectCanUndo(store.getState())).toBe(false);
    });

    it('rotates a quarter turn when the rotate handle is dragged a quarter turn, in one undo step', () => {
      const store: AppStore = renderSelectedObjects([wideObject]);

      dragHandle(BED_OBJECT_HANDLE.ROTATE, [WIDE_CENTER_X, ROTATE_HANDLE_Y], getPointAfterTurn(QUARTER_TURN_DEG));

      expect(getStoredObject(store, wideObject.id)?.rotationDeg).toBeCloseTo(QUARTER_TURN_DEG);

      act(() => {
        store.dispatch(new ProjectUndoRequested());
      });

      expect(getStoredObject(store, wideObject.id)?.rotationDeg).toBe(0);
      expect(selectCanUndo(store.getState())).toBe(false);
    });

    it('snaps a 37 degree turn to 30 degrees with Shift held', () => {
      const store: AppStore = renderSelectedObjects([wideObject]);

      dragHandle(
        BED_OBJECT_HANDLE.ROTATE,
        [WIDE_CENTER_X, ROTATE_HANDLE_Y],
        getPointAfterTurn(UNSNAPPED_TURN_DEG),
        true,
      );

      expect(getStoredObject(store, wideObject.id)?.rotationDeg).toBe(SNAPPED_TURN_DEG);
    });
  });

  describe('keys', () => {
    it('nudges the selection 1 mm right and 10 mm up with Shift, one undo step per press', () => {
      const store: AppStore = renderSelectedObjects([firstObject]);

      expect(pressKey(ARROW_RIGHT_KEY)).toBe(false);
      expect(getStoredObject(store, firstObject.id)).toMatchObject({ xMm: FIRST_X_MM + NUDGE_MM, yMm: FIRST_Y_MM });

      pressKey(ARROW_UP_KEY, true);

      expect(getStoredObject(store, firstObject.id)).toMatchObject({
        xMm: FIRST_X_MM + NUDGE_MM,
        yMm: FIRST_Y_MM + SHIFT_NUDGE_MM,
      });

      act(() => {
        store.dispatch(new ProjectUndoRequested());
      });

      expect(getStoredObject(store, firstObject.id)).toMatchObject({ xMm: FIRST_X_MM + NUDGE_MM, yMm: FIRST_Y_MM });

      act(() => {
        store.dispatch(new ProjectUndoRequested());
      });

      expect(getStoredObject(store, firstObject.id)).toMatchObject({ xMm: FIRST_X_MM, yMm: FIRST_Y_MM });
      expect(selectCanUndo(store.getState())).toBe(false);
    });

    it('nudges every selected object with one transform', () => {
      const store: AppStore = renderSelectedObjects([firstObject, secondObject]);
      const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

      pressKey(ARROW_RIGHT_KEY);

      expect(getTransformedDispatchCount(dispatchSpy)).toBe(1);
      expect(getStoredObject(store, secondObject.id)).toMatchObject({ xMm: SECOND_X_MM + NUDGE_MM });
    });

    it('lets an arrow scroll the page when nothing is selected', () => {
      const store: AppStore = renderObjects([firstObject]);
      const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

      expect(pressKey(ARROW_RIGHT_KEY)).toBe(true);
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('removes the selection with Delete and with Backspace', () => {
      const store: AppStore = renderSelectedObjects([firstObject]);

      pressKey(DELETE_KEY);

      expect(selectProjectObjects(store.getState())).toEqual([]);

      act(() => {
        store.dispatch(new ProjectUndoRequested());
        store.dispatch(new ProjectSelectionChanged({ objectIds: [firstObject.id] }));
      });
      pressKey(BACKSPACE_KEY);

      expect(selectProjectObjects(store.getState())).toEqual([]);
    });

    it('removes nothing on Delete while focus is in an input on the page', () => {
      const store: AppStore = newStore();

      store.dispatch(new ProjectDocumentLoaded({ document: { objects: [firstObject] } }));
      store.dispatch(new ProjectSelectionChanged({ objectIds: [firstObject.id] }));
      render(
        <Provider store={store}>
          <input aria-label={INPUT_LABEL} />
          <svg>
            <BedObjects dimensions={BED} activeTool={BED_TOOL.SELECT} />
          </svg>
        </Provider>,
      );

      const inputElement: HTMLElement = screen.getByRole('textbox', { name: INPUT_LABEL });
      const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

      inputElement.focus();
      fireEvent.keyDown(inputElement, { key: DELETE_KEY });
      fireEvent.keyDown(inputElement, { key: BACKSPACE_KEY });

      expect(getDispatchCount(dispatchSpy, ProjectObjectsDeleted)).toBe(0);
      expect(selectProjectObjects(store.getState())).toEqual([firstObject]);
    });

    it('ignores the keys while an overlay is open', () => {
      const store: AppStore = renderSelectedObjects([firstObject]);

      act(() => {
        store.dispatch(new OverlayOpened({ overlayId: OVERLAY_ID }));
      });
      pressKey(DELETE_KEY);
      pressKey(ARROW_RIGHT_KEY);

      expect(selectProjectObjects(store.getState())).toEqual([firstObject]);
    });

    it('leaves Escape to the Stop hotkey and keeps the selection', () => {
      const store: AppStore = renderSelectedObjects([firstObject]);

      expect(pressKey(ESCAPE_KEY)).toBe(true);
      expect(selectSelectedObjectIds(store.getState())).toEqual([firstObject.id]);
    });

    it('is reachable with the keyboard', () => {
      renderObjects([firstObject]);

      expect(getObjectsLayer()).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Move tool', () => {
    it('moves the selection from a drag on empty bed without changing the selection', () => {
      const store: AppStore = renderSelectedObjects([firstObject], BED_TOOL.MOVE);
      const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

      dragElement(screen.getByTestId(BED_OBJECTS_SURFACE_TEST_ID), SECOND_GRAB_X, SECOND_GRAB_Y);

      expect(getTransformedDispatchCount(dispatchSpy)).toBe(1);
      expect(getStoredObject(store, firstObject.id)).toMatchObject({
        xMm: FIRST_X_MM + DRAG_RIGHT_MM,
        yMm: FIRST_Y_MM + DRAG_UP_MM,
      });
      expect(selectSelectedObjectIds(store.getState())).toEqual([firstObject.id]);
    });

    it('moves the selection, not the object, from a drag on an unselected object', () => {
      const store: AppStore = renderObjects([firstObject, secondObject], BED_TOOL.MOVE);

      act(() => {
        store.dispatch(new ProjectSelectionChanged({ objectIds: [firstObject.id] }));
      });
      dragElement(getObjectElement(SECOND_NAME), SECOND_GRAB_X, SECOND_GRAB_Y);

      expect(getStoredObject(store, firstObject.id)).toMatchObject({ xMm: FIRST_X_MM + DRAG_RIGHT_MM });
      expect(getStoredObject(store, secondObject.id)).toMatchObject({ xMm: SECOND_X_MM, yMm: SECOND_Y_MM });
      expect(selectSelectedObjectIds(store.getState())).toEqual([firstObject.id]);
    });

    it('does nothing with nothing selected', () => {
      const store: AppStore = renderObjects([firstObject], BED_TOOL.MOVE);
      const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

      dragElement(screen.getByTestId(BED_OBJECTS_SURFACE_TEST_ID), SECOND_GRAB_X, SECOND_GRAB_Y);
      dragElement(getObjectElement(FIRST_NAME), FIRST_GRAB_X, FIRST_GRAB_Y);

      expect(dispatchSpy).not.toHaveBeenCalled();
      expect(getStoredObject(store, firstObject.id)).toMatchObject({ xMm: FIRST_X_MM, yMm: FIRST_Y_MM });
    });
  });
});
