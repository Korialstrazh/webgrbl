import { describe, expect, it } from 'vitest';
import { getPaletteEntryFromLayer } from './get.palette.entry.from.layer';
import type { ProjectLayer } from './interfaces/ProjectLayer';
import { DEFAULT_CUT_ENTRY } from '../palette/palette.constants';

const UNKNOWN_COLOUR = '#123456';
const CHANGED_SPEED = 777;
const LAYER_SETTINGS: ProjectLayer['settings'] = {
  mode: DEFAULT_CUT_ENTRY.mode,
  maxPowerPercent: DEFAULT_CUT_ENTRY.maxPowerPercent,
  minPowerPercent: DEFAULT_CUT_ENTRY.minPowerPercent,
  speedMmPerMin: CHANGED_SPEED,
  passes: DEFAULT_CUT_ENTRY.passes,
  airAssist: DEFAULT_CUT_ENTRY.airAssist,
  lineIntervalMm: DEFAULT_CUT_ENTRY.lineIntervalMm,
};

const newLayer = (overrides: Partial<ProjectLayer>): ProjectLayer => ({
  colour: UNKNOWN_COLOUR,
  enabled: true,
  order: 0,
  settings: LAYER_SETTINGS,
  paletteEntryId: undefined,
  isShading: false,
  ...overrides,
});

describe(getPaletteEntryFromLayer.name, () => {
  it('keeps the id, name and colour of a known entry and takes the layer settings', () => {
    expect(getPaletteEntryFromLayer(newLayer({ colour: DEFAULT_CUT_ENTRY.colour }), DEFAULT_CUT_ENTRY)).toEqual({
      ...DEFAULT_CUT_ENTRY,
      speedMmPerMin: CHANGED_SPEED,
    });
  });

  it('names a new entry after the colour of a layer that is not in the palette', () => {
    const entry = getPaletteEntryFromLayer(newLayer({}), undefined);

    expect(entry).toMatchObject({ name: UNKNOWN_COLOUR, colour: UNKNOWN_COLOUR, speedMmPerMin: CHANGED_SPEED });
    expect(entry.id).toBeTruthy();
  });
});
