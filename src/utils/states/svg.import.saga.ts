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
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT } from '../localization/default.locales';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { getFreeBedSpot } from '../project/get.free.bed.spot';
import { getObjectArtworkBedBounds } from '../project/get.object.artwork.bed.bounds';
import type { ObjectArtworkBedBounds } from '../project/interfaces/ObjectArtworkBedBounds';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { newProjectObject } from '../project/new.project.object';
import {
  BED_EDGE_EPSILON_MM,
  IMPORT_PLACEMENT_CASCADE_LENGTH,
  IMPORT_PLACEMENT_OFFSET_MM,
  MAX_PROJECT_OBJECTS,
} from '../project/project.constants';
import { getFileNameWithoutExtension } from '../svg/get.file.name.without.extension';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { SanitizedSvg } from '../svg/interfaces/SanitizedSvg';
import type { SvgImportFailure } from '../svg/interfaces/SvgImportFailure';
import { isSvgImportFailure } from '../svg/is.svg.import.failure';
import { readSvgFile } from '../svg/read.svg.file';
import { BedSelectionFitRequested } from './bed.view.state';
import { selectGrblSettings, selectIsConnected } from './grbl.connection.state';
import type { AcceptedSvgFile } from './interfaces/AcceptedSvgFile';
import { selectActiveMachineProfile } from './machine.profile.state';
import { ProjectObjectsAdded, selectProjectDocument, selectProjectObjects } from './project.document.state';
import type { SvgFilesImportRequested } from './project.document.state';
import { deriveProjectLayers } from './project.layers.derive.saga';
import { ProjectSelectionChanged } from './project.selection.state';
import { SVG_IMPORT_FAILURE_TOAST_KEY } from './svg.import.constants';
import { TOAST_SEVERITY } from './toast.constants';
import type { ToastSeverity } from './toast.constants';
import { ToastShown } from './toast.state';

const newImportedObject = (acceptedFile: AcceptedSvgFile, placement: GeometryPoint): ProjectObject => {
  return newProjectObject({
    name: getFileNameWithoutExtension(acceptedFile.fileName),
    svgText: acceptedFile.svg.svgText,
    intrinsicWidthMm: acceptedFile.svg.widthMm,
    intrinsicHeightMm: acceptedFile.svg.heightMm,
    widthMm: acceptedFile.svg.widthMm,
    heightMm: acceptedFile.svg.heightMm,
    xMm: placement.x,
    yMm: placement.y,
    importedAt: new Date().toISOString(),
  });
};

const BED_ORIGIN_SPOT: GeometryPoint = { x: 0, y: 0 };

/** One placed import and whether its drawing is larger than the bed. */
interface ImportedObjectPlacement {
  /** The new object, placed on the bed. */
  importedObject: ProjectObject;
  /** Whether its drawing is wider or taller than the bed. */
  isLargerThanBed: boolean;
}

const isArtworkLargerThanBed = (bounds: ObjectArtworkBedBounds, bed: BedDimensions): boolean =>
  bounds.maxXMm - bounds.minXMm > bed.widthMm + BED_EDGE_EPSILON_MM
  || bounds.maxYMm - bounds.minYMm > bed.heightMm + BED_EDGE_EPSILON_MM;

/**
 * Where the drawing's front-left corner goes: the first free spot on the bed, the corner cascade when nothing is
 * free, or the bed origin when the drawing is larger than the bed, so it never starts off the bed.
 */
const getImportArtworkSpot = (
  bounds: ObjectArtworkBedBounds,
  placementIndex: number,
  objectsOnBed: readonly ProjectObject[],
  bed: BedDimensions,
): GeometryPoint => {
  if (isArtworkLargerThanBed(bounds, bed)) {
    return BED_ORIGIN_SPOT;
  }

  const cascadeMm: number = (placementIndex % IMPORT_PLACEMENT_CASCADE_LENGTH) * IMPORT_PLACEMENT_OFFSET_MM;

  return getFreeBedSpot({
    widthMm: bounds.maxXMm - bounds.minXMm,
    heightMm: bounds.maxYMm - bounds.minYMm,
    startSpot: BED_ORIGIN_SPOT,
    existingObjects: objectsOnBed,
    bedWidthMm: bed.widthMm,
    bedHeightMm: bed.heightMm,
  }) ?? { x: cascadeMm, y: cascadeMm };
};

