/**
 * Holds the bed point under the pointer for the status strip, outside redux: the pointer moves many times per frame,
 * so a new point is handed to the readers at most once per animation frame, and the store never fills the redux log.
 * The readers subscribe through useSyncExternalStore. Undefined while the pointer is not over the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedCursorPoint } from './interfaces/BedCursorPoint';

class BedCursorStore {
  // The point the readers see.
  private shownPoint: BedCursorPoint | undefined = undefined;

  // The latest point, shown at the next frame.
  private pendingPoint: BedCursorPoint | undefined = undefined;

  // The id of the requested frame, while one is requested; frame ids start at 1.
  private frameRequestId: number | undefined = undefined;

  // The readers to tell when the shown point changes.
  private readonly listeners: Set<() => void> = new Set<() => void>();

  public subscribeToBedCursor = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  public getBedCursorPoint = (): BedCursorPoint | undefined => this.shownPoint;

  /** Hands the point to the readers at the next frame; undefined clears the readout once the pointer leaves. */
  public setBedCursorPoint(point: BedCursorPoint | undefined): void {
    this.pendingPoint = point;

    if (!this.frameRequestId) {
      this.frameRequestId = requestAnimationFrame(this.showPendingPoint);
    }
  }

  private readonly showPendingPoint = (): void => {
    this.frameRequestId = undefined;
    this.shownPoint = this.pendingPoint;

    for (const listener of this.listeners) {
      listener();
    }
  };
}

export const BED_CURSOR_STORE: BedCursorStore = new BedCursorStore();
