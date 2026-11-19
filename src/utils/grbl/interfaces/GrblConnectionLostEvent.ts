/**
 * Controller event: the connection dropped without a disconnect.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GRBL_CONTROLLER_EVENT_KIND } from '../grbl.constants';

export interface GrblConnectionLostEvent {
  kind: typeof GRBL_CONTROLLER_EVENT_KIND.CONNECTION_LOST;
}
