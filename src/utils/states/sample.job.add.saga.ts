/**
 * Adds the test sample to the open project as a normal object: selected, one undo step, on layers found by colour.
 * Nothing that is already in the project changes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { put, select } from 'redux-saga/effects';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { fitsSampleJob } from '../materials/fits.sample.job';
import { getSampleJobLayers } from '../materials/get.sample.job.layers';
import { getSampleJobObject } from '../materials/get.sample.job.object';
import type { Palette } from '../palette/interfaces/Palette';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { MAX_PROJECT_OBJECTS } from '../project/project.constants';
import type { ToolpathMachineArea } from '../toolpath/interfaces/ToolpathMachineArea';
import { selectPalette } from './palette.state';
import { ProjectObjectsAdded, selectProjectDocument } from './project.document.state';
import { ProjectSelectionChanged } from './project.selection.state';
import { selectToolpathMachineArea } from './toolpath.machine.area.selector';

/** Run by the project command queue, so it never lands in a document that a project switch is replacing. */
export function* addSampleJob(): Generator {
  const machineArea: ToolpathMachineArea = (yield select(selectToolpathMachineArea)) as ToolpathMachineArea;
  const projectDocument: ProjectDocument = (yield select(selectProjectDocument)) as ProjectDocument;

  // The button is off in these cases; the queue may have run other commands since the press.
  if (!fitsSampleJob(machineArea) || projectDocument.objects.length >= MAX_PROJECT_OBJECTS) {
    return;
  }

  const palette: Palette = (yield select(selectPalette)) as Palette;
  const sampleObject: ProjectObject = getSampleJobObject(machineArea);
  const layers: ProjectLayer[] = getSampleJobLayers(
    [...projectDocument.objects, sampleObject],
    palette,
    projectDocument.layers,
  );

  yield put(new ProjectObjectsAdded({ objects: [sampleObject], layers }));
  yield put(new ProjectSelectionChanged({ objectIds: [sampleObject.id] }));
}
