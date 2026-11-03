/**
 * A burn model build of the fake client that waits for the test.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
