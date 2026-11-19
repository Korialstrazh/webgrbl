/**
 * Gets an S max the G-code writer can scale by: the given one when it is finite and at least 1, otherwise the
 * default. A broken S max would otherwise write NaN or wrong powers into the file.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DEFAULT_MACHINE_S_VALUE_MAX } from '../profiles/machine.profile.constants';
import { GCODE_S_VALUE_MAX_MIN } from './gcode.constants';

export const getValidGcodeSValueMax = (sValueMax: number): number =>
  (Number.isFinite(sValueMax) && sValueMax >= GCODE_S_VALUE_MAX_MIN ? sValueMax : DEFAULT_MACHINE_S_VALUE_MAX);
