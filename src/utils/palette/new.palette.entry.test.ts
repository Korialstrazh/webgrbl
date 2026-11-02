import { describe, expect, it } from 'vitest';
import { getPaletteEntryErrors } from './get.palette.entry.errors';
import { newPaletteEntry } from './new.palette.entry';

const OVERRIDE_NAME = 'Mark';
const OVERRIDE_PASSES = 2;

describe(newPaletteEntry.name, () => {
  it('creates a valid entry without arguments', () => {
    expect(getPaletteEntryErrors(newPaletteEntry())).toEqual([]);
  });

  it('creates a new id each time', () => {
    expect(newPaletteEntry().id).not.toBe(newPaletteEntry().id);
  });

  it('applies overrides', () => {
    expect(newPaletteEntry({ name: OVERRIDE_NAME, passes: OVERRIDE_PASSES })).toMatchObject({
      name: OVERRIDE_NAME,
      passes: OVERRIDE_PASSES,
    });
  });
});
