/**
 * Response variant: error code.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GRBL_RESPONSE_KIND } from '../grbl.constants';

export interface GrblErrorResponse {
  kind: typeof GRBL_RESPONSE_KIND.ERROR;
  code: number;
}
