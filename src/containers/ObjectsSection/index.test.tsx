import { fireEvent, render, screen, within } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { ObjectsSection } from '.';
import { ENTER_KEY } from '../../utils/browser/browser.events.constants';
import { MULTIPLICATION_SIGN } from '../../utils/characters.constants';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { newProjectObject } from '../../utils/project/new.project.object';
import { newStore } from '../../utils/states/new.store';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import {
  ProjectDocumentLoaded,
  ProjectObjectsTransformed,
  ProjectUndoRequested,
  selectProjectObjects,
} from '../../utils/states/project.document.state';
import { ProjectSelectionChanged, selectSelectedObjectIds } from '../../utils/states/project.selection.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const FIRST_ID = 'first';
const SECOND_ID = 'second';
const FIRST_NAME = 'Star';
const SECOND_NAME = 'Moon';
const WIDE_WIDTH_MM = 100;
const WIDE_HEIGHT_MM = 50;
const NEW_WIDTH_TEXT = '50';
const NEW_WIDTH_MM = 50;
const HALF_HEIGHT_MM = 25;
const OVERSIZED_ROTATION_TEXT = '400';
const NORMALIZED_ROTATION_DEG = 40;
const NEGATIVE_ROTATION_TEXT = '-30';
const NEGATIVE_NORMALIZED_ROTATION_DEG = 330;
const BED_OVERFLOW_X_MM = 5000;
const WIDTH_LABEL = 'Width';
const HEIGHT_LABEL = 'Height';
const ROTATION_LABEL = 'Rotation';
const X_LABEL = 'X';
const LOCK_LABEL = 'Lock aspect ratio';
const OUTSIDE_NOTE = 'Outside the bed';
const FIRST_SIZE_TEXT = `100.0 ${MULTIPLICATION_SIGN} 50.0 mm`;
const SECOND_SIZE_TEXT = `20.0 ${MULTIPLICATION_SIGN} 20.0 mm`;
const SECOND_SIZE_MM = 20;
const OBJECTS_LIST_NAME = 'Project objects';
const IMPORT_LABEL = 'Import SVG';
const EMPTY_HINT_PATTERN = /No objects yet/;
const SECOND_ROW_NAME_PATTERN = /^Moon/;
const PRESSED_ATTRIBUTE = 'aria-pressed';
const TRUE_TEXT = 'true';
const FRACTIONAL_X_MM = 12.3456;
const SECOND_X_MM = 80;
const SECOND_X_TEXT = '80.0';
const MOVED_X_MM = 40;
const MOVED_X_TEXT = '40.0';

const loadObjects = (store: AppStore): void => {
  act(() => {
    store.dispatch(new ProjectDocumentLoaded({
      document: {
        objects: [
          newProjectObject({ id: FIRST_ID, name: FIRST_NAME, widthMm: WIDE_WIDTH_MM, heightMm: WIDE_HEIGHT_MM }),
          newProjectObject({ id: SECOND_ID, name: SECOND_NAME, widthMm: SECOND_SIZE_MM, heightMm: SECOND_SIZE_MM }),
        ],
      },
    }));
  });
};

const renderSection = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <ObjectsSection />
      </AntdTestProvider>
    </Provider>,
  );
};

const selectFirst = (store: AppStore): void => {
  act(() => {
    store.dispatch(new ProjectSelectionChanged({ objectIds: [FIRST_ID] }));
  });
};

const commitField = (label: string, text: string): void => {
  const input: HTMLElement = screen.getByLabelText(label);

  fireEvent.change(input, { target: { value: text } });
  fireEvent.blur(input);
};

const loadFractionalObjects = (store: AppStore): void => {
  act(() => {
    store.dispatch(new ProjectDocumentLoaded({
      document: {
        objects: [
          newProjectObject({ id: FIRST_ID, name: FIRST_NAME, xMm: FRACTIONAL_X_MM }),
          newProjectObject({ id: SECOND_ID, name: SECOND_NAME, xMm: SECOND_X_MM }),
        ],
      },
    }));
  });
};

const focusAndLeaveField = (label: string): void => {
  const input: HTMLElement = screen.getByLabelText(label);

  fireEvent.focus(input);
  fireEvent.blur(input);
};

