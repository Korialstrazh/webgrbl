import { getDerivedLayers } from './get.derived.layers';
import { SHADING_LAYER_COLOUR } from './layer.constants';
import { getLayerKey } from './get.layer.key';
import {
  DEFAULT_CUT_ENTRY,
  DEFAULT_FILL_ENTRY,
  DEFAULT_PALETTE,
  DEFAULT_SCORE_ENTRY,
  DEFAULT_SHADING_ENTRY,
  LAYER_MODE,
} from '../palette/palette.constants';
import type { ProjectLayer } from './interfaces/ProjectLayer';
import type { SvgPaint } from '../svg/geometry/interfaces/SvgPaint';
import { SVG_GRADIENT_KIND, SVG_GRADIENT_UNITS } from '../svg/geometry/svg.geometry.constants';
import type { SvgGreyGradient } from '../svg/geometry/interfaces/SvgGreyGradient';

const BLACK = '#000000';
const WHITE = '#ffffff';
const GREY = '#808080';
const ORANGE = '#ff8800';
const NEAR_FILL_GREEN = '#00ff00';
const CHANGED_SPEED = 777;

const getPaint = (colour: string, gradient?: SvgGreyGradient): SvgPaint => ({ colour, opacity: 1, gradient });

const getLinearGradient = (firstColour: string, lastColour: string): SvgGreyGradient => ({
  kind: SVG_GRADIENT_KIND.LINEAR,
  stops: [
    { offset: 0, colour: firstColour, opacity: 1 },
    { offset: 1, colour: lastColour, opacity: 1 },
  ],
  x1: 0,
  y1: 0,
  x2: 1,
  y2: 0,
  units: SVG_GRADIENT_UNITS.OBJECT_BOUNDING_BOX,
});

const getKeys = (layers: ProjectLayer[]): string[] => layers.map(getLayerKey);

