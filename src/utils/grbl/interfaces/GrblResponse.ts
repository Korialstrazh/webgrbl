/**
 * Any line a GRBL controller can send, told apart by its kind.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
