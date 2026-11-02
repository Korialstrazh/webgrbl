import { describe, expect, it } from 'vitest';
import type { PaletteEntry } from './interfaces/PaletteEntry';
import {
  DEFAULT_FILL_ENTRY,
  DEFAULT_PALETTE,
  DEFAULT_SHADING_ENTRY,
  LAYER_MODE,
  SHADING_ENTRY_ID,
} from './palette.constants';

const EXPECTED_FILL_LINE_INTERVAL_MM = 0.1;

const EXPECTED_ROWS: Array<Partial<PaletteEntry>> = [
  { name: 'Cut', colour: '#ff0000', mode: LAYER_MODE.LINE, maxPowerPercent: 100, speedMmPerMin: 300, passes: 3 },
  { name: 'Score', colour: '#0000ff', mode: LAYER_MODE.LINE, maxPowerPercent: 30, speedMmPerMin: 1500, passes: 1 },
  { name: 'Fill', colour: '#00a000', mode: LAYER_MODE.FILL, maxPowerPercent: 50, speedMmPerMin: 2000, passes: 1 },
  {
    id: SHADING_ENTRY_ID,
    colour: '#000000',
    mode: LAYER_MODE.FILL,
    maxPowerPercent: 60,
    speedMmPerMin: 2000,
    passes: 1,
  },
];

describe('DEFAULT_PALETTE', () => {
  it('matches the specified table', () => {
    expect(DEFAULT_PALETTE.entries).toHaveLength(EXPECTED_ROWS.length);
    EXPECTED_ROWS.forEach((expectedRow: Partial<PaletteEntry>, index: number) => {
      expect(DEFAULT_PALETTE.entries[index]).toMatchObject({ ...expectedRow, minPowerPercent: 0 });
    });
  });

  it('gives the fill entries a line interval of 0.1 mm', () => {
    expect(DEFAULT_FILL_ENTRY.lineIntervalMm).toBe(EXPECTED_FILL_LINE_INTERVAL_MM);
    expect(DEFAULT_SHADING_ENTRY.lineIntervalMm).toBe(EXPECTED_FILL_LINE_INTERVAL_MM);
  });

  it('is frozen with its entries, so no code can change the defaults', () => {
    expect(Object.isFrozen(DEFAULT_PALETTE)).toBe(true);
    expect(Object.isFrozen(DEFAULT_PALETTE.entries)).toBe(true);
    expect(DEFAULT_PALETTE.entries.every((entry: PaletteEntry): boolean => Object.isFrozen(entry))).toBe(true);
  });
});
