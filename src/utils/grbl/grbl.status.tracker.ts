import { getResolvedGrblPositions } from './grbl.position.resolver';
import type { GrblAxisPosition } from './interfaces/GrblAxisPosition';
import type { GrblResolvedPositions } from './interfaces/GrblResolvedPositions';
import type { GrblResolvedStatus } from './interfaces/GrblResolvedStatus';
import type { GrblStatusReport } from './interfaces/GrblStatusReport';

/**
 * Keeps the latest status report and the work coordinate offset GRBL reported last, which GRBL only repeats now
 * and then, so every report can carry both machine and work positions.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class GrblStatusTracker {
  /** The most recent status report, with resolved positions. */
  private latestStatus: GrblResolvedStatus | undefined;
  /** Last work coordinate offset GRBL reported. */
  private cachedWorkCoordinateOffset: GrblAxisPosition | undefined;

  /** Resolves the positions of a new report, remembers it and returns it. */
  public trackStatusReport(report: GrblStatusReport): GrblResolvedStatus {
    const positions: GrblResolvedPositions = getResolvedGrblPositions(report, this.cachedWorkCoordinateOffset);
    const status: GrblResolvedStatus = { ...report, ...positions };

    this.cachedWorkCoordinateOffset = positions.workCoordinateOffset;
    this.latestStatus = status;

    return status;
  }

  public getLatestStatus(): GrblResolvedStatus | undefined {
    return this.latestStatus;
  }

  /** Forgets the status and the cached offset, for a new connection. */
  public clearTrackedStatus(): void {
    this.latestStatus = undefined;
    this.cachedWorkCoordinateOffset = undefined;
  }
}
