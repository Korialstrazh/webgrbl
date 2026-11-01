/**
 * Gets the pieces of a scanline inside a paint area under the nonzero rule: a point is inside when the edges around it
 * do not cancel out. Each edge counts from its lower end up to, but not including, its upper end, so a line through a
 * vertex counts the vertex once.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getEdgeBandIndex } from './get.edge.band.index';
import type { ScanlineCrossing } from './interfaces/ScanlineCrossing';
import type { ScanlineSpan } from './interfaces/ScanlineSpan';
import type { ToolpathEdgeIndex } from './interfaces/ToolpathEdgeIndex';
import type { ToolpathPaintArea } from './interfaces/ToolpathPaintArea';
import { EDGE_VALUE_COUNT, EDGE_X0_OFFSET, EDGE_X1_OFFSET, EDGE_Y0_OFFSET, EDGE_Y1_OFFSET } from './toolpath.constants';

const NO_EDGES: Float64Array = new Float64Array(0);
const UPWARD_WINDING = 1;
const DOWNWARD_WINDING = -1;

/** Whether the scanline crosses the edge, counting the lower end of the edge but not the upper one. */
const isEdgeCrossed = (startY: number, endY: number, y: number): boolean =>
  Math.min(startY, endY) <= y && y < Math.max(startY, endY);

const getScanlineCrossings = (edges: Float64Array, y: number): ScanlineCrossing[] => {
  const crossings: ScanlineCrossing[] = [];

  for (let edgeStart = 0; edgeStart < edges.length; edgeStart += EDGE_VALUE_COUNT) {
    const startY: number = edges[edgeStart + EDGE_Y0_OFFSET] ?? 0;
    const endY: number = edges[edgeStart + EDGE_Y1_OFFSET] ?? 0;
    const isUpward: boolean = startY < endY;

    if (isEdgeCrossed(startY, endY, y)) {
      const startX: number = edges[edgeStart + EDGE_X0_OFFSET] ?? 0;
      const endX: number = edges[edgeStart + EDGE_X1_OFFSET] ?? 0;

      crossings.push({
        x: startX + ((y - startY) * (endX - startX)) / (endY - startY),
        winding: isUpward ? UPWARD_WINDING : DOWNWARD_WINDING,
      });
    }
  }

  return crossings.sort(
    (firstCrossing: ScanlineCrossing, secondCrossing: ScanlineCrossing): number => firstCrossing.x - secondCrossing.x,
  );
};

/** The edges of the band the scanline lies in. */
const getScanlineBandEdges = (edgeIndex: ToolpathEdgeIndex, y: number): Float64Array =>
  edgeIndex.bands[getEdgeBandIndex(edgeIndex, y)] ?? NO_EDGES;

export const getPaintAreaScanlineSpans = (paintArea: ToolpathPaintArea, y: number): ScanlineSpan[] => {
  const spans: ScanlineSpan[] = [];
  let windingSum = 0;
  let spanStartX = 0;

  for (const crossing of getScanlineCrossings(getScanlineBandEdges(paintArea.edgeIndex, y), y)) {
    const wasInside: boolean = windingSum !== 0;

    windingSum += crossing.winding;

    if (!wasInside) {
      spanStartX = crossing.x;
    } else if (!windingSum && crossing.x > spanStartX) {
      spans.push({ x0: spanStartX, x1: crossing.x });
    }
  }

  return spans;
};
