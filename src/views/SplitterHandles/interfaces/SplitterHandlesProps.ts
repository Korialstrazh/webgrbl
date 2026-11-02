/**
 * Props of SplitterHandles: the panel sizes and limits of one splitter, its direction, the bar names and the move
 * callback.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PanelSizeLimitsPercent } from '../../../utils/layout/interfaces/PanelSizeLimitsPercent';

export interface SplitterHandlesProps {
  /** Every panel size, in percent of the splitter, start edge first. */
  sizePercents: readonly number[];
  /** The limits of every panel, in the same order. */
  limits: readonly PanelSizeLimitsPercent[];
  /** Whether the panels are stacked top to bottom. */
  isVertical: boolean;
  /** One arrow key step, in percent of the splitter. */
  stepPercent: number;
  /** The accessible name of each bar, start edge first. */
  barLabels: readonly string[];
  /** Called with every panel size after a key moved a bar. */
  onSizesChange: (sizePercents: number[]) => void;
}
