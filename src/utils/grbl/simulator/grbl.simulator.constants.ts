/**
 * Values the simulated controller uses to interpret G-code: error codes, word letters, command numbers, unit factors.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

// #region Error codes
/** GRBL error for a word letter or line shape the controller does not know. */
export const GRBL_SIMULATOR_ERROR_INVALID_LETTER = 1;
/** GRBL error for a word value that is not a valid number. */
export const GRBL_SIMULATOR_ERROR_BAD_NUMBER = 2;
/** GRBL error for an unknown G or M command. */
export const GRBL_SIMULATOR_ERROR_UNSUPPORTED_COMMAND = 20;
/** GRBL error for two commands of the same modal group on one line. */
export const GRBL_SIMULATOR_ERROR_MODAL_GROUP_VIOLATION = 21;
/** GRBL error for a feed move before any feed rate was set. */
export const GRBL_SIMULATOR_ERROR_UNDEFINED_FEED_RATE = 22;
/** GRBL error for a command that lacks a required value word (G4 without P). */
export const GRBL_SIMULATOR_ERROR_MISSING_VALUE_WORD = 26;
/** GRBL error for an arc without usable I/J offsets. */
export const GRBL_SIMULATOR_ERROR_NO_ARC_OFFSETS = 33;
// #endregion

// #region Word letters
export const GRBL_SIMULATOR_WORD = {
  G: 'G',
  M: 'M',
  X: 'X',
  Y: 'Y',
  Z: 'Z',
  I: 'I',
  J: 'J',
  F: 'F',
  S: 'S',
  P: 'P',
} as const;
/** Letters GRBL accepts that the simulator reads no meaning from. */
export const GRBL_SIMULATOR_IGNORED_WORD_LETTERS: readonly string[] = ['K', 'N', 'L', 'R', 'T'];
/** One word: a letter followed by everything up to the next letter. */
export const GRBL_SIMULATOR_WORD_PATTERN = /[A-Z][^A-Z]*/g;
/** Value text of a well-formed number. */
export const GRBL_SIMULATOR_NUMBER_PATTERN = /^[+-]?(?:\d+\.?\d*|\.\d+)$/;
/** Matches a line that starts with a letter. */
export const GRBL_SIMULATOR_LINE_START_PATTERN = /^[A-Z]/;
// #endregion

// #region Commands
export const GRBL_SIMULATOR_G_CODE = {
  RAPID: 0,
  LINEAR: 1,
  ARC_CLOCKWISE: 2,
  ARC_COUNTER_CLOCKWISE: 3,
  DWELL: 4,
  INCHES: 20,
  MILLIMETRES: 21,
  ABSOLUTE: 90,
  RELATIVE: 91,
  SET_OFFSET: 92,
} as const;
export const GRBL_SIMULATOR_M_CODE = {
  LASER_ON_CONSTANT: 3,
  LASER_ON_DYNAMIC: 4,
  LASER_OFF: 5,
} as const;
// #endregion

// #region Units and time
export const GRBL_SIMULATOR_MM_PER_INCH = 25.4;
export const GRBL_SIMULATOR_MS_PER_SECOND = 1_000;
export const GRBL_SIMULATOR_MS_PER_MINUTE = 60_000;
/** Full turn in radians. */
export const GRBL_SIMULATOR_FULL_TURN = 2 * Math.PI;
/** Smaller distances count as zero when comparing positions. */
export const GRBL_SIMULATOR_POSITION_EPSILON = 1e-9;
// #endregion

// #region Settings
/** Setting number of the maximum rate of the X axis, in mm/min. */
export const GRBL_SIMULATOR_SETTING_MAX_RATE_X = 110;
/** Setting number of the maximum rate of the Y axis, in mm/min. */
export const GRBL_SIMULATOR_SETTING_MAX_RATE_Y = 111;
// #endregion
