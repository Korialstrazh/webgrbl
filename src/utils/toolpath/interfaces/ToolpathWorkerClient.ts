/**
 * Builds toolpaths away from the main thread, so the app stays responsive. Tests pass a fake that builds at once.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
