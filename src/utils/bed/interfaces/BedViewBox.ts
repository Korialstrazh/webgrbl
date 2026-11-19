/**
 * The part of the bed SVG on screen, as the viewBox of the bed drawing, in millimetres.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BedViewBox {
  /** Bed X of the left edge of the view. */
  xMm: number;
  /** Bed SVG Y of the top edge of the view. */
  yMm: number;
  widthMm: number;
  heightMm: number;
}
