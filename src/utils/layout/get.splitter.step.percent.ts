/**
 * Gets one keyboard step of a splitter bar in percent of the splitter: a fixed length in rem, so a step feels the same
 * on any screen and follows the user font size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { PANEL_SIZE_PERCENT_TOTAL, SPLITTER_KEYBOARD_STEP_REM } from '../layout.constants';

export const getSplitterStepPercent = (splitterSizePx: number, rootFontSizePx: number): number =>
  (splitterSizePx > 0 ? SPLITTER_KEYBOARD_STEP_REM * rootFontSizePx / splitterSizePx * PANEL_SIZE_PERCENT_TOTAL : 0);
