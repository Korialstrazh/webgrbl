/**
 * Gets the speed in mm per second a move cruises at: a rapid travel runs at the axis-limited rate, a burn at the
 * feed capped by that rate.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getAxisLimitedValue } from './get.axis.limited.value';
import type { MachineMotionLimits } from './interfaces/MachineMotionLimits';
import type { MoveDirection } from './interfaces/MoveDirection';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { SECONDS_PER_MINUTE } from './motion.constants';
import { TOOLPATH_MOVE_KIND } from './toolpath.constants';

export const getMoveNominalSpeed = (
  move: ToolpathMove,
  direction: MoveDirection,
  limits: MachineMotionLimits,
): number => {
  const axisLimitedSpeed: number = getAxisLimitedValue(
    direction,
    limits.maxRateXMmPerMin / SECONDS_PER_MINUTE,
    limits.maxRateYMmPerMin / SECONDS_PER_MINUTE,
  );
  const hasFeed: boolean = move.kind === TOOLPATH_MOVE_KIND.BURN && move.feedMmPerMin > 0;

  return hasFeed ? Math.min(move.feedMmPerMin / SECONDS_PER_MINUTE, axisLimitedSpeed) : axisLimitedSpeed;
};
