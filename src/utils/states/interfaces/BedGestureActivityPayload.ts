/**
 * Payload of the action that says whether a drag or handle gesture on the bed has started or ended.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

export interface BedGestureActivityPayload {
  /** True while a pointer drags objects or a handle on the bed. */
  isBedGestureActive: boolean;
}
