/**
 * Test double of the toolpath worker client. By default it runs getToolpath at once on the calling thread, so a test
 * store generates without a Web Worker. Held, it keeps every generation running until the test resolves or rejects
 * it, and counts the generations cancelled while still running.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getToolpath } from '../get.toolpath';
import type { HeldToolpathGeneration } from './interfaces/HeldToolpathGeneration';
import type { Toolpath } from '../interfaces/Toolpath';
import type { ToolpathGeneration } from '../interfaces/ToolpathGeneration';
import type { ToolpathGenerationInput } from '../interfaces/ToolpathGenerationInput';
import type { ToolpathProgressListener } from '../interfaces/ToolpathProgressListener';
import type { ToolpathWorkerClient } from '../interfaces/ToolpathWorkerClient';
import { doNothing } from '../../do.nothing';

const NO_HELD_GENERATION_MESSAGE = 'No held toolpath generation at this index';

export class FakeToolpathWorkerClient implements ToolpathWorkerClient {
  // The input of every generation asked for, oldest first.
  public readonly generationInputs: ToolpathGenerationInput[] = [];

  // How many generations were cancelled while they were still running.
  public cancelledGenerationCount = 0;

  // How many times the client was disposed.
  public disposeCount = 0;

  // Whether generations wait for the test instead of finishing at once.
  private readonly isHeld: boolean;

  // The generations of a held client, oldest first.
  private readonly heldGenerations: HeldToolpathGeneration[] = [];

  constructor(isHeld: boolean = false) {
    this.isHeld = isHeld;
  }

  public generate(input: ToolpathGenerationInput, onProgress: ToolpathProgressListener): ToolpathGeneration {
    this.generationInputs.push(input);

    if (!this.isHeld) {
      return {
        promise: Promise.resolve(getToolpath(input.drawables, input.warnings, input.layers, onProgress)),
        cancel: doNothing,
      };
    }

    return this.getHeldGeneration(input, onProgress);
  }

  public dispose(): void {
    this.disposeCount++;
  }

  /** Finishes a held generation with the toolpath of its input. */
  public resolveHeldGeneration(generationIndex: number): void {
    const heldGeneration: HeldToolpathGeneration = this.getRunningGeneration(generationIndex);
    const { input } = heldGeneration;

    heldGeneration.isRunning = false;
    heldGeneration.resolve(getToolpath(input.drawables, input.warnings, input.layers, heldGeneration.onProgress));
  }

  /** Fails a held generation with the given error. */
  public rejectHeldGeneration(generationIndex: number, error: Error): void {
    const heldGeneration: HeldToolpathGeneration = this.getRunningGeneration(generationIndex);

    heldGeneration.isRunning = false;
    heldGeneration.reject(error);
  }

  private getRunningGeneration(generationIndex: number): HeldToolpathGeneration {
    const heldGeneration: HeldToolpathGeneration | undefined = this.heldGenerations[generationIndex];

    if (!heldGeneration) {
      throw new Error(NO_HELD_GENERATION_MESSAGE);
    }

    return heldGeneration;
  }

  private getHeldGeneration(input: ToolpathGenerationInput, onProgress: ToolpathProgressListener): ToolpathGeneration {
    let heldGeneration: HeldToolpathGeneration | undefined;
    const promise: Promise<Toolpath> = new Promise<Toolpath>((resolve, reject) => {
      heldGeneration = { input, onProgress, resolve, reject, isRunning: true };
      this.heldGenerations.push(heldGeneration);
    });

    return {
      promise,
      cancel: (): void => {
        if (heldGeneration?.isRunning) {
          heldGeneration.isRunning = false;
          this.cancelledGenerationCount++;
        }
      },
    };
  }
}
