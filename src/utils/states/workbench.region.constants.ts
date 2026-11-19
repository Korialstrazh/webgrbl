/**
 * The regions of the workbench that the segmented bar shows one at a time in a narrow window.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const WORKBENCH_REGION = {
  DESIGN: 'design',
  BED: 'bed',
  JOB: 'job',
} as const;

export type WorkbenchRegion = (typeof WORKBENCH_REGION)[keyof typeof WORKBENCH_REGION];
