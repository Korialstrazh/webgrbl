/**
 * The regions of the workbench that the segmented bar shows one at a time in a narrow window.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const WORKBENCH_REGION = {
  DESIGN: 'design',
  BED: 'bed',
  JOB: 'job',
} as const;

export type WorkbenchRegion = (typeof WORKBENCH_REGION)[keyof typeof WORKBENCH_REGION];
