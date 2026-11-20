import { describe, expect, it } from 'vitest';
import { DEFAULT_CUT_ENTRY } from '../palette/palette.constants';
import { getLayerSettings } from './get.layer.settings';
import type { ProjectLayer } from './interfaces/ProjectLayer';
import { isProjectLayer } from './is.project.layer';

const OLD_LAYER: ProjectLayer = {
  colour: DEFAULT_CUT_ENTRY.colour,
  enabled: true,
  order: 0,
  settings: getLayerSettings(DEFAULT_CUT_ENTRY),
  paletteEntryId: DEFAULT_CUT_ENTRY.id,
  isShading: false,
};

describe(isProjectLayer.name, () => {
  it('accepts an old layer without a preset id and one with a preset id', () => {
    expect(isProjectLayer(OLD_LAYER)).toBe(true);
    expect(isProjectLayer({ ...OLD_LAYER, presetId: 'p1' })).toBe(true);
  });

  it('still accepts a layer whose preset id is malformed, because the loaders drop it', () => {
    expect(isProjectLayer({ ...OLD_LAYER, presetId: 7 })).toBe(true);
  });
});
