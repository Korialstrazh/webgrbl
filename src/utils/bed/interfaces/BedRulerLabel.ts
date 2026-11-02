/**
 * One ruler label on screen: the bed coordinate it shows and where it sits along its ruler, in CSS pixels.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BedRulerLabel {
  /** The bed coordinate the label shows, in millimetres (machine frame: X from the left, Y from the front). */
  valueMm: number;
  /** Where the label's position lies along its ruler, from the left or top edge of the view. */
  offsetPx: number;
}