describe(getDerivedLayers.name, () => {
  it('gives palette colours the settings of their entries, enabled', () => {
    const layers: ProjectLayer[] = getDerivedLayers(
      [[getPaint(DEFAULT_CUT_ENTRY.colour), getPaint(DEFAULT_SCORE_ENTRY.colour)]],
      DEFAULT_PALETTE,
      [],
    );

    expect(layers).toHaveLength(2);

    const cutLayer: ProjectLayer | undefined = layers.find(
      (layer: ProjectLayer): boolean => layer.paletteEntryId === DEFAULT_CUT_ENTRY.id,
    );

    expect(cutLayer?.enabled).toBe(true);
    expect(cutLayer?.settings.passes).toBe(DEFAULT_CUT_ENTRY.passes);
    expect(layers.some((layer: ProjectLayer): boolean => layer.paletteEntryId === DEFAULT_SCORE_ENTRY.id)).toBe(true);
  });

  it('maps greys and all-grey gradients to one shading layer', () => {
    const layers: ProjectLayer[] = getDerivedLayers(
      [[getPaint(GREY), getPaint(BLACK), getPaint(BLACK, getLinearGradient(BLACK, WHITE))]],
      DEFAULT_PALETTE,
      [],
    );

    expect(layers).toHaveLength(1);
    expect(layers[0]?.isShading).toBe(true);
    expect(layers[0]?.paletteEntryId).toBe(DEFAULT_SHADING_ENTRY.id);
    expect(getKeys(layers)).toEqual([SHADING_LAYER_COLOUR]);
  });

  it('maps a gradient with a colour stop to its first stop colour', () => {
    const layers: ProjectLayer[] = getDerivedLayers(
      [[getPaint(DEFAULT_CUT_ENTRY.colour, getLinearGradient(DEFAULT_CUT_ENTRY.colour, WHITE))]],
      DEFAULT_PALETTE,
      [],
    );

    expect(getKeys(layers)).toEqual([DEFAULT_CUT_ENTRY.colour]);
  });

  it('gives an unknown colour a disabled layer with the settings of the nearest entry', () => {
    const layers: ProjectLayer[] = getDerivedLayers([[getPaint(ORANGE)]], DEFAULT_PALETTE, []);

    expect(layers).toHaveLength(1);
    expect(layers[0]?.enabled).toBe(false);
    expect(layers[0]?.paletteEntryId).toBeUndefined();
    expect(layers[0]?.colour).toBe(ORANGE);
    expect(layers[0]?.settings.passes).toBe(DEFAULT_CUT_ENTRY.passes);
    expect(layers[0]?.settings.maxPowerPercent).toBe(DEFAULT_CUT_ENTRY.maxPowerPercent);
  });

  it('keeps the settings of existing layers', () => {
    const existingLayer: ProjectLayer = {
      colour: DEFAULT_CUT_ENTRY.colour,
      enabled: false,
      order: 0,
      settings: { ...DEFAULT_CUT_ENTRY, speedMmPerMin: CHANGED_SPEED },
      paletteEntryId: DEFAULT_CUT_ENTRY.id,
      isShading: false,
    };
    const layers: ProjectLayer[] = getDerivedLayers(
      [[getPaint(DEFAULT_CUT_ENTRY.colour), getPaint(DEFAULT_SCORE_ENTRY.colour)]],
      DEFAULT_PALETTE,
      [existingLayer],
    );

    expect(layers).toHaveLength(2);
    expect(layers[0]).toEqual(existingLayer);
    expect(layers[1]?.order).toBeGreaterThan(existingLayer.order);
  });

  it('orders fill and shading before cut and score', () => {
    const layers: ProjectLayer[] = getDerivedLayers(
      [
        [getPaint(DEFAULT_CUT_ENTRY.colour), getPaint(DEFAULT_SCORE_ENTRY.colour)],
        [getPaint(GREY), getPaint(DEFAULT_FILL_ENTRY.colour)],
      ],
      DEFAULT_PALETTE,
      [],
    );

    expect(getKeys(layers)).toEqual([
      DEFAULT_FILL_ENTRY.colour,
      SHADING_LAYER_COLOUR,
      DEFAULT_CUT_ENTRY.colour,
      DEFAULT_SCORE_ENTRY.colour,
    ]);
    expect(layers.map((layer: ProjectLayer): number => layer.order)).toEqual([0, 1, 2, 3]);
  });

  it('places unknown colours after the palette colours of the same mode', () => {
    const layers: ProjectLayer[] = getDerivedLayers(
      [[getPaint(ORANGE), getPaint(DEFAULT_SCORE_ENTRY.colour)]],
      DEFAULT_PALETTE,
      [],
    );

    expect(getKeys(layers)).toEqual([DEFAULT_SCORE_ENTRY.colour, ORANGE]);
  });

  it('maps a gradient that mixes grey and colour stops to its first non-grey stop', () => {
    const layers: ProjectLayer[] = getDerivedLayers(
      [[getPaint(BLACK, getLinearGradient(BLACK, DEFAULT_CUT_ENTRY.colour))]],
      DEFAULT_PALETTE,
      [],
    );

    expect(getKeys(layers)).toEqual([DEFAULT_CUT_ENTRY.colour]);
  });

  it('places an unknown colour after the palette colours even when it is a fill', () => {
    const layers: ProjectLayer[] = getDerivedLayers(
      [[getPaint(DEFAULT_CUT_ENTRY.colour), getPaint(DEFAULT_SCORE_ENTRY.colour), getPaint(NEAR_FILL_GREEN)]],
      DEFAULT_PALETTE,
      [],
    );

    expect(getKeys(layers)).toEqual([DEFAULT_CUT_ENTRY.colour, DEFAULT_SCORE_ENTRY.colour, NEAR_FILL_GREEN]);
    expect(layers[2]?.settings.mode).toBe(LAYER_MODE.FILL);
  });

  it('gives no layers for no paints', () => {
    expect(getDerivedLayers([], DEFAULT_PALETTE, [])).toEqual([]);
  });
});
