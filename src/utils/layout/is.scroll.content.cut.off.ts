/**
 * Tells whether a scroll area has content below its visible part. A pixel of slack absorbs the fractional sizes a
 * zoomed page reports, so an area scrolled to its end never counts as cut off.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ScrollAreaMetrics } from './interfaces/ScrollAreaMetrics';

const SCROLL_END_SLACK_PX = 1;

export const isScrollContentCutOff = ({ scrollTop, clientHeight, scrollHeight }: ScrollAreaMetrics): boolean =>
  scrollTop + clientHeight < scrollHeight - SCROLL_END_SLACK_PX;
