import { describe, expect, it } from 'vitest';
import { getPaletteEntryErrors } from './get.palette.entry.errors';
import type { PaletteEntry } from './interfaces/PaletteEntry';
import type { PaletteEntryFieldError } from './interfaces/PaletteEntryFieldError';
import { newPaletteEntry } from './new.palette.entry';
import { PALETTE_ENTRY_ERROR_KEY, POWER_PERCENT_MAX, POWER_PERCENT_MIN } from './palette.constants';

const getErrorFields = (entry: PaletteEntry): Array<keyof PaletteEntry> =>
  getPaletteEntryErrors(entry).map((error: PaletteEntryFieldError): keyof PaletteEntry => error.field);

describe(getPaletteEntryErrors.name, () => {
  it('finds no error in a default entry', () => {
    expect(getPaletteEntryErrors(newPaletteEntry())).toEqual([]);
  });

  it('reports power above 100', () => {
    expect(getPaletteEntryErrors(newPaletteEntry({ maxPowerPercent: 101 }))).toEqual([
      {
        field: 'maxPowerPercent',
        messageKey: PALETTE_ENTRY_ERROR_KEY.MAX_POWER_INVALID,
        messageParameters: { min: POWER_PERCENT_MIN, max: POWER_PERCENT_MAX },
      },
    ]);
  });

  it('reports speed 0', () => {
    expect(getErrorFields(newPaletteEntry({ speedMmPerMin: 0 }))).toEqual(['speedMmPerMin']);
  });

  it('reports passes 0 and fractional passes', () => {
    expect(getErrorFields(newPaletteEntry({ passes: 0 }))).toEqual(['passes']);
    expect(getErrorFields(newPaletteEntry({ passes: 1.5 }))).toEqual(['passes']);
  });

  it('reports a line interval of 5', () => {
    expect(getErrorFields(newPaletteEntry({ lineIntervalMm: 5 }))).toEqual(['lineIntervalMm']);
  });

  it('reports minimum power above maximum power', () => {
    expect(getPaletteEntryErrors(newPaletteEntry({ minPowerPercent: 50, maxPowerPercent: 20 }))).toEqual([
      { field: 'minPowerPercent', messageKey: PALETTE_ENTRY_ERROR_KEY.MIN_POWER_ABOVE_MAX },
    ]);
  });

  it('reports an empty name and an unusable colour', () => {
    expect(getErrorFields(newPaletteEntry({ name: '  ', colour: 'none' }))).toEqual(['name', 'colour']);
  });
});
