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
/** Time between two status queries while a stop waits for the hold to complete. */
export const GRBL_STOP_STATUS_POLL_INTERVAL_MS = 50;
/** Longest wait for the banner after a soft reset before the held queue sends again and not-responding is reported. */
export const GRBL_RESET_BANNER_TIMEOUT_MS = 10_000;
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
/** Realtime byte that asks for a status report. */
export const GRBL_STATUS_QUERY_BYTE = 0x3f;
/** Realtime byte that pauses motion. */
export const GRBL_FEED_HOLD_BYTE = 0x21;
/** Realtime byte that continues after a feed hold. */
export const GRBL_CYCLE_RESUME_BYTE = 0x7e;
/** Realtime byte that resets the controller. */
export const GRBL_SOFT_RESET_BYTE = 0x18;
/** Realtime byte that stops a jog in progress. */
export const GRBL_JOG_CANCEL_BYTE = 0x85;
// #endregion

// #region Line patterns
/** Splits received text into lines for both LF and CRLF endings. */
export const GRBL_LINE_BREAK_PATTERN = /\r?\n/;
/** Matches a semicolon comment to the end of the line or a parenthesis comment. */
export const GRBL_LINE_COMMENT_PATTERN = /;.*$|\([^)]*\)/g;
/** Matches any run of whitespace. */
export const GRBL_WHITESPACE_PATTERN = /\s+/g;
/** First character of a GRBL system command such as a setting write. */
export const GRBL_SYSTEM_COMMAND_PREFIX = '$';
/** Commands that write the controller EEPROM and so must be sent one at a time (G10L2 also covers G10L20). */
export const GRBL_EEPROM_COMMAND_PATTERN = /^(\$(\d+|N[01]|RST|I)=|G10L2|G28\.1|G30\.1)/i;
/** Line break written after every queued line. */
export const GRBL_LINE_TERMINATOR = '\n';
/** System command that reports the firmware version and build options. */
export const GRBL_BUILD_INFO_COMMAND = '$I';
/** System command that lists all settings. */
export const GRBL_SETTINGS_COMMAND = '$$';
/** System command that clears the Alarm lock. */
export const GRBL_UNLOCK_COMMAND = '$X';
/** System command that enters check mode, or leaves it with a reset. */
export const GRBL_CHECK_MODE_COMMAND = '$C';
// #endregion

// #region Response patterns
/** Fallback for text that is missing. */
export const GRBL_EMPTY_TEXT = '';
/** Text of a successful acknowledgement. */
export const GRBL_OK_RESPONSE_TEXT = 'ok';
/** Matches an error line and captures the error code. */
export const GRBL_ERROR_PATTERN = /^error:(\d+)$/i;
/** Matches an alarm line and captures the alarm code. */
export const GRBL_ALARM_PATTERN = /^ALARM:(\d+)$/i;
/** Matches a setting line and captures its number and value. */
export const GRBL_SETTING_PATTERN = /^\$(\d+)=(.*)$/;
/** Matches a bracketed feedback message. */
export const GRBL_FEEDBACK_PATTERN = /^\[.*\]$/;
/** Matches a status report and captures what is inside the angle brackets. */
export const GRBL_STATUS_REPORT_PATTERN = /^<(.*)>$/;
/** Matches the welcome banner and captures firmware name, version and the remaining text. */
export const GRBL_BANNER_PATTERN = /^(grbl(?:hal)?)\s+v?(\d+\.\d+[a-z]?)\s*(.*)$/i;
/** Captures the major and minor number of a firmware version. */
export const GRBL_VERSION_NUMBER_PATTERN = /^(\d+)\.(\d+)/;
/** Matches the build option line and captures the reported receive buffer size. */
export const GRBL_BUILD_OPTION_PATTERN = /^\[OPT:[^,\]]*,\d+,(\d+)\]$/i;
// #endregion

// #region Status report fields
/** Separates the fields of a status report. */
export const GRBL_STATUS_FIELD_SEPARATOR = '|';
/** Separates a status field name from its value. */
export const GRBL_STATUS_VALUE_SEPARATOR = ':';
/** Separates the numbers inside one status field value. */
export const GRBL_STATUS_NUMBER_SEPARATOR = ',';
/** Names of the status report fields this app reads. */
export const GRBL_STATUS_FIELD = {
  MACHINE_POSITION: 'MPos',
  WORK_POSITION: 'WPos',
  WORK_COORDINATE_OFFSET: 'WCO',
  BUFFER: 'Bf',
  FEED_AND_SPINDLE: 'FS',
  FEED: 'F',
  OVERRIDES: 'Ov',
} as const;
// #endregion

// #region Firmware support
/** Oldest firmware major version the app supports. */
export const GRBL_MIN_SUPPORTED_MAJOR_VERSION = 1;
/** Oldest firmware minor version the app supports within the minimum major version. */
export const GRBL_MIN_SUPPORTED_MINOR_VERSION = 1;
/** GRBL reports its serial buffer size, but one byte of it cannot be used. */
export const GRBL_RX_BUFFER_UNUSABLE_BYTES = 1;
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

/** Substate GRBL prints after Hold: 0 once the machine stands still, 1 while it is still slowing down. */
export const GRBL_HOLD_SUBSTATE = {
  COMPLETE: 0,
  DECELERATING: 1,
} as const;

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

