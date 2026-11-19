/**
 * One ruler band worked out for the current view: the part of the bed in view along it, the band length on screen, the
 * scale, the label step and how a bed position along it turns into a screen offset.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BedRulerAxis {
  /** The first bed position in view along the band, in millimetres. */
  visibleStartMm: number;
  /** The last bed position in view along the band, in millimetres. */
  visibleEndMm: number;
  /** The band length on screen, which is the drawing's width or height, in CSS pixels. */
  bandLengthPx: number;
  /** How many CSS pixels one millimetre takes on screen. */
  pixelsPerMm: number;
  /** The distance between two labels, in millimetres; 0 while the view has no size. */
  labelStepMm: number;
  /** Turns a bed position along the band into its offset from the band start, in CSS pixels. */
  getOffsetPx: (valueMm: number) => number;
}
