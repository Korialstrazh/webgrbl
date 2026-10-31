/**
 * Values of the simulated controller: G-code interpretation, protocol texts, system commands, motion timing, faults.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblAxisPosition } from '../interfaces/GrblAxisPosition';

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
/** Machine position after power-up and homing. */
export const GRBL_SIMULATOR_ORIGIN: GrblAxisPosition = { x: 0, y: 0, z: 0 };
/** Smaller distances count as zero when comparing positions. */
export const GRBL_SIMULATOR_POSITION_EPSILON = 1e-9;
// #endregion

// #region Settings
/** Setting number of the maximum rate of the X axis, in mm/min. */
export const GRBL_SIMULATOR_SETTING_MAX_RATE_X = 110;
/** Setting number of the maximum rate of the Y axis, in mm/min. */
export const GRBL_SIMULATOR_SETTING_MAX_RATE_Y = 111;
// #endregion

// #region Accepted no-op words
/** G-codes (plane, cutter, offsets, path control, canned cycle and feed modes) accepted without effect. */
export const GRBL_SIMULATOR_NOOP_G_CODES: readonly number[] = [17, 40, 49, 54, 55, 56, 57, 58, 59, 61, 80, 94];
/** M-codes (program end, coolant) accepted without effect. */
export const GRBL_SIMULATOR_NOOP_M_CODES: readonly number[] = [2, 7, 8, 9, 30];
// #endregion

// #region Protocol
/** Line ending GRBL puts after every output line. */
export const GRBL_SIMULATOR_LINE_ENDING = '\r\n';
/** Welcome line printed on power-up and after every soft reset. */
export const GRBL_SIMULATOR_BANNER = "Grbl 1.1h ['$' for help]";
/** First line of the $I answer. */
export const GRBL_SIMULATOR_VERSION_REPORT = '[VER:1.1h.20190825:]';
/** Second line of the $I answer: options, planner blocks, serial buffer size as GRBL reports it. */
export const GRBL_SIMULATOR_BUILD_OPTION_REPORT = '[OPT:V,15,128]';
/** Answer to a bare $. */
export const GRBL_SIMULATOR_HELP_REPORT = '[HLP:$$ $# $G $I $N $x=val $Nx=line $J=line $SLP $C $X $H ~ ! ? ctrl-x]';
export const GRBL_SIMULATOR_MESSAGE = {
  CHECK_MODE_ENABLED: '[MSG:Enabled]',
  CHECK_MODE_DISABLED: '[MSG:Disabled]',
  UNLOCKED: '[MSG:Caution: Unlocked]',
  UNLOCK_REQUIRED: "[MSG:'$H'|'$X' to unlock]",
} as const;
export const GRBL_SIMULATOR_RESPONSE_PREFIX = {
  ERROR: 'error:',
  ALARM: 'ALARM:',
} as const;
/** Usable serial receive buffer: GRBL reports 128 bytes but one stays empty. */
export const GRBL_SIMULATOR_RX_BUFFER_BYTES = 127;
/** Byte that ends a received line. */
export const GRBL_SIMULATOR_LINE_FEED_BYTE = 0x0a;
/** Bytes above this are extended ASCII, which GRBL drops unless they are realtime commands. */
export const GRBL_SIMULATOR_HIGHEST_ASCII_BYTE = 0x7f;
/** Delay before simulated output reaches the transport listener, so reads arrive asynchronously. */
export const GRBL_SIMULATOR_OUTPUT_DELAY_MS = 0;
// #endregion

// #region System commands
export const GRBL_SIMULATOR_SYSTEM_COMMAND = {
  HELP: '$',
  SETTINGS: '$$',
  BUILD_INFO: '$I',
  GCODE_STATE: '$G',
  UNLOCK: '$X',
  HOME: '$H',
  CHECK_MODE: '$C',
} as const;
/** Prefix of a jog command; the G-code of the jog follows it. */
export const GRBL_SIMULATOR_JOG_COMMAND_PREFIX = '$J=';
/** G-code put in front of a jog command, because every jog is a linear feed move. */
export const GRBL_SIMULATOR_JOG_MOTION_GCODE = 'G1';
/** Matches a setting write and captures its number and value. */
export const GRBL_SIMULATOR_SETTING_WRITE_PATTERN = /^\$(\d+)=(.*)$/;
/** GRBL error for a system command it does not know. */
export const GRBL_SIMULATOR_ERROR_INVALID_STATEMENT = 3;
/** GRBL error for a system command that needs the Idle (or Alarm) state. */
export const GRBL_SIMULATOR_ERROR_NOT_IDLE = 8;
/** GRBL error for G-code sent while the controller is locked in the Alarm state. */
export const GRBL_SIMULATOR_ERROR_GCODE_LOCKED = 9;
/** GRBL alarm for a reset while the machine was moving, which loses the position. */
export const GRBL_SIMULATOR_ALARM_ABORT_DURING_CYCLE = 3;
// #endregion

// #region Status report
/** Decimal places of positions in status reports and $G. */
export const GRBL_SIMULATOR_POSITION_DECIMALS = 3;
/** Substate printed after Hold: 0 when the hold is complete, 1 while still slowing down. */
export const GRBL_SIMULATOR_HOLD_SUBSTATE = {
  COMPLETE: 0,
  DECELERATING: 1,
} as const;
// #endregion

// #region Motion
/** Most blocks the motion planner holds; further lines wait in the receive buffer. */
export const GRBL_SIMULATOR_PLANNER_BLOCK_COUNT = 15;
/** Time between two motion updates. */
export const GRBL_SIMULATOR_MOTION_TICK_MS = 20;
/** How long a feed hold or jog cancel takes to slow the machine to a stop. */
export const GRBL_SIMULATOR_DECELERATION_MS = 200;
/** What the motion planner is doing right now. */
export const GRBL_SIMULATOR_MOTION_PHASE = {
  IDLE: 'idle',
  RUN: 'run',
  JOG: 'jog',
  HOLD_DECELERATING: 'hold-decelerating',
  HOLD_COMPLETE: 'hold-complete',
  JOG_CANCELLING: 'jog-cancelling',
} as const;

export type GrblSimulatorMotionPhase = (typeof GRBL_SIMULATOR_MOTION_PHASE)[keyof typeof GRBL_SIMULATOR_MOTION_PHASE];

/** Motion phases in which a soft reset loses steps, so GRBL raises ALARM:3. */
export const GRBL_SIMULATOR_MOTION_ABORTING_PHASES: readonly GrblSimulatorMotionPhase[] = [
  GRBL_SIMULATOR_MOTION_PHASE.RUN,
  GRBL_SIMULATOR_MOTION_PHASE.JOG,
  GRBL_SIMULATOR_MOTION_PHASE.JOG_CANCELLING,
  GRBL_SIMULATOR_MOTION_PHASE.HOLD_DECELERATING,
];
// #endregion

// #region Faults
/** Kinds of misbehaviour a test can make the simulated controller show. */
export const GRBL_SIMULATOR_FAULT_KIND = {
  ERROR_ON_LINE: 'error-on-line',
  ALARM: 'alarm',
  STOP_RESPONDING: 'stop-responding',
  SELF_RESET: 'self-reset',
} as const;
// #endregion
