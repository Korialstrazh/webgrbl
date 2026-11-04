/**
 * Checks the numbers of a material preset being entered. Power must be above zero and within what the laser of the
 * preset can do.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../localization/default.locales';
import {
  PASSES_MAX,
  PASSES_MIN,
  SPEED_MM_PER_MIN_MAX,
  SPEED_MM_PER_MIN_MIN,
} from '../palette/palette.constants';
import { isFiniteNumber } from '../type.guards/is.finite.number';
import type { MaterialPreset } from './interfaces/MaterialPreset';
import type { MaterialPresetFieldErrors } from './interfaces/MaterialPresetFieldErrors';

type MaterialPresetNumbers = Pick<MaterialPreset, 'powerWatts' | 'speedMmPerMin' | 'passes'>;

const POWER_WATTS_EXCLUSIVE_MIN = 0;

const isPowerValid = (powerWatts: number, maxPowerWatts: number): boolean =>
  isFiniteNumber(powerWatts) && powerWatts > POWER_WATTS_EXCLUSIVE_MIN && powerWatts <= maxPowerWatts;

const isSpeedValid = (speedMmPerMin: number): boolean =>
  isFiniteNumber(speedMmPerMin) && speedMmPerMin >= SPEED_MM_PER_MIN_MIN && speedMmPerMin <= SPEED_MM_PER_MIN_MAX;

const isPassesValid = (passes: number): boolean =>
  Number.isInteger(passes) && passes >= PASSES_MIN && passes <= PASSES_MAX;

export const getMaterialPresetFieldErrors = (
  { powerWatts, speedMmPerMin, passes }: MaterialPresetNumbers,
  maxPowerWatts: number,
): MaterialPresetFieldErrors => ({
  powerErrorKey: isPowerValid(powerWatts, maxPowerWatts) ? undefined : DEFAULT.MATERIAL_LIBRARY_POWER_INVALID,
  speedErrorKey: isSpeedValid(speedMmPerMin) ? undefined : DEFAULT.MATERIAL_LIBRARY_SPEED_INVALID,
  passesErrorKey: isPassesValid(passes) ? undefined : DEFAULT.MATERIAL_LIBRARY_PASSES_INVALID,
});
