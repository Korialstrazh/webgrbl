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
import {
  ARROW_DOWN,
  ARROW_DOWN_LEFT,
  ARROW_DOWN_RIGHT,
  ARROW_LEFT,
  ARROW_RIGHT,
  ARROW_UP,
  ARROW_UP_LEFT,
  ARROW_UP_RIGHT,
} from '../../../utils/characters.constants';
import { JOG_DIRECTION } from '../../../utils/machine/machine.command.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { JogPadCell } from './interfaces/JogPadCell';

export const JOG_PAD_CELLS: readonly JogPadCell[] = [
  { labelKey: DEFAULT.MACHINE_JOG_UP_LEFT, arrowGlyph: ARROW_UP_LEFT, direction: JOG_DIRECTION.NORTH_WEST },
  { labelKey: DEFAULT.MACHINE_JOG_UP, arrowGlyph: ARROW_UP, direction: JOG_DIRECTION.NORTH },
  { labelKey: DEFAULT.MACHINE_JOG_UP_RIGHT, arrowGlyph: ARROW_UP_RIGHT, direction: JOG_DIRECTION.NORTH_EAST },
  { labelKey: DEFAULT.MACHINE_JOG_LEFT, arrowGlyph: ARROW_LEFT, direction: JOG_DIRECTION.WEST },
  { labelKey: DEFAULT.MACHINE_JOG_ORIGIN, arrowGlyph: undefined, direction: undefined },
  { labelKey: DEFAULT.MACHINE_JOG_RIGHT, arrowGlyph: ARROW_RIGHT, direction: JOG_DIRECTION.EAST },
  { labelKey: DEFAULT.MACHINE_JOG_DOWN_LEFT, arrowGlyph: ARROW_DOWN_LEFT, direction: JOG_DIRECTION.SOUTH_WEST },
  { labelKey: DEFAULT.MACHINE_JOG_DOWN, arrowGlyph: ARROW_DOWN, direction: JOG_DIRECTION.SOUTH },
  { labelKey: DEFAULT.MACHINE_JOG_DOWN_RIGHT, arrowGlyph: ARROW_DOWN_RIGHT, direction: JOG_DIRECTION.SOUTH_EAST },
];
