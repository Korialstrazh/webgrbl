/**
 * Response variant: welcome banner.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GRBL_RESPONSE_KIND } from '../grbl.constants';
import type { GrblFirmwareIdentity } from './GrblFirmwareIdentity';

export interface GrblBannerResponse {
  kind: typeof GRBL_RESPONSE_KIND.BANNER;
  identity: GrblFirmwareIdentity;
}
