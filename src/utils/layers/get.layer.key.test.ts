import { getLayerKey } from './get.layer.key';
import { SHADING_LAYER_COLOUR } from './layer.constants';
import { DEFAULT_CUT_ENTRY } from '../palette/palette.constants';
import type { ProjectLayer } from './interfaces/ProjectLayer';

const BASE_LAYER: ProjectLayer = {
  colour: DEFAULT_CUT_ENTRY.colour,
  enabled: true,
  order: 0,
  settings: DEFAULT_CUT_ENTRY,
  paletteEntryId: DEFAULT_CUT_ENTRY.id,
  isShading: false,
};

describe(getLayerKey.name, () => {
  it('is the colour for a colour layer', () => {
    expect(getLayerKey(BASE_LAYER)).toBe(DEFAULT_CUT_ENTRY.colour);
  });

  it('is the shading constant for the shading layer whatever its colour', () => {
    expect(getLayerKey({ ...BASE_LAYER, isShading: true })).toBe(SHADING_LAYER_COLOUR);
  });
});
