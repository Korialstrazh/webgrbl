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

/** How strongly one pixel of wheel movement zooms; a common wheel notch of 100 pixels zooms by about 16 %. */
export const BED_WHEEL_ZOOM_PER_PIXEL = 0.0015;

/** A wheel that reports in lines is turned into pixels with this line height. */
export const BED_WHEEL_LINE_HEIGHT_PX = 16;

/** A share of a length that marks its middle. */
export const BED_VIEW_CENTER_FRACTION = 0.5;
