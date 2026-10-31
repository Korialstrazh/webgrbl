/**
 * What the not-responding watchdog needs from the controller it watches.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblControllerEvent } from './GrblControllerEvent';
import type { GrblResolvedStatus } from './GrblResolvedStatus';

export interface GrblNotRespondingWatchdogHost {
  /** True while at least one sent line waits for its answer. */
  hasInFlightLines(): boolean;
  /** The latest status report, if any. */
  getLatestStatus(): GrblResolvedStatus | undefined;
  /** Tells every controller event listener about an event. */
  emitEvent(event: GrblControllerEvent): void;
}
