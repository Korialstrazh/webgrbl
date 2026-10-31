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
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const isMachineOriginCorner = (value: unknown): value is MachineOriginCorner =>
  typeof value === 'string' && ORIGIN_CORNERS.includes(value);
