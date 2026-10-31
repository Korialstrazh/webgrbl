/**
 * Any line a GRBL controller can send, told apart by its kind.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblAlarmResponse } from './GrblAlarmResponse';
import type { GrblBannerResponse } from './GrblBannerResponse';
import type { GrblErrorResponse } from './GrblErrorResponse';
import type { GrblFeedbackResponse } from './GrblFeedbackResponse';
import type { GrblOkResponse } from './GrblOkResponse';
import type { GrblOtherResponse } from './GrblOtherResponse';
import type { GrblSettingResponse } from './GrblSettingResponse';
import type { GrblStatusResponse } from './GrblStatusResponse';

export type GrblResponse =
  | GrblOkResponse
  | GrblErrorResponse
  | GrblAlarmResponse
  | GrblStatusResponse
  | GrblBannerResponse
  | GrblSettingResponse
  | GrblFeedbackResponse
  | GrblOtherResponse;
