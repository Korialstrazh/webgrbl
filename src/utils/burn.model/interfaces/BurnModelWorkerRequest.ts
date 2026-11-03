/**
 * What the burn model worker is asked to build.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnModelInput } from './BurnModelInput';

export interface BurnModelWorkerRequest extends BurnModelInput {
  /** Identifies the request, so an answer to an older one is never taken for the current one. */
  requestId: number;
}
