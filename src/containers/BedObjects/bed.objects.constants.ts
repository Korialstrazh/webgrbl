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
export const BED_OBJECTS_SURFACE_TEST_ID = 'bed-objects-surface';
export const BED_OBJECT_OUTSIDE_OUTLINE_TEST_ID = 'bed-object-outside-outline';
/** Gap between an object's box and its selection box, so the box does not hide the artwork's edge. */
export const SELECTION_BOX_PADDING_MM = 1;
/** Side of a square corner handle of the selection box. */
export const SELECTION_HANDLE_SIZE_MM = 4;
/** A pointer that travels less than this many screen pixels before it comes up is a click, not a drag. */
export const DRAG_START_DISTANCE_PX = 3;
/** Stretches an object's artwork to its box, so a free scale shows as it will be cut. */
export const SVG_PRESERVE_ASPECT_RATIO_NONE = 'none';
