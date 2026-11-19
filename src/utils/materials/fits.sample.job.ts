/**
 * Tells whether the test sample fits the work area, with its margin from the origin corner.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToolpathMachineArea } from '../toolpath/interfaces/ToolpathMachineArea';
import { SAMPLE_MARGIN_MM, SAMPLE_SIZE_MM } from './sample.job.constants';

export const fitsSampleJob = (machineArea: ToolpathMachineArea): boolean =>
  machineArea.workAreaXMm >= SAMPLE_MARGIN_MM + SAMPLE_SIZE_MM
  && machineArea.workAreaYMm >= SAMPLE_MARGIN_MM + SAMPLE_SIZE_MM;
