/**
 * Payload of a finished burn model.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnModel } from '../../burn.model/interfaces/BurnModel';

export interface BurnModelReadyPayload {
  /** The finished model. */
  model: BurnModel;
}
