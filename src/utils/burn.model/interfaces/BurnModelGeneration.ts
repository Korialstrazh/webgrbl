/**
 * A running burn model build: the model it will give, and a way to stop it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnModel } from './BurnModel';

export interface BurnModelGeneration {
  /** Resolves with the model, or rejects with a BurnModelWorkerError; never settles once cancelled. */
  promise: Promise<BurnModel>;
  /** Stops the build; does nothing once it has finished. */
  cancel(): void;
}
