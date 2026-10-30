/**
 * Controller event: lines are in flight but the controller has been silent too long.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GRBL_CONTROLLER_EVENT_KIND } from '../grbl.constants';

export interface GrblNotRespondingEvent {
  kind: typeof GRBL_CONTROLLER_EVENT_KIND.NOT_RESPONDING;
}
