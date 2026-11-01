import { describe, expect, it } from 'vitest';
import { getInkscapePaletteText } from './get.inkscape.palette.text';
import { newPaletteEntry } from './new.palette.entry';
import { DEFAULT_PALETTE } from './palette.constants';

const EXPECTED_DEFAULT_TEXT = [
  'GIMP Palette',
  'Name: webgrbl',
  'Columns: 4',
  '#',
  '255   0   0 Cut',
  '  0   0 255 Score',
  '  0 160   0 Fill',
  '  0   0   0 Shading (black → white)',
  '',
].join('\n');

describe(getInkscapePaletteText.name, () => {
  it('writes the default palette exactly', () => {
    expect(getInkscapePaletteText(DEFAULT_PALETTE)).toBe(EXPECTED_DEFAULT_TEXT);
  });

  it('skips an entry whose colour cannot be read and flattens line breaks in names', () => {
    const text: string = getInkscapePaletteText({
      version: 1,
      entries: [newPaletteEntry({ colour: 'none' }), newPaletteEntry({ name: 'A\nB', colour: '#102030' })],
    });

    expect(text.endsWith(' 16  32  48 A B\n')).toBe(true);
    expect(text.split('\n')).toHaveLength(6);
  });
});
