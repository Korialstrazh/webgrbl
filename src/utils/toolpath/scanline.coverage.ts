import type { ScanlineSpan } from './interfaces/ScanlineSpan';

/**
 * Tracks which pieces of one scanline are already covered while paint areas are laid on it from front to back.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class ScanlineCoverage {
  /** The covered pieces of the line, sorted from left to right and never overlapping. */
  private coveredSpans: ScanlineSpan[] = [];

  /** Marks the span as covered and gives the parts of it that were still visible. */
  public coverSpan(span: ScanlineSpan): ScanlineSpan[] {
    const visibleSpans: ScanlineSpan[] = [];
    const separateSpans: ScanlineSpan[] = [];
    const mergedSpan: ScanlineSpan = { ...span };
    let visibleStartX: number = span.x0;

    for (const coveredSpan of this.coveredSpans) {
      if (coveredSpan.x1 < span.x0 || coveredSpan.x0 > span.x1) {
        separateSpans.push(coveredSpan);

        continue;
      }

      if (coveredSpan.x0 > visibleStartX) {
        visibleSpans.push({ x0: visibleStartX, x1: coveredSpan.x0 });
      }

      visibleStartX = Math.max(visibleStartX, coveredSpan.x1);
      mergedSpan.x0 = Math.min(mergedSpan.x0, coveredSpan.x0);
      mergedSpan.x1 = Math.max(mergedSpan.x1, coveredSpan.x1);
    }

    if (visibleStartX < span.x1) {
      visibleSpans.push({ x0: visibleStartX, x1: span.x1 });
    }

    this.coveredSpans = [...separateSpans, mergedSpan].sort(
      (firstSpan: ScanlineSpan, secondSpan: ScanlineSpan): number => firstSpan.x0 - secondSpan.x0,
    );

    return visibleSpans;
  }
}
