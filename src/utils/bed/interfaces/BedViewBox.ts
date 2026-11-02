/**
 * The part of the bed SVG on screen, as the viewBox of the bed drawing, in millimetres.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BedViewBox {
  /** Bed X of the left edge of the view. */
  xMm: number;
  /** Bed SVG Y of the top edge of the view. */
  yMm: number;
  widthMm: number;
  heightMm: number;
}
