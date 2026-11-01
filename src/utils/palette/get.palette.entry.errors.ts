/**
 * Lists the problems of a palette entry, one item per invalid field; an empty list means the entry is valid. When the
 * other palette entries are given, a colour one of them already uses is a problem too, because layers are matched to
 * palette entries by exact colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { isFiniteNumber } from '../type.guards/is.finite.number';
import type { PaletteEntry } from './interfaces/PaletteEntry';
import type { PaletteEntryFieldError } from './interfaces/PaletteEntryFieldError';
import { getNormalizedColour } from './normalize.colour';
import {
  LINE_INTERVAL_MM_MAX,
  LINE_INTERVAL_MM_MIN,
  PALETTE_ENTRY_ERROR_KEY,
  PASSES_MAX,
  PASSES_MIN,
  POWER_PERCENT_MAX,
  POWER_PERCENT_MIN,
  SPEED_MM_PER_MIN_MAX,
  SPEED_MM_PER_MIN_MIN,
} from './palette.constants';

const isInRange = (value: number, lowerLimit: number, upperLimit: number): boolean =>
  isFiniteNumber(value) && value >= lowerLimit && value <= upperLimit;

const isPowerValid = (value: number): boolean => isInRange(value, POWER_PERCENT_MIN, POWER_PERCENT_MAX);

const isPassCountValid = (value: number): boolean =>
  Number.isInteger(value) && isInRange(value, PASSES_MIN, PASSES_MAX);

const hasMinPowerAboveMax = (entry: PaletteEntry): boolean =>
  isPowerValid(entry.minPowerPercent) && isPowerValid(entry.maxPowerPercent) &&
  entry.minPowerPercent > entry.maxPowerPercent;

const isColourUsedByOtherEntry = (entry: PaletteEntry, otherEntries: PaletteEntry[]): boolean => {
  const entryColour: string | undefined = getNormalizedColour(entry.colour);

  return otherEntries.some(
    (otherEntry: PaletteEntry): boolean =>
      otherEntry.id !== entry.id && getNormalizedColour(otherEntry.colour) === entryColour,
  );
};

export const getPaletteEntryErrors = (
  entry: PaletteEntry,
  otherEntries: PaletteEntry[] = [],
): PaletteEntryFieldError[] => {
  const errors: PaletteEntryFieldError[] = [];
  const powerParameters: Record<string, number> = { min: POWER_PERCENT_MIN, max: POWER_PERCENT_MAX };

  if (!entry.name.trim()) {
    errors.push({ field: 'name', messageKey: PALETTE_ENTRY_ERROR_KEY.NAME_REQUIRED });
  }

  if (!getNormalizedColour(entry.colour)) {
    errors.push({ field: 'colour', messageKey: PALETTE_ENTRY_ERROR_KEY.COLOUR_INVALID });
  } else if (isColourUsedByOtherEntry(entry, otherEntries)) {
    errors.push({ field: 'colour', messageKey: PALETTE_ENTRY_ERROR_KEY.COLOUR_DUPLICATE });
  }

  if (!isPowerValid(entry.maxPowerPercent)) {
    errors.push({
      field: 'maxPowerPercent',
      messageKey: PALETTE_ENTRY_ERROR_KEY.MAX_POWER_INVALID,
      messageParameters: powerParameters,
    });
  }

  if (!isPowerValid(entry.minPowerPercent)) {
    errors.push({
      field: 'minPowerPercent',
      messageKey: PALETTE_ENTRY_ERROR_KEY.MIN_POWER_INVALID,
      messageParameters: powerParameters,
    });
  }

  if (hasMinPowerAboveMax(entry)) {
    errors.push({ field: 'minPowerPercent', messageKey: PALETTE_ENTRY_ERROR_KEY.MIN_POWER_ABOVE_MAX });
  }

  if (!isInRange(entry.speedMmPerMin, SPEED_MM_PER_MIN_MIN, SPEED_MM_PER_MIN_MAX)) {
    errors.push({
      field: 'speedMmPerMin',
      messageKey: PALETTE_ENTRY_ERROR_KEY.SPEED_INVALID,
      messageParameters: { min: SPEED_MM_PER_MIN_MIN, max: SPEED_MM_PER_MIN_MAX },
    });
  }

  if (!isPassCountValid(entry.passes)) {
    errors.push({
      field: 'passes',
      messageKey: PALETTE_ENTRY_ERROR_KEY.PASSES_INVALID,
      messageParameters: { min: PASSES_MIN, max: PASSES_MAX },
    });
  }

  if (!isInRange(entry.lineIntervalMm, LINE_INTERVAL_MM_MIN, LINE_INTERVAL_MM_MAX)) {
    errors.push({
      field: 'lineIntervalMm',
      messageKey: PALETTE_ENTRY_ERROR_KEY.LINE_INTERVAL_INVALID,
      messageParameters: { min: LINE_INTERVAL_MM_MIN, max: LINE_INTERVAL_MM_MAX },
    });
  }

  return errors;
};
