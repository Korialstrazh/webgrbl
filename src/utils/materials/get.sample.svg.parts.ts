/**
 * Chooses what a new test sample draws so that it burns as a test. The square joins the red layer only when that
 * layer is on, in Line mode and burns after the gradient; otherwise it takes a colour of its own, whose new layer
 * comes last.
 * A project has one shading layer and only that layer burns a gradient, so with that layer off or in Line mode there is
 * no layer to use and the sample leaves the gradient out: the result it records is about the square alone.
 * Equal orders count as burning after the gradient, because getSampleJobLayers then puts the shading first.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getLayerKey } from '../layers/get.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { LAYER_MODE } from '../palette/palette.constants';
import type { LayerMode } from '../palette/palette.constants';
import type { SampleSvgParts } from './interfaces/SampleSvgParts';
import { SAMPLE_CUT_COLOUR } from './sample.job.constants';

const COLOUR_CHANNEL_MAX = 255;
const COLOUR_STEP = 16;
const HEX_RADIX = 16;
const HEX_CHANNEL_LENGTH = 2;
const HEX_PAD_CHARACTER = '0';

const isLayerBurningInMode = (layer: ProjectLayer, mode: LayerMode): boolean =>
  layer.enabled && layer.settings.mode === mode;

const getHexChannelText = (channel: number): string =>
  channel.toString(HEX_RADIX).padStart(HEX_CHANNEL_LENGTH, HEX_PAD_CHARACTER);

/** Reds that can be told apart first, then the same reds with some blue; the project has few layers, so this ends. */
const getFreeSampleCutColour = (layers: ProjectLayer[]): string => {
  const usedKeys: Set<string> = new Set<string>(layers.map(getLayerKey));

  for (let colourIndex = 1; ; colourIndex++) {
    const red: number = COLOUR_CHANNEL_MAX - (colourIndex % COLOUR_STEP) * COLOUR_STEP;
    const blue: number = Math.floor(colourIndex / COLOUR_STEP) * COLOUR_STEP;
    const colour: string = `#${getHexChannelText(red)}00${getHexChannelText(blue)}`;

    if (!usedKeys.has(colour)) {
      return colour;
    }
  }
};

export const getSampleSvgParts = (layers: ProjectLayer[]): SampleSvgParts => {
  const shadingLayer: ProjectLayer | undefined = layers.find((layer: ProjectLayer): boolean => layer.isShading);
  const redLayer: ProjectLayer | undefined = layers.find(
    (layer: ProjectLayer): boolean => getLayerKey(layer) === SAMPLE_CUT_COLOUR,
  );
  const hasGradient: boolean = !shadingLayer || isLayerBurningInMode(shadingLayer, LAYER_MODE.FILL);

  if (!redLayer) {
    return { cutColour: SAMPLE_CUT_COLOUR, hasGradient };
  }

  const burnsAfterGradient: boolean = !hasGradient || !shadingLayer || shadingLayer.order <= redLayer.order;
  const canJoinRedLayer: boolean = isLayerBurningInMode(redLayer, LAYER_MODE.LINE) && burnsAfterGradient;

  return { cutColour: canJoinRedLayer ? SAMPLE_CUT_COLOUR : getFreeSampleCutColour(layers), hasGradient };
};
