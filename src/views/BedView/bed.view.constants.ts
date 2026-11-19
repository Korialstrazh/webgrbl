/**
 * Sizes, offsets and test ids of the bed drawing; lengths are in millimetres, the user unit of the bed SVG.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const BED_HEAD_TEST_ID = 'bed-head';
export const BED_WORK_ORIGIN_TEST_ID = 'bed-work-origin';
export const CROSSHAIR_ARM_MM = 12;
/** The empty space around the head's centre dot, so lines and dots under the head stay visible. */
export const CROSSHAIR_GAP_MM = 4;
/** The head's centre dot, the exact point the laser sits on. */
export const HEAD_DOT_RADIUS_MM = 0.9;
/** A shooter-style reticle: four thin arms that start past the gap around the centre dot. */
export const HEAD_RETICLE_PATH: string = [
  `M${-CROSSHAIR_ARM_MM} 0H${-CROSSHAIR_GAP_MM}`,
  `M${CROSSHAIR_GAP_MM} 0H${CROSSHAIR_ARM_MM}`,
  `M0 ${-CROSSHAIR_ARM_MM}V${-CROSSHAIR_GAP_MM}`,
  `M0 ${CROSSHAIR_GAP_MM}V${CROSSHAIR_ARM_MM}`,
].join('');
export const WORK_ORIGIN_MARKER_RADIUS_MM = 3;
export const ARIA_SENTENCE_SEPARATOR = '. ';
export const VIEW_BOX_SEPARATOR = ' ';
