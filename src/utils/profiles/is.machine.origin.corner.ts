import { isString } from '../type.guards/is.string';
import { MACHINE_ORIGIN_CORNER } from './machine.profile.constants';
import type { MachineOriginCorner } from './machine.profile.constants';

const ORIGIN_CORNERS: readonly string[] = Object.values(MACHINE_ORIGIN_CORNER);

/**
 * Tells whether a value is one of the machine origin corners.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const isMachineOriginCorner = (value: unknown): value is MachineOriginCorner =>
  isString(value) && ORIGIN_CORNERS.includes(value);
