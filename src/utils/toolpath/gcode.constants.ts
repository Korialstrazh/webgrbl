/**
 * Fixed words and values of the G-code the toolpath is written as.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { EM_DASH } from '../characters.constants';

export const GCODE_UNITS_AND_ABSOLUTE = 'G21 G90';
export const GCODE_LASER_MODE_ON = 'M4 S0';
export const GCODE_LASER_OFF_END = 'M5 S0';
export const GCODE_AIR_ASSIST_ON = 'M8';
export const GCODE_AIR_ASSIST_OFF = 'M9';
export const GCODE_TRAVEL_WORD = 'G0';
export const GCODE_BURN_WORD = 'G1';
export const GCODE_X_PREFIX = 'X';
export const GCODE_Y_PREFIX = 'Y';
export const GCODE_S_PREFIX = 'S';
export const GCODE_F_PREFIX = 'F';
export const GCODE_WORD_SEPARATOR = ' ';
export const GCODE_LINE_SEPARATOR = '\n';
export const GCODE_COMMENT_PREFIX = '; ';
export const GCODE_TITLE_SEPARATOR = ` ${EM_DASH} `;
export const GCODE_APP_NAME = 'webgrbl';
export const GCODE_PROFILE_LABEL = 'profile: ';
export const GCODE_S_MAX_LABEL = 'S max ';
export const GCODE_ORIGIN_LABEL = 'origin ';
export const GCODE_HEADER_FIELD_SEPARATOR = ', ';
export const FULL_POWER_PERCENT = 100;
export const NO_POWER_PERCENT = 0;
export const GCODE_FILE_EXTENSION = '.gcode';
export const GCODE_MIME_TYPE = 'text/plain';
/** The smallest S value that can stand for full power. */
export const GCODE_S_VALUE_MAX_MIN = 1;
