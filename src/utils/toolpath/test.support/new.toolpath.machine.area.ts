/**
 * Test factory for a 400 x 300 mm front-left machine area unless overridden.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
