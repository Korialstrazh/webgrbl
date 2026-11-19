/**
 * What the burn model worker is asked to build.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnModelInput } from './BurnModelInput';

export interface BurnModelWorkerRequest extends BurnModelInput {
  /** Identifies the request, so an answer to an older one is never taken for the current one. */
  requestId: number;
}
