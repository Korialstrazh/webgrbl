/**
 * A running toolpath generation: the toolpath it will give, and a way to stop it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Toolpath } from './Toolpath';

export interface ToolpathGeneration {
  /** Resolves with the toolpath, or rejects with a ToolpathWorkerError; never settles once cancelled. */
  promise: Promise<Toolpath>;
  /** Stops the generation; does nothing once it has finished. */
  cancel(): void;
}
