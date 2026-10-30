/**
 * Controller event: the connection dropped without a disconnect.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GRBL_CONTROLLER_EVENT_KIND } from '../grbl.constants';

export interface GrblConnectionLostEvent {
  kind: typeof GRBL_CONTROLLER_EVENT_KIND.CONNECTION_LOST;
}
