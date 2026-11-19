/**
 * A generation of the fake toolpath worker client that waits for the test to finish it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Toolpath } from '../../interfaces/Toolpath';
import type { ToolpathGenerationInput } from '../../interfaces/ToolpathGenerationInput';
import type { ToolpathProgressListener } from '../../interfaces/ToolpathProgressListener';

export interface HeldToolpathGeneration {
  /** What the generation was asked to build. */
  input: ToolpathGenerationInput;
  /** Receives the share of the work done. */
  onProgress: ToolpathProgressListener;
  /** Finishes the generation with a toolpath. */
  resolve: (toolpath: Toolpath) => void;
  /** Fails the generation. */
  reject: (error: Error) => void;
  /** Whether the generation has neither finished nor been cancelled. */
  isRunning: boolean;
}
