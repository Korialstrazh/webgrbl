/**
 * Builds burn models away from the main thread, so the app stays responsive. Tests pass a fake that builds at once.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnModelGeneration } from './BurnModelGeneration';
import type { BurnModelInput } from './BurnModelInput';

export interface BurnModelWorkerClient {
  /** Starts building the model of the input. */
  generate(input: BurnModelInput): BurnModelGeneration;
  /** Stops any running build and frees the worker; a later build starts a new one. */
  dispose(): void;
}
