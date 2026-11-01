/**
 * Imports picked or dropped SVG files into the project: checks and sanitises each file, adds the accepted ones in
 * one step, selects them and tells the user what was skipped, cleaned or too big. Toast texts never contain parser
 * or error text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, put, select } from 'redux-saga/effects';
import { getBedDimensions } from '../bed/get.bed.dimensions';
import type { BedDimensions } from '../bed/interfaces/BedDimensions';
import { DEFAULT } from '../localization/default.locales';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { newProjectObject } from '../project/new.project.object';
import {
  IMPORT_PLACEMENT_CASCADE_LENGTH,
  IMPORT_PLACEMENT_OFFSET_MM,
  MAX_PROJECT_OBJECTS,
} from '../project/project.constants';
import { getFileNameWithoutExtension } from '../svg/get.file.name.without.extension';
import type { SanitizedSvg } from '../svg/interfaces/SanitizedSvg';
import type { SvgImportFailure } from '../svg/interfaces/SvgImportFailure';
import { isSvgImportFailure } from '../svg/is.svg.import.failure';
import { readSvgFile } from '../svg/read.svg.file';
import { selectGrblSettings, selectIsConnected } from './grbl.connection.state';
import type { AcceptedSvgFile } from './interfaces/AcceptedSvgFile';
import { selectActiveMachineProfile } from './machine.profile.state';
import { ProjectObjectsAdded, selectProjectObjects } from './project.document.state';
import type { SvgFilesImportRequested } from './project.document.state';
import { ProjectSelectionChanged } from './project.selection.state';
import { SVG_IMPORT_FAILURE_TOAST_KEY } from './svg.import.constants';
import { TOAST_SEVERITY } from './toast.constants';
import type { ToastSeverity } from './toast.constants';
import { ToastShown } from './toast.state';

const isLargerThanBed = (svg: SanitizedSvg, bed: BedDimensions): boolean =>
  svg.widthMm > bed.widthMm || svg.heightMm > bed.heightMm;

const newImportedObject = (acceptedFile: AcceptedSvgFile, placementIndex: number): ProjectObject => {
  const placementMm: number = (placementIndex % IMPORT_PLACEMENT_CASCADE_LENGTH) * IMPORT_PLACEMENT_OFFSET_MM;

  return newProjectObject({
    name: getFileNameWithoutExtension(acceptedFile.fileName),
    svgText: acceptedFile.svg.svgText,
    intrinsicWidthMm: acceptedFile.svg.widthMm,
    intrinsicHeightMm: acceptedFile.svg.heightMm,
    widthMm: acceptedFile.svg.widthMm,
    heightMm: acceptedFile.svg.heightMm,
    xMm: placementMm,
    yMm: placementMm,
  });
};

function* showToast(
  severity: ToastSeverity,
  messageKey: string,
  messageParameters: Record<string, string | number>,
): Generator {
  yield put(new ToastShown({ severity, messageKey, messageParameters }));
}

function* showToastsOfAcceptedFile(svg: SanitizedSvg, fileName: string, bed: BedDimensions): Generator {
  if (svg.removedContentKinds.length) {
    yield call(showToast, TOAST_SEVERITY.WARNING, DEFAULT.TOAST_SVG_CONTENT_REMOVED, { fileName });
  }

  if (isLargerThanBed(svg, bed)) {
    yield call(showToast, TOAST_SEVERITY.INFO, DEFAULT.TOAST_SVG_LARGER_THAN_BED, { fileName });
  }
}

function* getCurrentBed(): Generator<unknown, BedDimensions> {
  const settings: Record<number, string> = (yield select(selectGrblSettings)) as Record<number, string>;
  const isConnected: boolean = (yield select(selectIsConnected)) as boolean;
  const activeProfile: MachineProfile | undefined =
    (yield select(selectActiveMachineProfile)) as MachineProfile | undefined;

  return getBedDimensions(settings, isConnected, activeProfile);
}

function* addAcceptedFiles(acceptedFiles: AcceptedSvgFile[]): Generator<unknown, boolean> {
  // Read again after the awaited file reads: other imports, deletes or undo may have changed the count meanwhile.
  const existingObjects: ProjectObject[] = (yield select(selectProjectObjects)) as ProjectObject[];
  const roomCount: number = Math.max(MAX_PROJECT_OBJECTS - existingObjects.length, 0);
  const fittingFiles: AcceptedSvgFile[] = acceptedFiles.slice(0, roomCount);
  const importedObjects: ProjectObject[] = fittingFiles.map(
    (acceptedFile: AcceptedSvgFile, fileIndex: number): ProjectObject =>
      newImportedObject(acceptedFile, existingObjects.length + fileIndex),
  );

  if (importedObjects.length) {
    yield put(new ProjectObjectsAdded({ objects: importedObjects }));
    yield put(new ProjectSelectionChanged({
      objectIds: importedObjects.map((projectObject: ProjectObject): string => projectObject.id),
    }));
  }

  return fittingFiles.length < acceptedFiles.length;
}

/** Run by the project command queue, so it never overlaps a project switch and waits for the first project. */
export function* importSvgFiles(action: SvgFilesImportRequested): Generator {
  const existingObjects: ProjectObject[] = (yield select(selectProjectObjects)) as ProjectObject[];
  const bed: BedDimensions = (yield call(getCurrentBed)) as BedDimensions;
  const acceptedFiles: AcceptedSvgFile[] = [];
  let isLimitReached: boolean = false;

  for (const file of action.payload.files) {
    if (existingObjects.length + acceptedFiles.length >= MAX_PROJECT_OBJECTS) {
      isLimitReached = true;
      break;
    }

    const importResult: SanitizedSvg | SvgImportFailure =
      (yield call(readSvgFile, file)) as SanitizedSvg | SvgImportFailure;

    if (isSvgImportFailure(importResult)) {
      yield call(showToast, TOAST_SEVERITY.ERROR, SVG_IMPORT_FAILURE_TOAST_KEY[importResult.errorKind], {
        fileName: file.name,
      });

      continue;
    }

    acceptedFiles.push({ fileName: file.name, svg: importResult });
    yield call(showToastsOfAcceptedFile, importResult, file.name, bed);
  }

  const hasTrimmedFiles: boolean = (yield call(addAcceptedFiles, acceptedFiles)) as boolean;

  if (isLimitReached || hasTrimmedFiles) {
    yield call(showToast, TOAST_SEVERITY.ERROR, DEFAULT.TOAST_SVG_IMPORT_LIMIT_REACHED, {
      limit: MAX_PROJECT_OBJECTS,
    });
  }
}
