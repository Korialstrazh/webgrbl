/**
 * Gets the visible pieces of one scanline across all paint areas, following the paint order: later areas lie on top,
 * the topmost paint wins each piece, and every area is filled under the nonzero rule. The pieces of a white area are
 * kept, so it covers what is under it; the caller burns only the pieces of the layer it rasterises.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getPaintAreaScanlineSpans } from './get.paint.area.scanline.spans';
import type { ScanlineRun } from './interfaces/ScanlineRun';
import type { ToolpathPaintArea } from './interfaces/ToolpathPaintArea';
import { ScanlineCoverage } from './scanline.coverage';

const isScanlineInArea = (paintArea: ToolpathPaintArea, y: number): boolean =>
  paintArea.bounds.minY <= y && y <= paintArea.bounds.maxY;

export const getScanlineRuns = (paintAreas: ToolpathPaintArea[], y: number): ScanlineRun[] => {
  const coverage: ScanlineCoverage = new ScanlineCoverage();
  const runs: ScanlineRun[] = [];

  for (let areaIndex = paintAreas.length - 1; areaIndex >= 0; areaIndex--) {
    const paintArea: ToolpathPaintArea | undefined = paintAreas[areaIndex];

    if (paintArea && isScanlineInArea(paintArea, y)) {
      for (const span of getPaintAreaScanlineSpans(paintArea, y)) {
        for (const visibleSpan of coverage.coverSpan(span)) {
          runs.push({ ...visibleSpan, paintArea });
        }
      }
    }
  }

  return runs.sort((firstRun: ScanlineRun, secondRun: ScanlineRun): number => firstRun.x0 - secondRun.x0);
};
