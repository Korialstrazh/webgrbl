/**
 * Tells whether a scroll area has content below its visible part. A pixel of slack absorbs the fractional sizes a
 * zoomed page reports, so an area scrolled to its end never counts as cut off.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ScrollAreaMetrics } from './interfaces/ScrollAreaMetrics';

const SCROLL_END_SLACK_PX = 1;

export const isScrollContentCutOff = ({ scrollTop, clientHeight, scrollHeight }: ScrollAreaMetrics): boolean =>
  scrollTop + clientHeight < scrollHeight - SCROLL_END_SLACK_PX;
