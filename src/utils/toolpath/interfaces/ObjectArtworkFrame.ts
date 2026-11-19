/**
 * Where an object's drawn geometry sits inside its box (the SVG page), as fractions of the box size measured from the
 * box's top-left corner with Y down. A box filled edge to edge by its drawing is { 0, 0, 1, 1 }.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ObjectArtworkFrame {
  /** Gap from the box's left edge to the geometry, as a fraction of the box width. */
  leftFraction: number;
  /** Gap from the box's top edge to the geometry, as a fraction of the box height. */
  topFraction: number;
  /** Geometry width as a fraction of the box width. */
  widthFraction: number;
  /** Geometry height as a fraction of the box height. */
  heightFraction: number;
}
