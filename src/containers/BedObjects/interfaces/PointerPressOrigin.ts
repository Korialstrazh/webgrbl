/**
 * Where a pointer went down, in screen pixels, to tell a click from a drag.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface PointerPressOrigin {
  /** The pointer's screen position when it went down. */
  startClientX: number;
  startClientY: number;
}
