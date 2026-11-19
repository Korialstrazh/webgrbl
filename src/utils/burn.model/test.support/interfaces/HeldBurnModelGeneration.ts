/**
 * A burn model build of the fake client that waits for the test.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnModel } from '../../interfaces/BurnModel';
import type { BurnModelInput } from '../../interfaces/BurnModelInput';

export interface HeldBurnModelGeneration {
  /** What the build was asked to make. */
  input: BurnModelInput;
  /** Finishes the build with a model. */
  resolve: (model: BurnModel) => void;
  /** Fails the build. */
  reject: (error: Error) => void;
  /** Whether the build has neither finished nor been cancelled. */
  isRunning: boolean;
}
