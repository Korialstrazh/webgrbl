/**
 * A running toolpath generation: the toolpath it will give, and a way to stop it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Toolpath } from './Toolpath';

export interface ToolpathGeneration {
  /** Resolves with the toolpath, or rejects with a ToolpathWorkerError; never settles once cancelled. */
  promise: Promise<Toolpath>;
  /** Stops the generation; does nothing once it has finished. */
  cancel(): void;
}
