/**
 * Stores an edit made in an object's element tree: derives a layer for any new colour, then puts the new text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { call, put, select } from 'redux-saga/effects';
import type { BedDimensions } from '../bed/interfaces/BedDimensions';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT } from '../localization/default.locales';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { isObjectArtworkOutsideBed } from '../project/is.object.artwork.outside.bed';
import { getCurrentBed } from './get.current.bed.saga';
import {
  ProjectObjectSvgTextChanged,
  ProjectObjectSvgTextChangeRequested,
  selectProjectDocument,
} from './project.document.state';
import { deriveProjectLayers } from './project.layers.derive.saga';
import { TOAST_SEVERITY } from './toast.constants';
import { ToastShown } from './toast.state';

/** Warns when a tree edit leaves the object outside the bed; the object is never moved without the user asking. */
function* warnOfObjectOffBed(changedObject: ProjectObject): Generator {
  const bed: BedDimensions = (yield call(getCurrentBed)) as BedDimensions;

  if (!isObjectArtworkOutsideBed(changedObject, bed)) {
    return;
  }

  yield put(new ToastShown({
    severity: TOAST_SEVERITY.WARNING,
    messageKey: DEFAULT.TOAST_OBJECT_OFF_BED_AFTER_EDIT,
    messageParameters: { name: changedObject.name },
    moveOntoBedObjectId: changedObject.id,
  }));
}

/** Run by the project command queue, so it never lands in a document that a project switch is replacing. */
export function* changeProjectObjectSvgText(action: ProjectObjectSvgTextChangeRequested): Generator {
  const { objectId, svgText } = action.payload;
  const projectDocument: ProjectDocument = (yield select(selectProjectDocument)) as ProjectDocument;

  if (!projectDocument.objects.some((projectObject: ProjectObject): boolean => projectObject.id === objectId)) {
    return;
  }

  const changedObjects: ProjectObject[] = projectDocument.objects.map(
    (projectObject: ProjectObject): ProjectObject =>
      projectObject.id === objectId ? { ...projectObject, svgText } : projectObject,
  );
  const layers: ProjectLayer[] =
    (yield* deriveProjectLayers(changedObjects, projectDocument.layers)) as ProjectLayer[];

  yield put(new ProjectObjectSvgTextChanged({ objectId, svgText, layers }));

  const changedObject: ProjectObject | undefined =
    changedObjects.find((projectObject: ProjectObject): boolean => projectObject.id === objectId);

  if (changedObject) {
    yield call(warnOfObjectOffBed, changedObject);
  }
}
