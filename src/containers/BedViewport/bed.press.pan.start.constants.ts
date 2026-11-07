/**
 * Closed set of the ways a press on the bed view can start a pan.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const BED_PRESS_PAN_START = {
  /** The press pans at once and is kept from the objects layer. */
  IMMEDIATE: 'immediate',
  /** The press pans only once it has moved past the drag distance; the objects layer still gets it. */
  AFTER_DRAG: 'after-drag',
  /** The press never pans. */
  NONE: 'none',
} as const;

export type BedPressPanStart = (typeof BED_PRESS_PAN_START)[keyof typeof BED_PRESS_PAN_START];
