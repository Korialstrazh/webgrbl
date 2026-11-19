/**
 * Controller event: lines are in flight but the controller has been silent too long.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GRBL_CONTROLLER_EVENT_KIND } from '../grbl.constants';

export interface GrblNotRespondingEvent {
  kind: typeof GRBL_CONTROLLER_EVENT_KIND.NOT_RESPONDING;
}
