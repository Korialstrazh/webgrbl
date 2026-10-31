/**
 * Response variant: status report.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GRBL_RESPONSE_KIND } from '../grbl.constants';
import type { GrblStatusReport } from './GrblStatusReport';

export interface GrblStatusResponse {
  kind: typeof GRBL_RESPONSE_KIND.STATUS;
  report: GrblStatusReport;
}
