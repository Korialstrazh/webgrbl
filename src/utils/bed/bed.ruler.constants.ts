/**
 * Sizes and steps of the bed rulers, which are drawn over the bed view in screen space, so their text keeps one size
 * at any zoom and panel size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

/** Must match the font size of the ruler labels in the BedRulers stylesheet. */
export const BED_RULER_FONT_SIZE_REM = 0.6875;

/** The gap between a ruler label and the bed edge or its tick position. */
export const BED_RULER_LABEL_OFFSET_REM = 0.25;

/** Two neighbouring labels are at least this far apart, so they never touch. */
export const BED_RULER_MIN_LABEL_SPACING_REM = 3.5;

/** Upper bound of a monospace digit's width as a share of the font size, to estimate a label's length. */
export const BED_RULER_DIGIT_WIDTH_FRACTION = 0.6;

/** The label steps the rulers choose from, in millimetres: the smallest one that keeps the labels apart wins. */
export const BED_RULER_STEPS_MM: readonly number[] = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000];
