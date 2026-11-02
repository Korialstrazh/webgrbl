/**
 * A keyboard move of one splitter bar: the current panel sizes and limits, the bar, and where it should go.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PanelSizeLimitsPercent } from './PanelSizeLimitsPercent';

export interface SplitterBarMove {
  /** Every panel size, in percent of the splitter. */
  sizePercents: readonly number[];
  /** The limits of every panel, in the same order. */
  limits: readonly PanelSizeLimitsPercent[];
  /** The bar between panel barIndex and panel barIndex + 1. */
  barIndex: number;
  /** The wanted bar position in percent; it is kept within the range of the bar. */
  targetPercent: number;
}
