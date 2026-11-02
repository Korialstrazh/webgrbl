/**
 * Gets one keyboard step of a splitter bar in percent of the splitter: a fixed length in rem, so a step feels the same
 * on any screen and follows the user font size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { PANEL_SIZE_PERCENT_TOTAL, SPLITTER_KEYBOARD_STEP_REM } from '../layout.constants';

export const getSplitterStepPercent = (splitterSizePx: number, rootFontSizePx: number): number =>
  (splitterSizePx > 0 ? SPLITTER_KEYBOARD_STEP_REM * rootFontSizePx / splitterSizePx * PANEL_SIZE_PERCENT_TOTAL : 0);
