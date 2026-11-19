/**
 * Where one splitter bar is and how far it may go, in percent of the splitter from its start edge.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface SplitterBarRange {
  /** The bar position: the sizes of the panels before it added up. */
  positionPercent: number;
  /** The smallest position the limits of the two panels beside the bar allow. */
  minPercent: number;
  /** The largest position the limits of the two panels beside the bar allow. */
  maxPercent: number;
}
