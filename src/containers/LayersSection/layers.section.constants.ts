/**
 * Values of the layers section: how a dragged row is carried.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
/** The drag data type that carries the key of the dragged layer; Firefox only starts a drag when data is set. */
export const LAYER_DRAG_DATA_TYPE = 'text/plain';

/** A layer row is moved, not copied, to its new place. */
export const LAYER_DRAG_EFFECT = 'move';

/** Carries a layer row's key, so a touch drag of the handle finds the row under the finger. */
export const LAYER_ROW_KEY_ATTRIBUTE = 'data-layer-key';
export const LAYER_ROW_KEY_SELECTOR = `[${LAYER_ROW_KEY_ATTRIBUTE}]`;

/** A mouse drags the whole row natively; touch and pen have no native drag, so they drag the handle by pointer. */
export const MOUSE_POINTER_TYPE = 'mouse';
