/**
 * The approximate optical power of the laser pointer in watts, as text with two decimals.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { POINTER_WATTS_DECIMALS } from './machine.command.constants';
import { PERCENT_DIVISOR } from '../percent.constants';

export const getPointerApproximateWatts = (maxPowerWatts: number, powerPercent: number): string =>
  ((maxPowerWatts * powerPercent) / PERCENT_DIVISOR).toFixed(POINTER_WATTS_DECIMALS);
