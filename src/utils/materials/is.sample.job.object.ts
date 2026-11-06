/**
 * Whether a project object is the test sample the app adds, not an imported drawing: the sample name and the sample
 * gradient in its artwork.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { SAMPLE_GRADIENT_ID, SAMPLE_OBJECT_NAME } from './sample.job.constants';

type SampleJobObjectCandidate = Pick<ProjectObject, 'name' | 'svgText'>;

export const isSampleJobObject = (projectObject: SampleJobObjectCandidate): boolean => {
  return projectObject.name === SAMPLE_OBJECT_NAME && projectObject.svgText.includes(`id="${SAMPLE_GRADIENT_ID}"`);
};
