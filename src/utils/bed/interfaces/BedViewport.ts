/**
 * What part of the bed is on screen: the zoom against the fitted bed and the bed point at the centre of the view,
 * in the bed SVG frame (millimetres from the back-left corner, Y pointing down). It lives for the session only.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BedViewport {
  /** 1 shows the whole bed fitted to the view; 2 shows it twice as large. */
  zoom: number;
  /** Bed X, in millimetres, at the centre of the view. */
  centerXMm: number;
  /** Bed SVG Y, in millimetres from the back edge, at the centre of the view. */
  centerYMm: number;
}
