/**
 * What part of the bed is on screen: the zoom against the fitted bed and the bed point at the centre of the view,
 * in the bed SVG frame (millimetres from the back-left corner, Y pointing down). It lives for the session only.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BedViewport {
  /** 1 shows the whole bed fitted to the view; 2 shows it twice as large. */
  zoom: number;
  /** Bed X, in millimetres, at the centre of the view. */
  centerXMm: number;
  /** Bed SVG Y, in millimetres from the back edge, at the centre of the view. */
  centerYMm: number;
}
