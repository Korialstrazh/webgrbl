/**
 * The approximate optical power of the laser pointer in watts, as text with two decimals.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { POINTER_WATTS_DECIMALS } from './machine.command.constants';
import { PERCENT_DIVISOR } from '../percent.constants';

export const getPointerApproximateWatts = (maxPowerWatts: number, powerPercent: number): string =>
  ((maxPowerWatts * powerPercent) / PERCENT_DIVISOR).toFixed(POINTER_WATTS_DECIMALS);
