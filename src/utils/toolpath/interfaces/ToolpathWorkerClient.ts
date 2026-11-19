/**
 * Builds toolpaths away from the main thread, so the app stays responsive. Tests pass a fake that builds at once.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToolpathGeneration } from './ToolpathGeneration';
import type { ToolpathGenerationInput } from './ToolpathGenerationInput';
import type { ToolpathProgressListener } from './ToolpathProgressListener';

export interface ToolpathWorkerClient {
  /** Starts building the toolpath of the input and reports its progress to onProgress. */
  generate(input: ToolpathGenerationInput, onProgress: ToolpathProgressListener): ToolpathGeneration;
  /** Stops any running generation and frees the worker; a later generation starts a new one. */
  dispose(): void;
}
