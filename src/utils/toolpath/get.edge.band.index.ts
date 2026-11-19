/**
 * Gets the band of an edge index that a height falls in; heights outside the index go to its first or last band.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToolpathEdgeBandLayout } from './interfaces/ToolpathEdgeBandLayout';

export const getEdgeBandIndex = ({ minY, bandHeightMm, bandCount }: ToolpathEdgeBandLayout, y: number): number =>
  Math.min(bandCount - 1, Math.max(0, Math.floor((y - minY) / bandHeightMm)));
