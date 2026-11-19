/**
 * Controller event: the controller reset itself (homing failure, its reset button, a brown-out) without the app
 * asking for it. The reset flushed its receive buffer, so the lines in flight were dropped and running work ended.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GRBL_CONTROLLER_EVENT_KIND } from '../grbl.constants';

export interface GrblControllerResetEvent {
  kind: typeof GRBL_CONTROLLER_EVENT_KIND.CONTROLLER_RESET;
}
