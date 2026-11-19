/**
 * Payload of the action that says whether a drag or handle gesture on the bed has started or ended.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export interface BedGestureActivityPayload {
  /** True while a pointer drags objects or a handle on the bed. */
  isBedGestureActive: boolean;
}
