/**
 * Gets the band of an edge index that a height falls in; heights outside the index go to its first or last band.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathEdgeBandLayout } from './interfaces/ToolpathEdgeBandLayout';

export const getEdgeBandIndex = ({ minY, bandHeightMm, bandCount }: ToolpathEdgeBandLayout, y: number): number =>
  Math.min(bandCount - 1, Math.max(0, Math.floor((y - minY) / bandHeightMm)));
