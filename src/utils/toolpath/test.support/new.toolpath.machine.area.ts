/**
 * Test factory for a 400 x 300 mm front-left machine area unless overridden.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { MACHINE_ORIGIN_CORNER } from '../../profiles/machine.profile.constants';
import type { ToolpathMachineArea } from '../interfaces/ToolpathMachineArea';

const TEST_WORK_AREA_X_MM = 400;
const TEST_WORK_AREA_Y_MM = 300;

export const newToolpathMachineArea = (overrides: Partial<ToolpathMachineArea> = {}): ToolpathMachineArea => ({
  workAreaXMm: TEST_WORK_AREA_X_MM,
  workAreaYMm: TEST_WORK_AREA_Y_MM,
  originCorner: MACHINE_ORIGIN_CORNER.FRONT_LEFT,
  ...overrides,
});
