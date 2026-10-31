import { BED_MAX_TRAVEL_MM } from '../bed/bed.constants';

/**
 * Closed set of machine corners where the work origin can sit, with its derived type, plus the defaults, ranges
 * and storage key of a machine profile.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const MACHINE_ORIGIN_CORNER = {
  FRONT_LEFT: 'front-left',
  BACK_LEFT: 'back-left',
  FRONT_RIGHT: 'front-right',
  BACK_RIGHT: 'back-right',
} as const;

export type MachineOriginCorner = (typeof MACHINE_ORIGIN_CORNER)[keyof typeof MACHINE_ORIGIN_CORNER];

export const MACHINE_PROFILES_STORAGE_KEY = 'webgrbl.machineProfiles';
export const MACHINE_PROFILES_DOCUMENT_VERSION = 1;
export const MACHINE_PROFILES_EXPORT_INDENT = 2;

export const DEFAULT_MACHINE_PROFILE_NAME = 'My laser';
export const DEFAULT_MACHINE_WORK_AREA_MM = 400;
export const DEFAULT_MACHINE_MAX_POWER_WATTS = 10;
export const DEFAULT_MACHINE_S_VALUE_MAX = 1000;
export const DEFAULT_MACHINE_ORIGIN_CORNER: MachineOriginCorner = MACHINE_ORIGIN_CORNER.FRONT_LEFT;
export const DEFAULT_MACHINE_HAS_AIR_ASSIST = false;
export const DEFAULT_MACHINE_HAS_HOMING_SWITCHES = false;
export const DEFAULT_MACHINE_JOG_FEED_RATE = 1500;

export const MACHINE_WORK_AREA_MAX_MM = BED_MAX_TRAVEL_MM;
export const MACHINE_MAX_POWER_WATTS_LIMIT = 500;
export const MACHINE_S_VALUE_MAX_LOWER_LIMIT = 1;
export const MACHINE_S_VALUE_MAX_UPPER_LIMIT = 100000;
export const MACHINE_JOG_FEED_RATE_MIN = 100;
export const MACHINE_JOG_FEED_RATE_MAX = 10000;

export const MACHINE_PROFILE_ERROR_KEY = {
  NAME_REQUIRED: 'MACHINE_PROFILE_ERROR_NAME_REQUIRED',
  MAX_POWER_INVALID: 'MACHINE_PROFILE_ERROR_MAX_POWER_INVALID',
  WORK_AREA_X_INVALID: 'MACHINE_PROFILE_ERROR_WORK_AREA_X_INVALID',
  WORK_AREA_Y_INVALID: 'MACHINE_PROFILE_ERROR_WORK_AREA_Y_INVALID',
  S_VALUE_MAX_INVALID: 'MACHINE_PROFILE_ERROR_S_VALUE_MAX_INVALID',
  JOG_FEED_RATE_INVALID: 'MACHINE_PROFILE_ERROR_JOG_FEED_RATE_INVALID',
} as const;
