/**
 * Gets how far the head would leave the bed while running the toolpath, as the edge it passes most and by how much;
 * undefined when every point stays on the bed. It checks the same move end points that become the X and Y words of the
 * G-code, and the origin corner only mirrors them inside the bed, so a toolpath that passes here never sends the head
 * past the bed. A difference smaller than the G-code's last decimal is rounding, not an overrun.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getFrameBedOverrun } from '../frame/get.frame.bed.overrun';
import type { FrameBedOverrun } from '../frame/interfaces/FrameBedOverrun';
import { GCODE_MAX_DECIMALS } from '../machine/machine.command.constants';
import { getToolpathBounds } from './get.toolpath.bounds';
import type { OriginWorkArea } from './interfaces/OriginWorkArea';
import type { ToolpathBounds } from './interfaces/ToolpathBounds';
import type { ToolpathMove } from './interfaces/ToolpathMove';

const DECIMAL_BASE = 10;
const HALF = 0.5;
const GCODE_ROUNDING_TOLERANCE_MM: number = HALF * DECIMAL_BASE ** -GCODE_MAX_DECIMALS;

export const getToolpathBedOverrun = (
  moves: ToolpathMove[],
  workArea: OriginWorkArea,
): FrameBedOverrun | undefined => {
  const bounds: ToolpathBounds | undefined = getToolpathBounds(moves);
  const overrun: FrameBedOverrun | undefined = bounds && getFrameBedOverrun(bounds, workArea);

  return overrun && overrun.distanceMm > GCODE_ROUNDING_TOLERANCE_MM ? overrun : undefined;
};
