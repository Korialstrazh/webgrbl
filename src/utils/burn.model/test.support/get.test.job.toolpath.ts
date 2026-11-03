/**
 * Test helper: the toolpath of drawables on a machine big enough for any test job.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import { getToolpath } from '../../toolpath/get.toolpath';
import type { BedDrawable } from '../../toolpath/interfaces/BedDrawable';
import type { Toolpath } from '../../toolpath/interfaces/Toolpath';
import { newToolpathMachineArea } from '../../toolpath/test.support/new.toolpath.machine.area';

const TEST_MACHINE_SIZE_MM = 10000;

export const getTestJobToolpath = (drawables: BedDrawable[], layers: ProjectLayer[]): Toolpath => getToolpath({
  drawables,
  warnings: [],
  layers,
  machineArea: newToolpathMachineArea({ workAreaXMm: TEST_MACHINE_SIZE_MM, workAreaYMm: TEST_MACHINE_SIZE_MM }),
});
