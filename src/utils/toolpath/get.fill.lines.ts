/**
 * Gets the scanlines of a fill layer from the bottom to the top of its shapes, one per line interval, each with its
 * burnt pieces. The artwork is followed in paint order, so other paint on top hides the layer; lines that burn nothing
 * are left out. Touching pieces at the same power are joined.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getRunFillSegments } from './get.run.fill.segments';
import type { FillLine } from './interfaces/FillLine';
import type { FillLineHeight } from './interfaces/FillLineHeight';
import type { FillLinesInput } from './interfaces/FillLinesInput';
import type { FillSegment } from './interfaces/FillSegment';
import type { ToolpathBounds } from './interfaces/ToolpathBounds';
import type { ToolpathPaintArea } from './interfaces/ToolpathPaintArea';
import { getScanlineRuns } from './rasterize.scanline';
import { FILL_LINE_COUNT_EPSILON, SCANLINE_EDGE_INSET_MM } from './toolpath.constants';
import { getLayerKey } from '../layers/get.layer.key';

const getLayerAreasBounds = (paintAreas: ToolpathPaintArea[], layerKey: string): ToolpathBounds | undefined => {
  let layerBounds: ToolpathBounds | undefined;

  for (const { bounds, layerKey: areaLayerKey } of paintAreas) {
    if (areaLayerKey === layerKey) {
      layerBounds = layerBounds
        ? {
          minX: Math.min(layerBounds.minX, bounds.minX),
          minY: Math.min(layerBounds.minY, bounds.minY),
          maxX: Math.max(layerBounds.maxX, bounds.maxX),
          maxY: Math.max(layerBounds.maxY, bounds.maxY),
        }
        : bounds;
    }
  }

  return layerBounds;
};

/** Whether the piece starts where the previous one ends and burns at the same power. */
const isSegmentContinuation = (
  previousSegment: FillSegment | undefined,
  segment: FillSegment,
): previousSegment is FillSegment =>
  !!previousSegment && previousSegment.x1 === segment.x0 && previousSegment.powerPercent === segment.powerPercent;

/** Pieces that touch and burn at the same power become one, so the line has no needless moves. */
const getJoinedSegments = (segments: FillSegment[]): FillSegment[] => {
  const joinedSegments: FillSegment[] = [];

  for (const segment of segments) {
    const lastSegment: FillSegment | undefined = joinedSegments.at(-1);

    if (isSegmentContinuation(lastSegment, segment)) {
      joinedSegments[joinedSegments.length - 1] = { ...lastSegment, x1: segment.x1 };
    } else {
      joinedSegments.push(segment);
    }
  }

  return joinedSegments;
};

const getFillLine = ({ paintAreas, layer }: FillLinesInput, { y, sampleY }: FillLineHeight): FillLine => {
  const layerKey: string = getLayerKey(layer);
  const segments: FillSegment[] = [];

  for (const run of getScanlineRuns(paintAreas, sampleY)) {
    if (run.paintArea.layerKey === layerKey) {
      segments.push(...getRunFillSegments(run, layer, sampleY));
    }
  }

  return { y, segments: getJoinedSegments(segments) };
};

export const getFillLines = (input: FillLinesInput): FillLine[] => {
  const { paintAreas, layer } = input;
  const layerBounds: ToolpathBounds | undefined = getLayerAreasBounds(paintAreas, getLayerKey(layer));
  const lineIntervalMm: number = layer.settings.lineIntervalMm;

  if (!layerBounds || lineIntervalMm <= 0) {
    return [];
  }

  const heightMm: number = layerBounds.maxY - layerBounds.minY;
  const lineCount: number = Math.floor(heightMm / lineIntervalMm + FILL_LINE_COUNT_EPSILON) + 1;
  const fillLines: FillLine[] = [];

  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const y: number = layerBounds.minY + lineIndex * lineIntervalMm;
    const sampleY: number = Math.min(
      layerBounds.maxY - SCANLINE_EDGE_INSET_MM,
      Math.max(layerBounds.minY + SCANLINE_EDGE_INSET_MM, y),
    );
    const fillLine: FillLine = getFillLine(input, { y, sampleY });

    if (fillLine.segments.length) {
      fillLines.push(fillLine);
    }
  }

  return fillLines;
};
