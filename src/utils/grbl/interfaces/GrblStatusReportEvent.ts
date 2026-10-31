/**
 * Controller event: a status report arrived.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GRBL_CONTROLLER_EVENT_KIND } from '../grbl.constants';
import type { GrblResolvedStatus } from './GrblResolvedStatus';

export interface GrblStatusReportEvent {
  kind: typeof GRBL_CONTROLLER_EVENT_KIND.STATUS_REPORT;
  status: GrblResolvedStatus;
}
