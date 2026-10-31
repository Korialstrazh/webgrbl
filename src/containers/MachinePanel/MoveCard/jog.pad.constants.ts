/**
 * The jog pad cells in reading order (3 x 3) and the step sizes offered for a jog.
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
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { JogPadCell } from './interfaces/JogPadCell';

export const JOG_PAD_CELLS: readonly JogPadCell[] = [
  { labelKey: DEFAULT.MACHINE_JOG_UP_LEFT, arrowGlyph: ARROW_UP_LEFT },
  { labelKey: DEFAULT.MACHINE_JOG_UP, arrowGlyph: ARROW_UP },
  { labelKey: DEFAULT.MACHINE_JOG_UP_RIGHT, arrowGlyph: ARROW_UP_RIGHT },
  { labelKey: DEFAULT.MACHINE_JOG_LEFT, arrowGlyph: ARROW_LEFT },
  { labelKey: DEFAULT.MACHINE_JOG_ORIGIN, arrowGlyph: undefined },
  { labelKey: DEFAULT.MACHINE_JOG_RIGHT, arrowGlyph: ARROW_RIGHT },
  { labelKey: DEFAULT.MACHINE_JOG_DOWN_LEFT, arrowGlyph: ARROW_DOWN_LEFT },
  { labelKey: DEFAULT.MACHINE_JOG_DOWN, arrowGlyph: ARROW_DOWN },
  { labelKey: DEFAULT.MACHINE_JOG_DOWN_RIGHT, arrowGlyph: ARROW_DOWN_RIGHT },
];

export const FINE_STEP_MM = '0.1';
export const SMALL_STEP_MM = '1';
export const MEDIUM_STEP_MM = '10';
export const LARGE_STEP_MM = '50';

export const JOG_STEP_DISTANCES_MM: readonly string[] = [FINE_STEP_MM, SMALL_STEP_MM, MEDIUM_STEP_MM, LARGE_STEP_MM];
export const DEFAULT_JOG_STEP_MM: string = SMALL_STEP_MM;