const getTransformDispatchCount = (dispatchSpy: MockInstance<AppDispatch>): number =>
  dispatchSpy.mock.calls.filter(
    ([dispatchedAction]: Parameters<AppDispatch>): boolean =>
      dispatchedAction.type === ProjectObjectsTransformed.type,
  ).length;

const getObjectById = (store: AppStore, objectId: string): ProjectObject | undefined =>
  selectProjectObjects(store.getState()).find(
    (projectObject: ProjectObject): boolean => projectObject.id === objectId,
  );

describe(ObjectsSection.name, () => {
  it('shows a hint and an import button when there are no objects', () => {
    renderSection(newStore());

    expect(screen.getByText(EMPTY_HINT_PATTERN)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: IMPORT_LABEL })).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('lists the objects with their sizes and no fields while nothing is selected', () => {
    const store: AppStore = newStore();

    loadObjects(store);
    renderSection(store);

    const list: HTMLElement = screen.getByRole('list', { name: OBJECTS_LIST_NAME });

    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).getByText(FIRST_SIZE_TEXT)).toBeInTheDocument();
    expect(within(list).getByText(SECOND_SIZE_TEXT)).toBeInTheDocument();
    expect(screen.queryByLabelText(WIDTH_LABEL)).not.toBeInTheDocument();
  });

  it('selects an object on a row click and marks it pressed', () => {
    const store: AppStore = newStore();

    loadObjects(store);
    renderSection(store);
    fireEvent.click(screen.getByRole('button', { name: SECOND_ROW_NAME_PATTERN }));

    expect(selectSelectedObjectIds(store.getState())).toEqual([SECOND_ID]);
    expect(screen.getByRole('button', { name: SECOND_ROW_NAME_PATTERN })).toHaveAttribute(PRESSED_ATTRIBUTE, TRUE_TEXT);
  });

  it('deletes an object with its delete button', () => {
    const store: AppStore = newStore();

    loadObjects(store);
    renderSection(store);
    fireEvent.click(screen.getByRole('button', { name: `Delete ${FIRST_NAME}` }));

    const remainingIds: string[] = selectProjectObjects(store.getState()).map(
      (projectObject: ProjectObject): string => projectObject.id,
    );

    expect(remainingIds).toEqual([SECOND_ID]);
  });

  it('shows the outside note only for an object outside the bed', () => {
    const store: AppStore = newStore();

    loadObjects(store);
    act(() => {
      store.dispatch(new ProjectObjectsTransformed({
        transforms: {
          [SECOND_ID]: {
            xMm: BED_OVERFLOW_X_MM,
            yMm: 0,
            widthMm: SECOND_SIZE_MM,
            heightMm: SECOND_SIZE_MM,
            rotationDeg: 0,
          },
        },
      }));
    });
    renderSection(store);

    expect(screen.getAllByText(OUTSIDE_NOTE)).toHaveLength(1);
  });

  it('scales the height with the width while the ratio is locked, as one undo step', () => {
    const store: AppStore = newStore();

    loadObjects(store);
    selectFirst(store);
    renderSection(store);
    commitField(WIDTH_LABEL, NEW_WIDTH_TEXT);

    expect(getObjectById(store, FIRST_ID)).toMatchObject({ widthMm: NEW_WIDTH_MM, heightMm: HALF_HEIGHT_MM });

    act(() => {
      store.dispatch(new ProjectUndoRequested());
    });

    expect(getObjectById(store, FIRST_ID)).toMatchObject({ widthMm: WIDE_WIDTH_MM, heightMm: WIDE_HEIGHT_MM });
  });

  it('scales the width with the height while the ratio is locked', () => {
    const store: AppStore = newStore();

    loadObjects(store);
    selectFirst(store);
    renderSection(store);
    commitField(HEIGHT_LABEL, String(HALF_HEIGHT_MM));

    expect(getObjectById(store, FIRST_ID)).toMatchObject({ widthMm: NEW_WIDTH_MM, heightMm: HALF_HEIGHT_MM });
  });

  it('changes only the width when the ratio lock is off', () => {
    const store: AppStore = newStore();

    loadObjects(store);
    selectFirst(store);
    renderSection(store);
    fireEvent.click(screen.getByRole('switch', { name: LOCK_LABEL }));
    commitField(WIDTH_LABEL, NEW_WIDTH_TEXT);

    expect(getObjectById(store, FIRST_ID)).toMatchObject({ widthMm: NEW_WIDTH_MM, heightMm: WIDE_HEIGHT_MM });
  });

  it('starts with the ratio lock on', () => {
    const store: AppStore = newStore();

    loadObjects(store);
    selectFirst(store);
    renderSection(store);

    expect(screen.getByRole('switch', { name: LOCK_LABEL })).toBeChecked();
  });

  it.each([
    [OVERSIZED_ROTATION_TEXT, NORMALIZED_ROTATION_DEG],
    [NEGATIVE_ROTATION_TEXT, NEGATIVE_NORMALIZED_ROTATION_DEG],
  ])('normalises a rotation of %s to %s degrees', (text: string, expectedDeg: number) => {
    const store: AppStore = newStore();

    loadObjects(store);
    selectFirst(store);
    renderSection(store);
    commitField(ROTATION_LABEL, text);

    expect(getObjectById(store, FIRST_ID)?.rotationDeg).toBe(expectedDeg);
  });

  it('commits on Enter and nothing for an unchanged value', () => {
    const store: AppStore = newStore();

    loadObjects(store);
    selectFirst(store);

    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderSection(store);

    const xInput: HTMLElement = screen.getByLabelText(X_LABEL);

    fireEvent.change(xInput, { target: { value: '0' } });
    fireEvent.blur(xInput);
    fireEvent.change(xInput, { target: { value: '12' } });
    fireEvent.keyDown(xInput, { key: ENTER_KEY });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(getObjectById(store, FIRST_ID)?.xMm).toBe(12);
  });

  it('commits nothing and keeps no draft when a fractional value is focused and left', () => {
    const store: AppStore = newStore();

    loadFractionalObjects(store);
    selectFirst(store);

    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderSection(store);
    focusAndLeaveField(X_LABEL);
    act(() => {
      store.dispatch(new ProjectSelectionChanged({ objectIds: [SECOND_ID] }));
    });

    expect(screen.getByLabelText(X_LABEL)).toHaveValue(SECOND_X_TEXT);

    focusAndLeaveField(X_LABEL);

    expect(getTransformDispatchCount(dispatchSpy)).toBe(0);
    expect(getObjectById(store, FIRST_ID)?.xMm).toBe(FRACTIONAL_X_MM);
    expect(getObjectById(store, SECOND_ID)?.xMm).toBe(SECOND_X_MM);
  });

  it('commits nothing and keeps no draft on Enter in an untouched fractional field', () => {
    const store: AppStore = newStore();

    loadFractionalObjects(store);
    selectFirst(store);

    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderSection(store);

    const xInput: HTMLElement = screen.getByLabelText(X_LABEL);

    fireEvent.focus(xInput);
    fireEvent.keyDown(xInput, { key: ENTER_KEY });
    fireEvent.blur(xInput);
    act(() => {
      store.dispatch(new ProjectSelectionChanged({ objectIds: [SECOND_ID] }));
    });
    focusAndLeaveField(X_LABEL);

    expect(getTransformDispatchCount(dispatchSpy)).toBe(0);
    expect(getObjectById(store, SECOND_ID)?.xMm).toBe(SECOND_X_MM);
  });

  it('shows the new value after the selected object is moved elsewhere', () => {
    const store: AppStore = newStore();

    loadFractionalObjects(store);
    selectFirst(store);
    renderSection(store);
    focusAndLeaveField(X_LABEL);
    act(() => {
      store.dispatch(new ProjectObjectsTransformed({
        transforms: {
          [FIRST_ID]: { xMm: MOVED_X_MM, yMm: 0, widthMm: SECOND_SIZE_MM, heightMm: SECOND_SIZE_MM, rotationDeg: 0 },
        },
      }));
    });

    expect(screen.getByLabelText(X_LABEL)).toHaveValue(MOVED_X_TEXT);
  });
});