/** Places by the drawn geometry, not the page box: a page may hold empty margins or lines outside itself. */
const getImportedObjectPlacement = (
  acceptedFile: AcceptedSvgFile,
  placementIndex: number,
  objectsOnBed: readonly ProjectObject[],
  bed: BedDimensions,
): ImportedObjectPlacement => {
  const objectAtOrigin: ProjectObject = newImportedObject(acceptedFile, BED_ORIGIN_SPOT);
  const bounds: ObjectArtworkBedBounds = getObjectArtworkBedBounds(objectAtOrigin);
  const artworkSpot: GeometryPoint = getImportArtworkSpot(bounds, placementIndex, objectsOnBed, bed);

  return {
    importedObject: { ...objectAtOrigin, xMm: artworkSpot.x - bounds.minXMm, yMm: artworkSpot.y - bounds.minYMm },
    isLargerThanBed: isArtworkLargerThanBed(bounds, bed),
  };
};

function* showToast(
  severity: ToastSeverity,
  messageKey: string,
  messageParameters: Record<string, string | number>,
): Generator {
  yield put(new ToastShown({ severity, messageKey, messageParameters }));
}

function* showToastsOfAcceptedFile(svg: SanitizedSvg, fileName: string): Generator {
  if (svg.removedContentKinds.length) {
    yield call(showToast, TOAST_SEVERITY.WARNING, DEFAULT.TOAST_SVG_CONTENT_REMOVED, { fileName });
  }
}

/** Shows the whole oversized import and offers to scale it onto the bed. */
function* showOversizedImports(oversizedObjects: ProjectObject[]): Generator {
  if (!oversizedObjects.length) {
    return;
  }

  yield put(new BedSelectionFitRequested());

  for (const oversizedObject of oversizedObjects) {
    yield put(new ToastShown({
      severity: TOAST_SEVERITY.INFO,
      messageKey: DEFAULT.TOAST_SVG_LARGER_THAN_BED,
      messageParameters: { fileName: oversizedObject.name },
      fitToBedObjectId: oversizedObject.id,
    }));
  }
}

function* getCurrentBed(): Generator<unknown, BedDimensions> {
  const settings: Record<number, string> = (yield select(selectGrblSettings)) as Record<number, string>;
  const isConnected: boolean = (yield select(selectIsConnected)) as boolean;
  const activeProfile: MachineProfile | undefined =
    (yield select(selectActiveMachineProfile)) as MachineProfile | undefined;

  return getBedDimensions(settings, isConnected, activeProfile);
}

function* addAcceptedFiles(acceptedFiles: AcceptedSvgFile[], bed: BedDimensions): Generator<unknown, boolean> {
  // Read again after the awaited file reads: other imports, deletes or undo may have changed the count meanwhile.
  const projectDocument: ProjectDocument = (yield select(selectProjectDocument)) as ProjectDocument;
  const existingObjects: ProjectObject[] = projectDocument.objects;
  const roomCount: number = Math.max(MAX_PROJECT_OBJECTS - existingObjects.length, 0);
  const fittingFiles: AcceptedSvgFile[] = acceptedFiles.slice(0, roomCount);
  const importedObjects: ProjectObject[] = [];
  const oversizedObjects: ProjectObject[] = [];

  for (const acceptedFile of fittingFiles) {
    const { importedObject, isLargerThanBed }: ImportedObjectPlacement = getImportedObjectPlacement(
      acceptedFile,
      existingObjects.length + importedObjects.length,
      [...existingObjects, ...importedObjects],
      bed,
    );

    importedObjects.push(importedObject);

    if (isLargerThanBed) {
      oversizedObjects.push(importedObject);
    }
  }

  if (importedObjects.length) {
    const derivedLayers: ProjectLayer[] = (yield call(
      deriveProjectLayers,
      [...existingObjects, ...importedObjects],
      projectDocument.layers,
    )) as ProjectLayer[];

    yield put(new ProjectObjectsAdded({ objects: importedObjects, layers: derivedLayers }));
    yield put(new ProjectSelectionChanged({
      objectIds: importedObjects.map((projectObject: ProjectObject): string => projectObject.id),
    }));
    yield call(showOversizedImports, oversizedObjects);
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
    yield call(showToastsOfAcceptedFile, importResult, file.name);
  }

  const hasTrimmedFiles: boolean = (yield call(addAcceptedFiles, acceptedFiles, bed)) as boolean;

  if (isLimitReached || hasTrimmedFiles) {
    yield call(showToast, TOAST_SEVERITY.ERROR, DEFAULT.TOAST_SVG_IMPORT_LIMIT_REACHED, {
      limit: MAX_PROJECT_OBJECTS,
    });
  }
}
