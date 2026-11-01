/**
 * Where a pointer went down, in screen pixels, to tell a click from a drag.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface PointerPressOrigin {
  /** The pointer's screen position when it went down. */
  startClientX: number;
  startClientY: number;
}
