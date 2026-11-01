/**
 * Values of the layers section: how a dragged row is carried.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
/** The drag data type that carries the key of the dragged layer; Firefox only starts a drag when data is set. */
export const LAYER_DRAG_DATA_TYPE = 'text/plain';

/** A layer row is moved, not copied, to its new place. */
export const LAYER_DRAG_EFFECT = 'move';
