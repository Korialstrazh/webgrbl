import { fireEvent, render, screen, within } from '@testing-library/react';
import { act } from 'react';
import type { ReactNode } from 'react';
import { Provider, useSelector } from 'react-redux';
import type { MockInstance } from 'vitest';
import { ObjectsSection } from '.';
import { ENTER_KEY } from '../../utils/browser/browser.events.constants';
import { getSampleJobObject } from '../../utils/materials/get.sample.job.object';
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
import { newToolpathMachineArea } from '../../utils/toolpath/test.support/new.toolpath.machine.area';
import { OBJECT_KIND } from './objects.section.constants';
import { BedEmptyCard } from '../BedEmptyCard';
import { JobReadinessRow } from '../MachinePanel/JobCard/JobReadinessRow';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../../utils/profiles/new.machine.profile';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../../utils/states/machine.profile.state';
import {
  installMatchMediaMock,
  resetMatchMediaMock,
  setMatchMediaMatches,
} from '../../utils/test.support/match.media.mock';

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
const MOVE_ONTO_BED_LABEL = 'Move onto bed';
const FIT_TO_BED_LABEL = 'Fit to bed';
const WARNING_CHIP_NAME = /^Problems with /;
const FIRST_SIZE_TEXT = `100 ${MULTIPLICATION_SIGN} 50.0 mm`;
const SECOND_SIZE_TEXT = `20.0 ${MULTIPLICATION_SIGN} 20.0 mm`;
const SECOND_SIZE_MM = 20;
const OBJECTS_LIST_NAME = 'Project objects';
const IMPORT_LABEL = 'Import SVG';
const EMPTY_HINT_PATTERN = /Nothing on the bed yet/;
const SECOND_ROW_NAME_PATTERN = /^Moon/;
const PRESSED_ATTRIBUTE = 'aria-pressed';
const TRUE_TEXT = 'true';
const FRACTIONAL_X_MM = 12.3456;
const TEXT_WARNING = 'Text is not converted to paths. In Inkscape use Path > Object to Path.';
const TEXT_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm" viewBox="0 0 10 10">'
  + '<rect fill="none" stroke="#ff0000" width="10" height="10"/><text x="1" y="5">Hi</text></svg>';
const MARGIN_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="120mm" height="80mm" viewBox="0 0 120 80">'
  + '<rect x="5" y="5" width="110" height="70" fill="none" stroke="#ff0000"/></svg>';
const MARGIN_PAGE_WIDTH_MM = 120;
const MARGIN_PAGE_HEIGHT_MM = 80;
const MARGIN_ARTWORK_SIZE_TEXT = `110 ${MULTIPLICATION_SIGN} 70.0 mm`;
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
        layers: [],
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
        layers: [],
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

/** The section beside the empty bed card, as the workbench shows them in the Design view. */
const SectionWithEmptyBedCard = (): ReactNode => {
  const hasNoObjects: boolean = !useSelector(selectProjectObjects).length;

  return (
    <>
      <ObjectsSection />
      {hasNoObjects && <BedEmptyCard />}
    </>
  );
};

