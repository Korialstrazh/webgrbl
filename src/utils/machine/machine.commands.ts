/**
 * Fixed G-code lines of the machine commands and the prefixes of the built ones.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const MACHINE_COMMAND = {
  HOME: '$H',
  SET_WORK_ZERO: 'G10 L20 P1 X0 Y0',
  POINTER_OFF: 'M5',
  LASER_OFF: 'M5',
  AIR_ON: 'M8',
  AIR_OFF: 'M9',
} as const;

export const JOG_RELATIVE_PREFIX = '$J=G91 G21';
export const JOG_ABSOLUTE_PREFIX = '$J=G90 G21';
export const POINTER_ON_COMMAND_PREFIX = 'M3 S';
export const POINTER_FEED_COMMAND_PREFIX = 'G1 F';
