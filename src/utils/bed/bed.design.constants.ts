/**
 * Fixed values of the Design view drawing: which paint of a shape a drawn path stands for, and how many objects keep
 * their read drawing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

/** Which paint of an SVG shape a design path draws: its fill area or its stroke along the outline. */
export const DESIGN_PAINT_ROLE = {
  FILL: 'fill',
  STROKE: 'stroke',
} as const;

export type DesignPaintRole = typeof DESIGN_PAINT_ROLE[keyof typeof DESIGN_PAINT_ROLE];

/** How many objects keep their read design drawing; enough for a full project and its undo history. */
export const OBJECT_DESIGN_DRAWING_CACHE_SIZE = 200;

/** Joins the parts of the key that tells cached design drawings apart. */
export const DESIGN_DRAWING_KEY_SEPARATOR = '\u0000';

/** Joins the paint role, the layer key and the index of a run of design paths into its React key. */
export const DESIGN_RUN_KEY_SEPARATOR = ':';

/** Starts the id of a gradient drawn in the Design view. */
export const DESIGN_GRADIENT_ID_PREFIX = 'design-gradient';
