/**
 * Payload of a finished burn model.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnModel } from '../../burn.model/interfaces/BurnModel';

export interface BurnModelReadyPayload {
  /** The finished model. */
  model: BurnModel;
}
