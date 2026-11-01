import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { BedObjects } from '.';
import { BED_PLACEHOLDER_KIND } from '../../utils/bed/bed.constants';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { newProjectObject } from '../../utils/project/new.project.object';
import { newStore } from '../../utils/states/new.store';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import {
  ProjectDocumentLoaded,
  ProjectObjectsTransformed,
  ProjectUndoRequested,
  selectCanUndo,
  selectProjectObjects,
} from '../../utils/states/project.document.state';
import { selectSelectedObjectIds } from '../../utils/states/project.selection.state';
import { BED_TOOL } from '../BedPanel/bed.toolbar.constants';
import { BED_OBJECT_OUTSIDE_OUTLINE_TEST_ID, BED_OBJECTS_SURFACE_TEST_ID } from './bed.objects.constants';

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
const IDENTITY_MATRIX = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
const SELECTED_ATTRIBUTE = 'data-selected';
const TRANSFORM_ATTRIBUTE = 'transform';
const TRUE_TEXT = 'true';
const FALSE_TEXT = 'false';
const OUTSIDE_ATTRIBUTE = 'data-outside-bed';

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

const renderObjects = (projectObjects: ProjectObject[]): AppStore => {
  const store: AppStore = newStore();

  store.dispatch(new ProjectDocumentLoaded({ document: { objects: projectObjects } }));
  render(
    <Provider store={store}>
      <svg>
        <BedObjects dimensions={BED} activeTool={BED_TOOL.SELECT} />
      </svg>
    </Provider>,
  );

  return store;
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

const getTransformedDispatchCount = (dispatchSpy: MockInstance<AppDispatch>): number =>
  dispatchSpy.mock.calls.filter((callArguments: unknown[]): boolean =>
    callArguments[0] instanceof ProjectObjectsTransformed).length;

const getStoredObject = (store: AppStore, objectId: string): ProjectObject | undefined =>
  selectProjectObjects(store.getState()).find((projectObject: ProjectObject): boolean => projectObject.id === objectId);

beforeAll(() => {
  Object.defineProperty(SVGSVGElement.prototype, 'getScreenCTM', {
    configurable: true,
    value: () => ({ inverse: () => IDENTITY_MATRIX }),
  });
  Object.defineProperty(Element.prototype, 'setPointerCapture', { configurable: true, value: vi.fn() });
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
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    clickElement(getObjectElement(FIRST_NAME), FIRST_GRAB_X, FIRST_GRAB_Y);

    expect(getTransformedDispatchCount(dispatchSpy)).toBe(0);
    expect(selectCanUndo(store.getState())).toBe(false);
  });

  it('moves every selected object with one transform when dragged 20 mm right and 10 mm up', () => {
    const store: AppStore = renderObjects([firstObject, secondObject]);

    clickElement(getObjectElement(FIRST_NAME), FIRST_GRAB_X, FIRST_GRAB_Y);
    clickElement(getObjectElement(SECOND_NAME), SECOND_GRAB_X, SECOND_GRAB_Y, true);

    const dispatchSpy = vi.spyOn(store, 'dispatch');

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
    expect(getObjectElement(FIRST_NAME)).toHaveAttribute(TRANSFORM_ATTRIBUTE, 'translate(20 280) rotate(0)');
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
});