/** Byte written for each realtime command. */
export const GRBL_REALTIME_COMMAND_BYTE: Readonly<Record<GrblRealtimeCommand, number>> = {
  [GRBL_REALTIME_COMMAND.STATUS_QUERY]: GRBL_STATUS_QUERY_BYTE,
  [GRBL_REALTIME_COMMAND.FEED_HOLD]: GRBL_FEED_HOLD_BYTE,
  [GRBL_REALTIME_COMMAND.CYCLE_RESUME]: GRBL_CYCLE_RESUME_BYTE,
  [GRBL_REALTIME_COMMAND.SOFT_RESET]: GRBL_SOFT_RESET_BYTE,
  [GRBL_REALTIME_COMMAND.JOG_CANCEL]: GRBL_JOG_CANCEL_BYTE,
};

/** Console text of each realtime command; the bytes without a printable character are shown in hex. */
export const GRBL_REALTIME_COMMAND_TEXT: Readonly<Record<GrblRealtimeCommand, string>> = {
  [GRBL_REALTIME_COMMAND.STATUS_QUERY]: '?',
  [GRBL_REALTIME_COMMAND.FEED_HOLD]: '!',
  [GRBL_REALTIME_COMMAND.CYCLE_RESUME]: '~',
  [GRBL_REALTIME_COMMAND.SOFT_RESET]: '0x18',
  [GRBL_REALTIME_COMMAND.JOG_CANCEL]: '0x85',
};

/** Which way a console entry travelled. */
export const GRBL_CONSOLE_DIRECTION = {
  SENT: 'sent',
  RECEIVED: 'received',
  REALTIME: 'realtime',
} as const;

export type GrblConsoleDirection = (typeof GRBL_CONSOLE_DIRECTION)[keyof typeof GRBL_CONSOLE_DIRECTION];

/** Where the app's connection to the laser stands; `lost` means an established connection broke unexpectedly. */
export const GRBL_CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  LOST: 'lost',
} as const;

export type GrblConnectionStatus = (typeof GRBL_CONNECTION_STATUS)[keyof typeof GRBL_CONNECTION_STATUS];

/** Direction of a console view entry: the engine directions plus lines the app itself adds. */
export const GRBL_CONSOLE_VIEW_DIRECTION = {
  ...GRBL_CONSOLE_DIRECTION,
  INFO: 'info',
  ERROR: 'error',
} as const;

export type GrblConsoleViewDirection = (typeof GRBL_CONSOLE_VIEW_DIRECTION)[keyof typeof GRBL_CONSOLE_VIEW_DIRECTION];

/** Kinds of event the controller emits. */
export const GRBL_CONTROLLER_EVENT_KIND = {
  CONSOLE_ENTRY: 'console-entry',
  STATUS_REPORT: 'status-report',
  GRBL_ERROR: 'grbl-error',
  GRBL_ALARM: 'grbl-alarm',
  CONNECTION_LOST: 'connection-lost',
  NOT_RESPONDING: 'not-responding',
  PROGRAM_STOPPED_ON_ERROR: 'program-stopped-on-error',
} as const;

export type GrblControllerEventKind = (typeof GRBL_CONTROLLER_EVENT_KIND)[keyof typeof GRBL_CONTROLLER_EVENT_KIND];

/** Where the controller is in its connection life cycle. */
export const GRBL_CONTROLLER_PHASE = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
} as const;

export type GrblControllerPhase = (typeof GRBL_CONTROLLER_PHASE)[keyof typeof GRBL_CONTROLLER_PHASE];

/** Why the handshake failed. */
export const GRBL_HANDSHAKE_FAILURE_REASON = {
  TIMEOUT: 'timeout',
  UNSUPPORTED_FIRMWARE: 'unsupported-firmware',
} as const;

export type GrblHandshakeFailureReason =
  (typeof GRBL_HANDSHAKE_FAILURE_REASON)[keyof typeof GRBL_HANDSHAKE_FAILURE_REASON];
// #endregion

// #region Web Serial
/** Port id of the built-in simulated laser, which has no real serial port behind it. */
export const SIMULATED_LASER_PORT_ID = 'simulated';
/** Prefix of the ids given to registered serial ports; the running number follows. */
export const SERIAL_PORT_ID_PREFIX = 'serial-';
/** Data bits of the GRBL serial link (8N1). */
export const WEB_SERIAL_DATA_BITS = 8;
/** Stop bits of the GRBL serial link (8N1). */
export const WEB_SERIAL_STOP_BITS = 1;
/** Parity of the GRBL serial link (8N1). */
export const WEB_SERIAL_PARITY: ParityType = 'none';
/** Name of the `disconnect` event that `navigator.serial` and each port dispatch when the device is unplugged. */
export const WEB_SERIAL_DISCONNECT_EVENT = 'disconnect';

/** Names of the DOMException errors that opening a serial port can fail with. */
export const WEB_SERIAL_OPEN_ERROR_NAME = {
  NETWORK: 'NetworkError',
  INVALID_STATE: 'InvalidStateError',
  NOT_FOUND: 'NotFoundError',
} as const;

/** Why opening a serial port failed. */
export const SERIAL_PORT_OPEN_FAILURE_REASON = {
  ACCESS_DENIED_OR_BUSY: 'access-denied-or-busy',
  PORT_NOT_FOUND: 'port-not-found',
  UNKNOWN: 'unknown',
} as const;

export type SerialPortOpenFailureReason =
  (typeof SERIAL_PORT_OPEN_FAILURE_REASON)[keyof typeof SERIAL_PORT_OPEN_FAILURE_REASON];
// #endregion
