/**
 * The jog pad cells in reading order (3 x 3).
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { JOG_DIRECTION } from '../../../utils/machine/machine.command.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { JogPadCell } from './interfaces/JogPadCell';

/** How far the one up arrow icon turns, clockwise, to point in each jog direction. */
const JOG_ARROW_ROTATION_DEG = {
  NORTH: 0,
  NORTH_EAST: 45,
  EAST: 90,
  SOUTH_EAST: 135,
  SOUTH: 180,
  SOUTH_WEST: 225,
  WEST: 270,
  NORTH_WEST: 315,
} as const;

export const JOG_PAD_CELLS: readonly JogPadCell[] = [
  {
    labelKey: DEFAULT.MACHINE_JOG_UP_LEFT,
    arrowRotationDeg: JOG_ARROW_ROTATION_DEG.NORTH_WEST,
    direction: JOG_DIRECTION.NORTH_WEST,
  },
  { labelKey: DEFAULT.MACHINE_JOG_UP, arrowRotationDeg: JOG_ARROW_ROTATION_DEG.NORTH, direction: JOG_DIRECTION.NORTH },
  {
    labelKey: DEFAULT.MACHINE_JOG_UP_RIGHT,
    arrowRotationDeg: JOG_ARROW_ROTATION_DEG.NORTH_EAST,
    direction: JOG_DIRECTION.NORTH_EAST,
  },
  { labelKey: DEFAULT.MACHINE_JOG_LEFT, arrowRotationDeg: JOG_ARROW_ROTATION_DEG.WEST, direction: JOG_DIRECTION.WEST },
  { labelKey: DEFAULT.MACHINE_JOG_ORIGIN, arrowRotationDeg: undefined, direction: undefined },
  { labelKey: DEFAULT.MACHINE_JOG_RIGHT, arrowRotationDeg: JOG_ARROW_ROTATION_DEG.EAST, direction: JOG_DIRECTION.EAST },
  {
    labelKey: DEFAULT.MACHINE_JOG_DOWN_LEFT,
    arrowRotationDeg: JOG_ARROW_ROTATION_DEG.SOUTH_WEST,
    direction: JOG_DIRECTION.SOUTH_WEST,
  },
  {
    labelKey: DEFAULT.MACHINE_JOG_DOWN,
    arrowRotationDeg: JOG_ARROW_ROTATION_DEG.SOUTH,
    direction: JOG_DIRECTION.SOUTH,
  },
  {
    labelKey: DEFAULT.MACHINE_JOG_DOWN_RIGHT,
    arrowRotationDeg: JOG_ARROW_ROTATION_DEG.SOUTH_EAST,
    direction: JOG_DIRECTION.SOUTH_EAST,
  },
];
