/**
 * One ruler label on screen: the bed coordinate it shows and where it sits along its ruler, in CSS pixels.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BedRulerLabel {
  /** The bed coordinate the label shows, in millimetres (machine frame: X from the left, Y from the front). */
  valueMm: number;
  /** Where the label's position lies along its ruler, from the left or top edge of the view. */
  offsetPx: number;
}
