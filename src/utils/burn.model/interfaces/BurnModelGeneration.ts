/**
 * A running burn model build: the model it will give, and a way to stop it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnModel } from './BurnModel';

export interface BurnModelGeneration {
  /** Resolves with the model, or rejects with a BurnModelWorkerError; never settles once cancelled. */
  promise: Promise<BurnModel>;
  /** Stops the build; does nothing once it has finished. */
  cancel(): void;
}
