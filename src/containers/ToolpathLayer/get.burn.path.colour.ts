/**
 * Gets how one burn path group is coloured: a power band class in power shading; otherwise its layer colour, or the
 * bed ink class for the shading layer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { SHADING_LAYER_COLOUR } from '../../utils/layers/layer.constants';
import type { ToolpathStrokePath } from '../../utils/toolpath/interfaces/ToolpathStrokePath';
import type { BurnPathColour } from './interfaces/BurnPathColour';
import styles from './styles.module.scss';
import { POWER_BAND_CLASS_NAME_PREFIX } from './toolpath.layer.constants';

export const getBurnPathColour = (strokePath: ToolpathStrokePath): BurnPathColour => {
  // eslint-disable-next-line no-restricted-syntax -- band 0 (the weakest power) is distinct from no band
  if (strokePath.powerBand !== undefined) {
    return { colourClassName: styles[POWER_BAND_CLASS_NAME_PREFIX + strokePath.powerBand], strokeColour: undefined };
  }

  if (strokePath.layerKey === SHADING_LAYER_COLOUR) {
    return { colourClassName: styles.shadingLayer, strokeColour: undefined };
  }

  return { colourClassName: undefined, strokeColour: strokePath.layerKey };
};
