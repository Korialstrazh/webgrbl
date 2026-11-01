/**
 * Values of the palette dialog: its overlay id, its width and the data of a row drag.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const PALETTE_DIALOG_OVERLAY_ID = 'palette-dialog';

/** Room for the colour list beside the form; antd keeps the dialog inside a narrower window. */
export const PALETTE_DIALOG_WIDTH = '56rem';

/** The drag data type that carries the id of the dragged entry; Firefox only starts a drag when data is set. */
export const PALETTE_DRAG_DATA_TYPE = 'text/plain';

/** A palette row is moved, not copied, to its new place. */
export const PALETTE_DRAG_EFFECT = 'move';
