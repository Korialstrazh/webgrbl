/**
 * Constants of the element tree in the Objects card.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

/**
 * The tallest the element tree grows before it scrolls, until the panel is measured or where it cannot be (no
 * ResizeObserver); antd needs a height in pixels to render only the rows in view.
 */
export const ELEMENT_TREE_DEFAULT_VIEWPORT_HEIGHT_PX = 320;

/** The smallest viewport height the tree takes in a short panel, so it still shows several rows. */
export const ELEMENT_TREE_MIN_VIEWPORT_HEIGHT_PX = 240;

/** The share of the scrolling panel's height the tree may take, leaving room for the rest of the card. */
export const ELEMENT_TREE_PANEL_HEIGHT_SHARE = 0.6;
