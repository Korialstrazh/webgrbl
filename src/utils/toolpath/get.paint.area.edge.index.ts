/**
 * Sorts the edges of a paint area into horizontal bands, so finding the edges a scanline crosses does not scan every
 * edge of a large area. The band count grows with the square root of the edge count, which keeps both the band count
 * and the edges per band small. An edge is put into every band it reaches.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getEdgeBandIndex } from './get.edge.band.index';
import type { ToolpathBounds } from './interfaces/ToolpathBounds';
import type { ToolpathEdgeBandLayout } from './interfaces/ToolpathEdgeBandLayout';
import type { ToolpathEdgeIndex } from './interfaces/ToolpathEdgeIndex';
import { EDGE_BAND_COUNT_MAX, EDGE_VALUE_COUNT, EDGE_Y0_OFFSET, EDGE_Y1_OFFSET } from './toolpath.constants';

export const getPaintAreaEdgeIndex = (edges: Float64Array, bounds: ToolpathBounds): ToolpathEdgeIndex => {
  const edgeCount: number = edges.length / EDGE_VALUE_COUNT;
  const heightMm: number = bounds.maxY - bounds.minY;
  const bandCount: number = heightMm > 0
    ? Math.min(EDGE_BAND_COUNT_MAX, Math.max(1, Math.ceil(Math.sqrt(edgeCount))))
    : 1;
  const bandLayout: ToolpathEdgeBandLayout = {
    minY: bounds.minY,
    bandHeightMm: heightMm > 0 ? heightMm / bandCount : 1,
    bandCount,
  };
  const bandValues: number[][] = Array.from({ length: bandCount }, (): number[] => []);

  for (let edgeStart = 0; edgeStart < edges.length; edgeStart += EDGE_VALUE_COUNT) {
    const startY: number = edges[edgeStart + EDGE_Y0_OFFSET] ?? 0;
    const endY: number = edges[edgeStart + EDGE_Y1_OFFSET] ?? 0;
    const lastBandIndex: number = getEdgeBandIndex(bandLayout, Math.max(startY, endY));

    const firstBandIndex: number = getEdgeBandIndex(bandLayout, Math.min(startY, endY));

    for (let bandIndex = firstBandIndex; bandIndex <= lastBandIndex; bandIndex++) {
      bandValues[bandIndex]?.push(...edges.subarray(edgeStart, edgeStart + EDGE_VALUE_COUNT));
    }
  }

  return { ...bandLayout, bands: bandValues.map((values: number[]): Float64Array => Float64Array.from(values)) };
};
