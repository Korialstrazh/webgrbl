/**
 * Tests for the SVG import saga, run through newStore() with real File objects.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_BED_SIZE_MM } from '../bed/bed.constants';
import { DEFAULT } from '../localization/default.locales';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { newProjectObject } from '../project/new.project.object';
import { FREE_SPOT_GAP_MM, MAX_PROJECT_OBJECTS } from '../project/project.constants';
import { MAX_SVG_FILE_BYTES, SVG_MIME_TYPE } from '../svg/svg.constants';
import { selectBedSelectionFitRequestCount } from './bed.view.state';
import type { AppToast } from './interfaces/AppToast';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import {
  ProjectObjectsAdded,
  ProjectUndoRequested,
  SvgFilesImportRequested,
  selectProjectObjects,
} from './project.document.state';
import { selectSelectedObjectIds } from './project.selection.state';
import { importSvgFiles } from './svg.import.saga';
import { TOAST_SEVERITY } from './toast.constants';
import { selectToasts } from './toast.state';

const SQUARE_SIZE_MM = 20;
const HALF_SQUARE_SIZE_MM = SQUARE_SIZE_MM / 2;
const OVERSIZED_SIZE_MM = DEFAULT_BED_SIZE_MM + 100;
const FIRST_FILE_NAME = 'first.svg';
const SECOND_FILE_NAME = 'second.svg';
const BROKEN_FILE_NAME = 'broken.svg';
const HUGE_FILE_NAME = 'huge.svg';
const FOREIGN_FILE_NAME = 'foreign.svg';
const BIG_FILE_NAME = 'big.svg';
const BIG_FILE_STEM = 'big';
const NO_SIZE_FILE_NAME = 'nosize.svg';
const THIRD_FILE_NAME = 'third.svg';
const PRELOADED_OBJECT_COUNT = MAX_PROJECT_OBJECTS - 1;

const newSvgText = (sizeMm: number, innerMarkup: string = ''): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${sizeMm}mm" height="${sizeMm}mm">${innerMarkup}</svg>`;

const newViewBoxSvgText = (sizeMm: number, innerMarkup: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${sizeMm}mm" height="${sizeMm}mm" viewBox="0 0 ${sizeMm} ${sizeMm}">${innerMarkup}</svg>`;

const newSvgFile = (fileName: string, svgText: string = newSvgText(SQUARE_SIZE_MM)): File =>
  new File([svgText], fileName, { type: SVG_MIME_TYPE });

const requestImport = (store: AppStore, files: File[]): void => {
  store.dispatch(new SvgFilesImportRequested({ files }));
};

const waitForObjectCount = async (store: AppStore, objectCount: number): Promise<void> => {
  await vi.waitFor((): void => {
    expect(selectProjectObjects(store.getState())).toHaveLength(objectCount);
  });
};

const waitForToast = async (store: AppStore, messageKey: string): Promise<void> => {
  await vi.waitFor((): void => {
    expect(getToastsOf(store, messageKey)).toHaveLength(1);
  });
};

const getToastsOf = (store: AppStore, messageKey: string): AppToast[] =>
  selectToasts(store.getState()).filter((toast: AppToast): boolean => toast.messageKey === messageKey);

describe(importSvgFiles.name, () => {
  it('adds two valid files side by side without overlap, selects both and records one undo step', async () => {
    const store: AppStore = newStore();

    requestImport(store, [newSvgFile(FIRST_FILE_NAME), newSvgFile(SECOND_FILE_NAME)]);
    await waitForObjectCount(store, 2);
    const importedObjects: ProjectObject[] = selectProjectObjects(store.getState());

    expect(importedObjects.map((projectObject: ProjectObject) => projectObject.name)).toEqual(['first', 'second']);
    expect(importedObjects.map((projectObject: ProjectObject) => [projectObject.xMm, projectObject.yMm])).toEqual([
      [0, 0],
      [SQUARE_SIZE_MM + FREE_SPOT_GAP_MM, 0],
    ]);
    expect(importedObjects[0]).toMatchObject({
      widthMm: SQUARE_SIZE_MM,
      heightMm: SQUARE_SIZE_MM,
      intrinsicWidthMm: SQUARE_SIZE_MM,
      intrinsicHeightMm: SQUARE_SIZE_MM,
      rotationDeg: 0,
    });
    expect(selectSelectedObjectIds(store.getState())).toEqual(
      importedObjects.map((projectObject: ProjectObject) => projectObject.id),
    );

    store.dispatch(new ProjectUndoRequested());

    expect(selectProjectObjects(store.getState())).toEqual([]);
  });

  it('gives the same file imported twice different ids and two undo steps', async () => {
    const store: AppStore = newStore();

    requestImport(store, [newSvgFile(FIRST_FILE_NAME)]);
    await waitForObjectCount(store, 1);
    requestImport(store, [newSvgFile(FIRST_FILE_NAME)]);
    await waitForObjectCount(store, 2);
    const importedObjects: ProjectObject[] = selectProjectObjects(store.getState());

    expect(importedObjects.map((projectObject: ProjectObject) => [projectObject.xMm, projectObject.yMm])).toEqual([
      [0, 0],
      [SQUARE_SIZE_MM + FREE_SPOT_GAP_MM, 0],
    ]);
    expect(importedObjects[0]?.id).not.toBe(importedObjects[1]?.id);

    store.dispatch(new ProjectUndoRequested());

    expect(selectProjectObjects(store.getState())).toHaveLength(1);

    store.dispatch(new ProjectUndoRequested());

    expect(selectProjectObjects(store.getState())).toHaveLength(0);
  });

  it('imports the valid files and names the invalid one in an error toast', async () => {
    const store: AppStore = newStore();
    const brokenFile: File = newSvgFile(BROKEN_FILE_NAME, '<not-svg>');

    requestImport(store, [newSvgFile(FIRST_FILE_NAME), brokenFile, newSvgFile(SECOND_FILE_NAME)]);
    await waitForObjectCount(store, 2);
    await waitForToast(store, DEFAULT.TOAST_SVG_IMPORT_FAILED_NOT_SVG);
    const failureToasts: AppToast[] = getToastsOf(store, DEFAULT.TOAST_SVG_IMPORT_FAILED_NOT_SVG);

    expect(selectProjectObjects(store.getState())).toHaveLength(2);
    expect(failureToasts).toHaveLength(1);
    expect(failureToasts[0]).toMatchObject({
      severity: TOAST_SEVERITY.ERROR,
      messageParameters: { fileName: BROKEN_FILE_NAME },
    });
  });

  it('reports a file without a size with its own reason', async () => {
    const store: AppStore = newStore();

    requestImport(store, [newSvgFile(NO_SIZE_FILE_NAME, '<svg xmlns="http://www.w3.org/2000/svg"></svg>')]);
    await waitForToast(store, DEFAULT.TOAST_SVG_IMPORT_FAILED_NO_SIZE);

    expect(selectProjectObjects(store.getState())).toHaveLength(0);
  });

  it('rejects a file over the byte limit without changing the project or selection', async () => {
    const store: AppStore = newStore();
    const hugeFile: File = newSvgFile(HUGE_FILE_NAME, 'x'.repeat(MAX_SVG_FILE_BYTES + 1));

    requestImport(store, [hugeFile]);
    await waitForToast(store, DEFAULT.TOAST_SVG_IMPORT_FAILED_TOO_LARGE);

    expect(selectProjectObjects(store.getState())).toEqual([]);
    expect(selectSelectedObjectIds(store.getState())).toEqual([]);
    expect(getToastsOf(store, DEFAULT.TOAST_SVG_IMPORT_FAILED_TOO_LARGE)[0]?.messageParameters).toEqual({
      fileName: HUGE_FILE_NAME,
    });
  });

  it('imports a file with a foreignObject and warns that content was removed', async () => {
    const store: AppStore = newStore();
    const foreignFile: File = newSvgFile(
      FOREIGN_FILE_NAME,
      newSvgText(SQUARE_SIZE_MM, '<foreignObject><p xmlns="http://www.w3.org/1999/xhtml">hi</p></foreignObject>'),
    );

    requestImport(store, [foreignFile]);
    await waitForObjectCount(store, 1);
    await waitForToast(store, DEFAULT.TOAST_SVG_CONTENT_REMOVED);
    const removedToasts: AppToast[] = getToastsOf(store, DEFAULT.TOAST_SVG_CONTENT_REMOVED);

    expect(selectProjectObjects(store.getState())).toHaveLength(1);
    expect(removedToasts).toHaveLength(1);
    expect(removedToasts[0]).toMatchObject({
      severity: TOAST_SEVERITY.WARNING,
      messageParameters: { fileName: FOREIGN_FILE_NAME },
    });
  });

  it('places an svg larger than the bed at the origin, zooms to it and offers Fit to bed', async () => {
    const store: AppStore = newStore();

    requestImport(store, [newSvgFile(BIG_FILE_NAME, newSvgText(OVERSIZED_SIZE_MM))]);
    await waitForObjectCount(store, 1);
    await waitForToast(store, DEFAULT.TOAST_SVG_LARGER_THAN_BED);
    const bedToasts: AppToast[] = getToastsOf(store, DEFAULT.TOAST_SVG_LARGER_THAN_BED);
    const bigObject: ProjectObject | undefined = selectProjectObjects(store.getState())[0];

    expect(bedToasts).toHaveLength(1);
    expect(bedToasts[0]).toMatchObject({
      severity: TOAST_SEVERITY.WARNING,
      messageParameters: { fileName: BIG_FILE_STEM },
      fitToBedObjectId: bigObject?.id,
    });
    expect([bigObject?.xMm, bigObject?.yMm]).toEqual([0, 0]);
    expect(selectBedSelectionFitRequestCount(store.getState())).toBe(1);
  });

  it('places by the drawn geometry, so lines outside the page never start off the bed', async () => {
    const store: AppStore = newStore();
    const outsideMarkup: string =
      `<rect x="-${HALF_SQUARE_SIZE_MM}" y="0" width="${SQUARE_SIZE_MM}" height="${SQUARE_SIZE_MM}"/>`;

    requestImport(store, [newSvgFile(BIG_FILE_NAME, newViewBoxSvgText(SQUARE_SIZE_MM, outsideMarkup))]);
    await waitForObjectCount(store, 1);
    const placedObject: ProjectObject | undefined = selectProjectObjects(store.getState())[0];

    expect([placedObject?.xMm, placedObject?.yMm]).toEqual([HALF_SQUARE_SIZE_MM, 0]);
    expect(getToastsOf(store, DEFAULT.TOAST_SVG_LARGER_THAN_BED)).toHaveLength(0);
  });

  it('adds only the files that fit under the object limit and shows one error toast', async () => {
    const store: AppStore = newStore();
    const preloadedObjects: ProjectObject[] = Array.from(
      { length: PRELOADED_OBJECT_COUNT },
      (): ProjectObject => newProjectObject(),
    );

    store.dispatch(new ProjectObjectsAdded({ objects: preloadedObjects, layers: [] }));
    requestImport(store, [
      newSvgFile(FIRST_FILE_NAME),
      newSvgFile(SECOND_FILE_NAME),
      newSvgFile(THIRD_FILE_NAME),
    ]);
    await waitForToast(store, DEFAULT.TOAST_SVG_IMPORT_LIMIT_REACHED);
    const limitToasts: AppToast[] = getToastsOf(store, DEFAULT.TOAST_SVG_IMPORT_LIMIT_REACHED);

    expect(selectProjectObjects(store.getState())).toHaveLength(MAX_PROJECT_OBJECTS);
    expect(limitToasts).toHaveLength(1);
    expect(limitToasts[0]).toMatchObject({
      severity: TOAST_SEVERITY.ERROR,
      messageParameters: { limit: MAX_PROJECT_OBJECTS },
    });
  });

  it('keeps the object limit when two imports run at the same time', async () => {
    const store: AppStore = newStore();
    const preloadedObjects: ProjectObject[] = Array.from(
      { length: PRELOADED_OBJECT_COUNT },
      (): ProjectObject => newProjectObject(),
    );

    store.dispatch(new ProjectObjectsAdded({ objects: preloadedObjects, layers: [] }));
    requestImport(store, [newSvgFile(FIRST_FILE_NAME)]);
    requestImport(store, [newSvgFile(SECOND_FILE_NAME)]);
    await waitForToast(store, DEFAULT.TOAST_SVG_IMPORT_LIMIT_REACHED);

    expect(selectProjectObjects(store.getState())).toHaveLength(MAX_PROJECT_OBJECTS);
  });
});
