/**
 * Stores an edit made in an object's element tree: derives a layer for any new colour, then puts the new text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { put, select } from 'redux-saga/effects';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import {
  ProjectObjectSvgTextChanged,
  ProjectObjectSvgTextChangeRequested,
  selectProjectDocument,
} from './project.document.state';
import { deriveProjectLayers } from './project.layers.derive.saga';

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
}
