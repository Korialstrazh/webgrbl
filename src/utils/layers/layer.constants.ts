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
/** The key of the shading layer; it is not a colour, so it never matches a drawn colour. */
export const SHADING_LAYER_COLOUR = 'shading';

/** A colour is on the grey axis when its largest and smallest channel differ by at most this much (0 to 255). */
export const GREY_AXIS_TOLERANCE = 10;

export const COLOUR_CHANNEL_COUNT = 3;
