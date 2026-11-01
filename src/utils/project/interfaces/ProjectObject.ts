/**
 * One imported SVG on the bed: its artwork, its natural size and its placement in machine millimetres.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ProjectObject {
  /** Stable id, also the key of the object's stored SVG text. */
  id: string;
  /** Display name, taken from the file name. */
  name: string;
  /** Sanitised SVG text. */
  svgText: string;
  /** Width of the artwork as imported, in millimetres. */
  intrinsicWidthMm: number;
  /** Height of the artwork as imported, in millimetres. */
  intrinsicHeightMm: number;
  /** X of the front-left corner of the unrotated box, in millimetres. */
  xMm: number;
  /** Y of the front-left corner of the unrotated box, in millimetres. */
  yMm: number;
  /** Width of the box after scaling, in millimetres. */
  widthMm: number;
  /** Height of the box after scaling, in millimetres. */
  heightMm: number;
  /** Counter-clockwise rotation around the box centre, in degrees. */
  rotationDeg: number;
}
