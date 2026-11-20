/**
 * Picks the toolpath a job start request runs.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { select } from 'redux-saga/effects';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { getRecutToolpath } from '../toolpath/get.recut.toolpath';
import { getResumeToolpath } from '../toolpath/get.resume.toolpath';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import { getLinePassesByLayerKey } from './get.line.passes.by.layer.key';
import { getResumeMoveIndex } from './get.resume.move.index';
import type { JobResumeState } from './interfaces/JobResumeState';
import type { JobStartRequest } from './interfaces/JobStartRequest';
import { selectJobResume } from './job.resume.state';
import { JOB_START_REQUEST_KIND } from './job.start.request.constants';
import { selectEnabledProjectLayers } from './project.document.state';
import { selectToolpath } from './toolpath.state';

/**
 * The toolpath a start request runs: the whole job, for a re-cut only its ticked line layers, and for a resume the
 * toolpath that ran, from the backed-up move on.
 */
export function* getJobRunToolpath(request: JobStartRequest): Generator {
  if (request.kind === JOB_START_REQUEST_KIND.RESUME) {
    const resume: JobResumeState | undefined = (yield select(selectJobResume)) as JobResumeState | undefined;

    // A run that sent no move leaves nothing to slice.
    return resume?.toolpath.moves.length ? getResumeToolpath(resume.toolpath, getResumeMoveIndex(resume)) : undefined;
  }

  const toolpath: Toolpath = (yield select(selectToolpath)) as Toolpath;

  if (request.kind !== JOB_START_REQUEST_KIND.RECUT) {
    return toolpath;
  }

  const enabledLayers: ProjectLayer[] = (yield select(selectEnabledProjectLayers)) as ProjectLayer[];
  const passesByLayerKey: Record<string, number> = getLinePassesByLayerKey(enabledLayers);
  const layerKeys: string[] = (request.layerKeys ?? [])
    .filter((layerKey: string): boolean => layerKey in passesByLayerKey);

  return layerKeys.length
    ? getRecutToolpath(toolpath, layerKeys, Boolean(request.isExtraPassAdded), passesByLayerKey)
    : undefined;
}
