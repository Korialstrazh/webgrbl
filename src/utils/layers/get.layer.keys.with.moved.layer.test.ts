import { describe, expect, it } from 'vitest';
import { getLayerKeysWithMovedLayer } from './get.layer.keys.with.moved.layer';

const FIRST_KEY = 'first';
const SECOND_KEY = 'second';
const THIRD_KEY = 'third';
const UNKNOWN_KEY = 'unknown';
const KEYS: string[] = [FIRST_KEY, SECOND_KEY, THIRD_KEY];

describe(getLayerKeysWithMovedLayer.name, () => {
  it('moves a layer up into the place of the layer above', () => {
    expect(getLayerKeysWithMovedLayer(KEYS, THIRD_KEY, FIRST_KEY)).toEqual([THIRD_KEY, FIRST_KEY, SECOND_KEY]);
  });

  it('moves a layer down into the place of the layer below', () => {
    expect(getLayerKeysWithMovedLayer(KEYS, FIRST_KEY, THIRD_KEY)).toEqual([SECOND_KEY, THIRD_KEY, FIRST_KEY]);
  });

  it('gives the same keys back for the same layer or an unknown key', () => {
    expect(getLayerKeysWithMovedLayer(KEYS, FIRST_KEY, FIRST_KEY)).toBe(KEYS);
    expect(getLayerKeysWithMovedLayer(KEYS, UNKNOWN_KEY, FIRST_KEY)).toBe(KEYS);
    expect(getLayerKeysWithMovedLayer(KEYS, FIRST_KEY, UNKNOWN_KEY)).toBe(KEYS);
  });
});