describe(ObjectsSection.name, () => {
  it('shows a hint and no import button when there are no objects', () => {
    renderSection(newStore());

    expect(screen.getByText(EMPTY_HINT_PATTERN)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: IMPORT_LABEL })).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('marks each row with the icon of its kind, imported drawing or test sample', () => {
    const store: AppStore = newStore();

    act(() => {
      store.dispatch(new ProjectDocumentLoaded({
        document: {
          objects: [newProjectObject({ id: FIRST_ID, name: FIRST_NAME }), getSampleJobObject(newToolpathMachineArea())],
          layers: [],
        },
      }));
    });
    renderSection(store);

    const rows: HTMLElement[] = within(screen.getByRole('list', { name: OBJECTS_LIST_NAME })).getAllByRole('listitem');
    const rowKinds: (string | null)[] = rows.map(
      (row: HTMLElement) => row.querySelector('[data-object-kind]')?.getAttribute('data-object-kind') ?? null,
    );

    expect(rowKinds).toEqual([OBJECT_KIND.SVG, OBJECT_KIND.SAMPLE]);
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

  it('shows the size of the drawing, not of its page, and turns a typed width back into the page width', () => {
    const store: AppStore = newStore();

    act(() => {
      store.dispatch(new ProjectDocumentLoaded({
        document: {
          objects: [newProjectObject({
            id: FIRST_ID,
            name: FIRST_NAME,
            svgText: MARGIN_SVG_TEXT,
            intrinsicWidthMm: MARGIN_PAGE_WIDTH_MM,
            intrinsicHeightMm: MARGIN_PAGE_HEIGHT_MM,
            widthMm: MARGIN_PAGE_WIDTH_MM,
            heightMm: MARGIN_PAGE_HEIGHT_MM,
          })],
          layers: [],
        },
      }));
    });
    selectFirst(store);
    renderSection(store);

    expect(screen.getByText(MARGIN_ARTWORK_SIZE_TEXT)).toBeInTheDocument();

    commitField(WIDTH_LABEL, '55');

    expect(getObjectById(store, FIRST_ID)?.widthMm).toBeCloseTo(MARGIN_PAGE_WIDTH_MM / 2);
  });

  it('puts the fields of the selected object above the list, so a long list never pushes them out of view', () => {
    const store: AppStore = newStore();

    loadObjects(store);
    selectFirst(store);
    renderSection(store);

    const list: HTMLElement = screen.getByRole('list', { name: OBJECTS_LIST_NAME });
    const xField: HTMLElement = screen.getByLabelText(X_LABEL);

    expect(xField.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('scrolls an opened element tree into view, just as far as needed', () => {
    const store: AppStore = newStore();
    const scrollSpy: MockInstance<Element['scrollIntoView']> = vi.spyOn(Element.prototype, 'scrollIntoView');

    loadObjects(store);
    renderSection(store);
    scrollSpy.mockClear();
    fireEvent.click(screen.getByRole('button', { name: `Show the layers and shapes of ${FIRST_NAME}` }));

    const hideTreeName: string = `Hide the layers and shapes of ${FIRST_NAME}`;
    const openedRow: Element | null = screen.getByRole('button', { name: hideTreeName }).closest('li');

    expect(scrollSpy.mock.contexts).toContain(openedRow);
    expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest' });
  });

  it('scrolls the fields and the row of a new selection into view', () => {
    const store: AppStore = newStore();
    const scrollSpy: MockInstance<Element['scrollIntoView']> = vi.spyOn(Element.prototype, 'scrollIntoView');

    loadObjects(store);
    renderSection(store);
    fireEvent.click(screen.getByRole('button', { name: SECOND_ROW_NAME_PATTERN }));

    const revealedElements: unknown[] = scrollSpy.mock.contexts;
    const secondRow: Element | null = screen.getByRole('button', { name: SECOND_ROW_NAME_PATTERN })
      .closest('[data-object-id]');
    const xField: HTMLElement = screen.getByLabelText(X_LABEL);

    expect(revealedElements).toContain(secondRow);
    expect(revealedElements.some((element: unknown) => element instanceof Element && element.contains(xField)))
      .toBe(true);
    scrollSpy.mockRestore();
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

  it('moves focus to Import SVG on the empty bed card after the last object is deleted', () => {
    const store: AppStore = newStore();

    act(() => {
      store.dispatch(new ProjectDocumentLoaded({
        document: { objects: [newProjectObject({ id: FIRST_ID, name: FIRST_NAME })], layers: [] },
      }));
    });
    render(
      <Provider store={store}>
        <AntdTestProvider>
          <SectionWithEmptyBedCard />
        </AntdTestProvider>
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: `Delete ${FIRST_NAME}` }));

    expect(screen.getByRole('button', { name: IMPORT_LABEL })).toHaveFocus();
  });

  it('moves focus to the Job card Import SVG next step after the last delete in a wide layout', () => {
    const store: AppStore = newStore();
    const profile: MachineProfile = newMachineProfile();

    installMatchMediaMock();
    setMatchMediaMatches(true);
    act(() => {
      store.dispatch(new MachineProfileSaved({ profile }));
      store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
      store.dispatch(new ProjectDocumentLoaded({
        document: { objects: [newProjectObject({ id: FIRST_ID, name: FIRST_NAME })], layers: [] },
      }));
    });
    render(
      <Provider store={store}>
        <AntdTestProvider>
          <SectionWithEmptyBedCard />
          <JobReadinessRow />
        </AntdTestProvider>
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: `Delete ${FIRST_NAME}` }));

    expect(screen.getAllByRole('button', { name: IMPORT_LABEL })).toHaveLength(1);
    expect(screen.getByRole('button', { name: IMPORT_LABEL })).toHaveFocus();
    resetMatchMediaMock();
  });

  it('moves focus to the next row after a delete, and to the empty hint without an empty bed card', () => {
    const store: AppStore = newStore();
    loadObjects(store);
    renderSection(store);

    fireEvent.click(screen.getByRole('button', { name: `Delete ${FIRST_NAME}` }));

    expect(screen.getByRole('button', { name: SECOND_ROW_NAME_PATTERN })).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: `Delete ${SECOND_NAME}` }));

    expect(screen.getByText(EMPTY_HINT_PATTERN).parentElement).toHaveFocus();
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

    expect(screen.getAllByRole('button', { name: WARNING_CHIP_NAME })).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: WARNING_CHIP_NAME }));
    expect(screen.getAllByText(OUTSIDE_NOTE)).toHaveLength(1);
  });

  it('moves an object outside the bed back onto it in one click, as one undo step', () => {
    const store: AppStore = newStore();

    loadObjects(store);
    act(() => {
      store.dispatch(new ProjectObjectsTransformed({
        transforms: {
          [SECOND_ID]: {
            xMm: -SECOND_SIZE_MM,
            yMm: 0,
            widthMm: SECOND_SIZE_MM,
            heightMm: SECOND_SIZE_MM,
            rotationDeg: 0,
          },
        },
      }));
    });
    renderSection(store);

    fireEvent.click(screen.getByRole('button', { name: WARNING_CHIP_NAME }));
    fireEvent.click(screen.getByRole('button', { name: MOVE_ONTO_BED_LABEL }));

    expect(selectProjectObjects(store.getState()).at(1)).toMatchObject({ xMm: 0, widthMm: SECOND_SIZE_MM });

    act(() => {
      store.dispatch(new ProjectUndoRequested());
    });

    expect(selectProjectObjects(store.getState()).at(1)).toMatchObject({ xMm: -SECOND_SIZE_MM });
  });

  it('turns Move onto bed off for an object larger than the bed and fits it with Fit to bed', () => {
    const store: AppStore = newStore();

    loadObjects(store);
    act(() => {
      store.dispatch(new ProjectObjectsTransformed({
        transforms: {
          [SECOND_ID]: { xMm: 0, yMm: 0, widthMm: BED_OVERFLOW_X_MM, heightMm: BED_OVERFLOW_X_MM, rotationDeg: 0 },
        },
      }));
    });
    renderSection(store);

    fireEvent.click(screen.getByRole('button', { name: WARNING_CHIP_NAME }));

    expect(screen.getByRole('button', { name: MOVE_ONTO_BED_LABEL })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: FIT_TO_BED_LABEL }));

    expect(selectProjectObjects(store.getState()).at(1)?.widthMm).toBeLessThan(BED_OVERFLOW_X_MM);
    expect(screen.queryByRole('button', { name: WARNING_CHIP_NAME })).not.toBeInTheDocument();
  });

  it('shows a warning chip on an object whose SVG holds text, with the text in its popover', () => {
    const store: AppStore = newStore();

    act(() => {
      store.dispatch(new ProjectDocumentLoaded({
        document: {
          objects: [
            newProjectObject({ id: FIRST_ID, name: FIRST_NAME, svgText: TEXT_SVG_TEXT }),
            newProjectObject({ id: SECOND_ID, name: SECOND_NAME }),
          ],
          layers: [],
        },
      }));
    });
    renderSection(store);

    const warningChip: HTMLElement = screen.getByRole('button', { name: WARNING_CHIP_NAME });

    expect(warningChip).toHaveAccessibleName(new RegExp(FIRST_NAME));
    fireEvent.click(warningChip);
    expect(screen.getByText(TEXT_WARNING)).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole('button', { name: LOCK_LABEL }));
    commitField(WIDTH_LABEL, NEW_WIDTH_TEXT);

    expect(getObjectById(store, FIRST_ID)).toMatchObject({ widthMm: NEW_WIDTH_MM, heightMm: WIDE_HEIGHT_MM });
  });

  it('starts with the ratio lock on', () => {
    const store: AppStore = newStore();

    loadObjects(store);
    selectFirst(store);
    renderSection(store);

    expect(screen.getByRole('button', { name: LOCK_LABEL })).toHaveAttribute('aria-pressed', 'true');
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
