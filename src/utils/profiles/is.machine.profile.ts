import { isBoolean } from '../type.guards/is.boolean';
import { isFiniteNumber } from '../type.guards/is.finite.number';
import { isRecord } from '../type.guards/is.record';
import { isString } from '../type.guards/is.string';
import type { MachineProfile } from './interfaces/MachineProfile';
import { isMachineOriginCorner } from './is.machine.origin.corner';

/**
 * Tells whether a value has the shape of a machine profile (field types only; getMachineProfileErrors checks
 * the value ranges).
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const isMachineProfile = (value: unknown): value is MachineProfile =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.name) &&
  isFiniteNumber(value.maxPowerWatts) &&
  isFiniteNumber(value.workAreaXMm) &&
  isFiniteNumber(value.workAreaYMm) &&
  isFiniteNumber(value.sValueMax) &&
  isMachineOriginCorner(value.originCorner) &&
  isBoolean(value.hasAirAssist) &&
  isBoolean(value.hasHomingSwitches) &&
  isFiniteNumber(value.jogFeedRate);
