/**
 * Formats the $G answer of the simulated controller, such as [GC:G0 G54 G17 G21 G90 G94 M5 M9 T0 F0 S0].
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  GRBL_SIMULATOR_G_CODE,
  GRBL_SIMULATOR_MM_PER_INCH,
  GRBL_SIMULATOR_M_CODE,
  GRBL_SIMULATOR_WORD,
} from './grbl.simulator.constants';
import type { GrblSimulatorModalState } from './interfaces/GrblSimulatorModalState';

const GCODE_STATE_START = '[GC:';
const GCODE_STATE_END = ']';
const GCODE_STATE_SEPARATOR = ' ';
/** Coordinate system G54. */
const ACTIVE_COORDINATE_SYSTEM = 'G54';
/** Plane G17 (XY). */
const ACTIVE_PLANE = 'G17';
/** Feed mode G94 (units per minute). */
const ACTIVE_FEED_MODE = 'G94';
/** Coolant M9 (off). */
const ACTIVE_COOLANT = 'M9';
/** Tool T0. */
const ACTIVE_TOOL = 'T0';

export const getSimulatorGcodeStateReport = (state: GrblSimulatorModalState): string => {
  const unitCode: number = state.isMetric ? GRBL_SIMULATOR_G_CODE.MILLIMETRES : GRBL_SIMULATOR_G_CODE.INCHES;
  const distanceCode: number = state.isAbsolute ? GRBL_SIMULATOR_G_CODE.ABSOLUTE : GRBL_SIMULATOR_G_CODE.RELATIVE;
  const laserCode: number = state.isLaserOn ? GRBL_SIMULATOR_M_CODE.LASER_ON_CONSTANT : GRBL_SIMULATOR_M_CODE.LASER_OFF;
  const feedInActiveUnits: number = state.isMetric ? state.feedRate : state.feedRate / GRBL_SIMULATOR_MM_PER_INCH;
  const words: string[] = [
    `${GRBL_SIMULATOR_WORD.G}${state.motionMode}`,
    ACTIVE_COORDINATE_SYSTEM,
    ACTIVE_PLANE,
    `${GRBL_SIMULATOR_WORD.G}${unitCode}`,
    `${GRBL_SIMULATOR_WORD.G}${distanceCode}`,
    ACTIVE_FEED_MODE,
    `${GRBL_SIMULATOR_WORD.M}${laserCode}`,
    ACTIVE_COOLANT,
    ACTIVE_TOOL,
    `${GRBL_SIMULATOR_WORD.F}${Math.round(feedInActiveUnits)}`,
    `${GRBL_SIMULATOR_WORD.S}${Math.round(state.spindleSpeed)}`,
  ];

  return `${GCODE_STATE_START}${words.join(GCODE_STATE_SEPARATOR)}${GCODE_STATE_END}`;
};
