/**
 * Both bed rulers on screen: where each runs and the labels along it, in CSS pixels of the view.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedRulerLabel } from './BedRulerLabel';

export interface BedRulerLayout {
  /** The top ruler runs along the back edge of the bed, or along the top of the view once that edge is scrolled off. */
  topRulerYPx: number;
  /** The left ruler runs along the bed's left edge, or along the left of the view once that edge is scrolled off. */
  leftRulerXPx: number;
  /** Labels of bed X along the top ruler; each is written to the right of its position. */
  topLabels: BedRulerLabel[];
  /** Labels of machine Y along the left ruler; each is written above its position. */
  leftLabels: BedRulerLabel[];
}
