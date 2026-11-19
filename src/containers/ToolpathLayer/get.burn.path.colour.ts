/**
 * Gets how one burn path group is coloured: a power band class for the burnt moves in power shading; otherwise, and
 * always for the moves still to come, its layer colour, or the bed ink class for the shading layer. So a weak layer,
 * such as a light score, still shows in its own colour before the head reaches it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { SHADING_LAYER_COLOUR } from '../../utils/layers/layer.constants';
import { TOOLPATH_BURN_STATE } from '../../utils/toolpath/toolpath.drawing.constants';
import type { ToolpathBurnState } from '../../utils/toolpath/toolpath.drawing.constants';
import type { ToolpathStrokePath } from '../../utils/toolpath/interfaces/ToolpathStrokePath';
import type { BurnPathColour } from './interfaces/BurnPathColour';
import styles from './styles.module.scss';
import { POWER_BAND_CLASS_NAME_PREFIX } from './toolpath.layer.constants';

export const getBurnPathColour = (strokePath: ToolpathStrokePath, burnState: ToolpathBurnState): BurnPathColour => {
  // eslint-disable-next-line no-restricted-syntax -- band 0 (the weakest power) is distinct from no band
  if (strokePath.powerBand !== undefined && burnState === TOOLPATH_BURN_STATE.BURNT) {
    return { colourClassName: styles[POWER_BAND_CLASS_NAME_PREFIX + strokePath.powerBand], strokeColour: undefined };
  }

  if (strokePath.layerKey === SHADING_LAYER_COLOUR) {
    return { colourClassName: styles.shadingLayer, strokeColour: undefined };
  }

  return { colourClassName: undefined, strokeColour: strokePath.layerKey };
};
