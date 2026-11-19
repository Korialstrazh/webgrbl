/**
 * Whether a project object is the test sample the app adds, not an imported drawing: the sample name and the sample
 * gradient in its artwork.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { SAMPLE_GRADIENT_ID, SAMPLE_OBJECT_NAME } from './sample.job.constants';

type SampleJobObjectCandidate = Pick<ProjectObject, 'name' | 'svgText'>;

export const isSampleJobObject = (projectObject: SampleJobObjectCandidate): boolean => {
  return projectObject.name === SAMPLE_OBJECT_NAME && projectObject.svgText.includes(`id="${SAMPLE_GRADIENT_ID}"`);
};
