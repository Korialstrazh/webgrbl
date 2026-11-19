/**
 * A keyboard move of one splitter bar: the current panel sizes and limits, the bar, and where it should go.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
