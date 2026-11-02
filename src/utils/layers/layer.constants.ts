/**
 * Fixed values of project layers: the key of the shading layer and the width of the grey axis.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../localization/default.locales';
import { LAYER_MODE } from '../palette/palette.constants';
import type { LayerMode } from '../palette/palette.constants';

/** The key of the shading layer; it is not a colour, so it never matches a drawn colour. */
export const SHADING_LAYER_COLOUR = 'shading';

/** A colour is on the grey axis when its largest and smallest channel differ by at most this much (0 to 255). */
export const GREY_AXIS_TOLERANCE = 10;

export const COLOUR_CHANNEL_COUNT = 3;

/** Sort ranks for new layers: colours of the palette first, unknown colours after them. */
export const PALETTE_COLOUR_RANK = 0;
export const UNKNOWN_COLOUR_RANK = 1;
/** Within one kind of colour, fill layers burn before line layers. */
export const FILL_MODE_RANK = 0;
export const LINE_MODE_RANK = 1;
/** The order value before the first layer, so the first layer gets 0. */
export const NO_LAYER_ORDER = -1;
/** How many SVG texts keep their read paints; enough for a full project and its undo history. */
export const OBJECT_PAINTS_CACHE_SIZE = 200;
/** Watts are shown with one decimal. */
export const LAYER_WATTS_DECIMALS = 1;
/** The text of each layer mode, for the layer summary and the mode switch. */
export const LAYER_MODE_LABEL_KEY: Record<LayerMode, string> = {
  [LAYER_MODE.LINE]: DEFAULT.LAYER_MODE_LINE,
  [LAYER_MODE.FILL]: DEFAULT.LAYER_MODE_FILL,
};
/** The ends of the bar that stands for the shading layer: darkest burns with the maximum power. */
export const SHADING_BAR_DARK_COLOUR = '#000000';
export const SHADING_BAR_LIGHT_COLOUR = '#ffffff';
