/**
 * Controller event: the controller raised ALARM:N.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GRBL_CONTROLLER_EVENT_KIND } from '../grbl.constants';

export interface GrblAlarmEvent {
  kind: typeof GRBL_CONTROLLER_EVENT_KIND.GRBL_ALARM;
  /** GRBL alarm code. */
  code: number;
}
