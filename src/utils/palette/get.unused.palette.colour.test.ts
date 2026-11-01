import { describe, expect, it } from 'vitest';
import { getUnusedPaletteColour } from './get.unused.palette.colour';
import { newPaletteEntry } from './new.palette.entry';
import { DEFAULT_PALETTE, NEW_PALETTE_ENTRY_COLOUR_CANDIDATES } from './palette.constants';

const FIRST_CANDIDATE: string = NEW_PALETTE_ENTRY_COLOUR_CANDIDATES[0] ?? '';
const SECOND_CANDIDATE: string = NEW_PALETTE_ENTRY_COLOUR_CANDIDATES[1] ?? '';
const HEX_COLOUR_PATTERN = /^#[0-9a-f]{6}$/;

describe(getUnusedPaletteColour.name, () => {
  it('gives the first candidate for the default palette', () => {
    expect(getUnusedPaletteColour(DEFAULT_PALETTE.entries)).toBe(FIRST_CANDIDATE);
  });

  it('skips a candidate another entry uses, whatever its letter case', () => {
    const takenEntry = newPaletteEntry({ colour: FIRST_CANDIDATE.toUpperCase() });

    expect(getUnusedPaletteColour([takenEntry])).toBe(SECOND_CANDIDATE);
  });

  it('computes a colour no entry uses when every candidate is taken', () => {
    const takenEntries = NEW_PALETTE_ENTRY_COLOUR_CANDIDATES.map((colour: string) => newPaletteEntry({ colour }));
    const computedColour: string = getUnusedPaletteColour(takenEntries);

    expect(computedColour).toMatch(HEX_COLOUR_PATTERN);
    expect(NEW_PALETTE_ENTRY_COLOUR_CANDIDATES).not.toContain(computedColour);
  });
});
