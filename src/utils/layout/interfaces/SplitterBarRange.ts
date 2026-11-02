/**
 * Where one splitter bar is and how far it may go, in percent of the splitter from its start edge.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SplitterBarRange {
  /** The bar position: the sizes of the panels before it added up. */
  positionPercent: number;
  /** The smallest position the limits of the two panels beside the bar allow. */
  minPercent: number;
  /** The largest position the limits of the two panels beside the bar allow. */
  maxPercent: number;
}
