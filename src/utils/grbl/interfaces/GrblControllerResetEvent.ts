/**
 * Controller event: the controller reset itself (homing failure, its reset button, a brown-out) without the app
 * asking for it. The reset flushed its receive buffer, so the lines in flight were dropped and running work ended.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GRBL_CONTROLLER_EVENT_KIND } from '../grbl.constants';

export interface GrblControllerResetEvent {
  kind: typeof GRBL_CONTROLLER_EVENT_KIND.CONTROLLER_RESET;
}
