/**
 * Gets how far an arrow key moves the selection in the machine frame: 1 mm, or 10 mm with Shift. Undefined for any
 * other key.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { NUDGE_STEP_MM, NUDGE_STEP_SHIFT_MM } from '../../utils/project/project.constants';
import { NUDGE_DIRECTION_BY_KEY } from './bed.objects.constants';
import type { BedMachinePoint } from './interfaces/BedMachinePoint';

export const getNudgeOffset = (key: string, isShiftPressed: boolean): BedMachinePoint | undefined => {
  const direction: BedMachinePoint | undefined = Object.hasOwn(NUDGE_DIRECTION_BY_KEY, key)
    ? NUDGE_DIRECTION_BY_KEY[key]
    : undefined;

  if (!direction) {
    return undefined;
  }

  const stepMm: number = isShiftPressed ? NUDGE_STEP_SHIFT_MM : NUDGE_STEP_MM;

  return { x: direction.x * stepMm, y: direction.y * stepMm };
};
