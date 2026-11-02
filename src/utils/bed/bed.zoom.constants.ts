/**
 * Limits and steps of the bed zoom and pan.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

/** The bed never gets smaller than half its fitted size, so it cannot be lost as a dot. */
export const MIN_BED_ZOOM = 0.5;

/** 40 times the fitted size shows tenths of a millimetre on a common bed, which is as fine as a laser burns. */
export const MAX_BED_ZOOM = 40;

/** One click on a zoom button or one zoom key press makes the bed this much larger or smaller. */
export const BED_ZOOM_STEP_FACTOR = 1.25;

/**
 * How strongly one pixel of wheel movement zooms. A wheel notch is 100 to 240 pixels on common systems, so one notch
 * zooms by 6 to 15 %, fine enough to inspect a detail.
 */
export const BED_WHEEL_ZOOM_PER_PIXEL = 0.0006;

/** A wheel that reports in lines is turned into pixels with this line height. */
export const BED_WHEEL_LINE_HEIGHT_PX = 16;

/**
 * The screen pixels Fit leaves free on each side of the bed, so its edges never touch the rulers or the panel border.
 * A view too small for the margin fits the bed edge to edge.
 */
export const BED_FIT_MARGIN_PX = 16;

/** The zoom of the fitted bed, shown as 100 % with a fit note. */
export const BED_FIT_ZOOM_PERCENT = 100;

/** A share of a length that marks its middle. */
export const BED_VIEW_CENTER_FRACTION = 0.5;
