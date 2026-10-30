/**
 * Timing, size and wire values of the GRBL protocol engine, plus the closed sets the engine and its callers share.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

// #region Timing
/** How long to wait for the welcome banner after opening the port. */
export const GRBL_HANDSHAKE_TIMEOUT_MS = 10_000;
/** Time between two status queries while connected. */
export const GRBL_STATUS_POLL_INTERVAL_MS = 250;
/** Longest wait for the machine to finish a feed hold before a soft reset is sent. */
export const GRBL_HOLD_COMPLETE_MAX_WAIT_MS = 2_000;
/** Silence with lines in flight after which the controller is reported as not responding. */
export const GRBL_NOT_RESPONDING_SILENCE_MS = 10_000;
/** How long an informational toast stays visible. */
export const GRBL_INFO_TOAST_LIFETIME_MS = 5_000;
// #endregion

// #region Sizes
/** Controller receive buffer size in bytes when the controller does not report one. */
export const GRBL_DEFAULT_RX_BUFFER_BYTES = 127;
/** Most console entries kept before the oldest are dropped. */
export const GRBL_CONSOLE_ENTRY_LIMIT = 2_000;
/** Most commands kept in the console command history. */
export const GRBL_COMMAND_HISTORY_LIMIT = 100;
/** Baud rates offered when connecting. */
export const GRBL_BAUD_RATES: readonly number[] = [9600, 19200, 38400, 57600, 115200, 230400, 250000];
/** Baud rate selected when the user has not chosen one. */
export const GRBL_DEFAULT_BAUD_RATE = 115200;
// #endregion

// #region Realtime bytes
export const GRBL_STATUS_QUERY_BYTE = 0x3f;
export const GRBL_FEED_HOLD_BYTE = 0x21;
export const GRBL_CYCLE_RESUME_BYTE = 0x7e;
export const GRBL_SOFT_RESET_BYTE = 0x18;
export const GRBL_JOG_CANCEL_BYTE = 0x85;
// #endregion

// #region Line patterns
export const GRBL_LINE_BREAK_PATTERN = /\r?\n/;
export const GRBL_LINE_COMMENT_PATTERN = /;.*$|\([^)]*\)/g;
export const GRBL_WHITESPACE_PATTERN = /\s+/g;
export const GRBL_SYSTEM_COMMAND_PREFIX = '$';
/** Commands that write the controller EEPROM and so must be sent one at a time (G10L2 also covers G10L20). */
export const GRBL_EEPROM_COMMAND_PATTERN = /^(\$(\d+|N[01]|RST|I)=|G10L2|G28\.1|G30\.1)/i;
// #endregion

// #region Closed sets
/** What kind of line the controller sent. */
export const GRBL_RESPONSE_KIND = {
  OK: 'ok',
  ERROR: 'error',
  ALARM: 'alarm',
  STATUS: 'status',
  BANNER: 'banner',
  SETTING: 'setting',
  FEEDBACK: 'feedback',
  OTHER: 'other',
} as const;

export type GrblResponseKind = (typeof GRBL_RESPONSE_KIND)[keyof typeof GRBL_RESPONSE_KIND];

/** Machine states exactly as GRBL prints them in status reports. */
export const GRBL_MACHINE_STATE = {
  IDLE: 'Idle',
  RUN: 'Run',
  HOLD: 'Hold',
  JOG: 'Jog',
  ALARM: 'Alarm',
  DOOR: 'Door',
  CHECK: 'Check',
  HOME: 'Home',
  SLEEP: 'Sleep',
} as const;

export type GrblMachineState = (typeof GRBL_MACHINE_STATE)[keyof typeof GRBL_MACHINE_STATE];

/** Where a sent line came from, which decides whether it counts as job traffic. */
export const GRBL_LINE_ORIGIN = {
  CONSOLE: 'console',
  PROGRAM: 'program',
  PRIVATE: 'private',
} as const;

export type GrblLineOrigin = (typeof GRBL_LINE_ORIGIN)[keyof typeof GRBL_LINE_ORIGIN];

/** Commands that are sent as single realtime bytes outside the send queue. */
export const GRBL_REALTIME_COMMAND = {
  STATUS_QUERY: 'status-query',
  FEED_HOLD: 'feed-hold',
  CYCLE_RESUME: 'cycle-resume',
  SOFT_RESET: 'soft-reset',
  JOG_CANCEL: 'jog-cancel',
} as const;

export type GrblRealtimeCommand = (typeof GRBL_REALTIME_COMMAND)[keyof typeof GRBL_REALTIME_COMMAND];
// #endregion
