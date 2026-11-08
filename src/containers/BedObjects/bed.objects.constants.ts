/**
 * Sizes, distances and test ids of the objects drawn on the bed; lengths are in millimetres, the user unit of the bed
 * SVG, unless the name says otherwise.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  ARROW_DOWN_KEY,
  ARROW_LEFT_KEY,
  ARROW_RIGHT_KEY,
  ARROW_UP_KEY,
  BACKSPACE_KEY,
  DELETE_KEY,
} from '../../utils/browser/browser.events.constants';
import type { BedMachinePoint } from './interfaces/BedMachinePoint';

export const BED_OBJECTS_SURFACE_TEST_ID = 'bed-objects-surface';
export const BED_OBJECT_OUTSIDE_OUTLINE_TEST_ID = 'bed-object-outside-outline';
export const BED_OBJECT_HIT_AREA_TEST_ID = 'bed-object-hit-area';
/** Gap between an object's box and its selection box, so the box does not hide the artwork's edge. */
export const SELECTION_BOX_PADDING_MM = 1;
/** Side of a square corner handle of the selection box, used while the bed's screen scale is not known. */
export const SELECTION_HANDLE_SIZE_MM = 4;
/** Length of the arm from the selection box to the rotate handle, used while the bed's screen scale is not known. */
export const ROTATE_HANDLE_ARM_MM = 8;
/** Side of a handle on screen, so a handle stays easy to grab however small a large bed is drawn. */
export const SELECTION_HANDLE_SIZE_PX = 10;
/** Length of the arm to the rotate handle on screen. */
export const ROTATE_HANDLE_ARM_PX = 24;
export const BED_OBJECT_HANDLE_TEST_ID = 'bed-object-handle';
/** The handles of a single selected object: four corners that scale it and one above the box that turns it. */
export const BED_OBJECT_HANDLE = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  ROTATE: 'rotate',
} as const;
export type BedObjectHandle = typeof BED_OBJECT_HANDLE[keyof typeof BED_OBJECT_HANDLE];
export type BedObjectScaleHandle = Exclude<BedObjectHandle, typeof BED_OBJECT_HANDLE.ROTATE>;
/** The corner handles in drawing order, clockwise from the top left. */
export const SCALE_HANDLES: readonly BedObjectScaleHandle[] = [
  BED_OBJECT_HANDLE.TOP_LEFT,
  BED_OBJECT_HANDLE.TOP_RIGHT,
  BED_OBJECT_HANDLE.BOTTOM_RIGHT,
  BED_OBJECT_HANDLE.BOTTOM_LEFT,
];
/** The corner of the unrotated box each scale handle sits on: +1 is right or back (up on screen), -1 left or front. */
export const SCALE_HANDLE_CORNER_SIGNS: Record<BedObjectScaleHandle, BedMachinePoint> = {
  [BED_OBJECT_HANDLE.TOP_LEFT]: { x: -1, y: 1 },
  [BED_OBJECT_HANDLE.TOP_RIGHT]: { x: 1, y: 1 },
  [BED_OBJECT_HANDLE.BOTTOM_RIGHT]: { x: 1, y: -1 },
  [BED_OBJECT_HANDLE.BOTTOM_LEFT]: { x: -1, y: -1 },
};
/** The direction an arrow key moves the selection, in the machine frame: ArrowUp moves away from the user (+Y). */
export const NUDGE_DIRECTION_BY_KEY: Record<string, BedMachinePoint> = {
  [ARROW_UP_KEY]: { x: 0, y: 1 },
  [ARROW_DOWN_KEY]: { x: 0, y: -1 },
  [ARROW_LEFT_KEY]: { x: -1, y: 0 },
  [ARROW_RIGHT_KEY]: { x: 1, y: 0 },
};
/** The keys that remove the selection. */
export const DELETE_SELECTION_KEYS: readonly string[] = [DELETE_KEY, BACKSPACE_KEY];
/** A pointer that travels less than this many screen pixels before it comes up is a click, not a drag. */
export const DRAG_START_DISTANCE_PX = 3;
/** Stretches an object's artwork to its box, so a free scale shows as it will be cut. */
export const SVG_PRESERVE_ASPECT_RATIO_NONE = 'none';

/** The id of the focusable group of bed objects, where focus lands after an import from the Job card. */
export const BED_OBJECTS_LAYER_ID = 'bed-objects';
