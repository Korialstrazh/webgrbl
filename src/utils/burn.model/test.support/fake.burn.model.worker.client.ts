/**
 * Test double of the burn model worker client. By default it runs getBurnModel at once on the calling thread. Held, it
 * keeps every build running until the test resolves or rejects it, and counts the builds cancelled while still running.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { doNothing } from '../../do.nothing';
import { getBurnModel } from '../get.burn.model';
import type { BurnModel } from '../interfaces/BurnModel';
import type { BurnModelGeneration } from '../interfaces/BurnModelGeneration';
import type { BurnModelInput } from '../interfaces/BurnModelInput';
import type { BurnModelWorkerClient } from '../interfaces/BurnModelWorkerClient';
import type { HeldBurnModelGeneration } from './interfaces/HeldBurnModelGeneration';

const NO_HELD_GENERATION_MESSAGE = 'No held burn model build at this index';

export class FakeBurnModelWorkerClient implements BurnModelWorkerClient {
  // The input of every build asked for, oldest first.
  public readonly generationInputs: BurnModelInput[] = [];

  // How many builds were cancelled while they were still running.
  public cancelledGenerationCount = 0;

  // How many times the client was disposed.
  public disposeCount = 0;

  // Whether builds wait for the test instead of finishing at once.
  private readonly isHeld: boolean;

  // The builds of a held client, oldest first.
  private readonly heldGenerations: HeldBurnModelGeneration[] = [];

  constructor(isHeld: boolean = false) {
    this.isHeld = isHeld;
  }

  public generate(input: BurnModelInput): BurnModelGeneration {
    this.generationInputs.push(input);

    if (!this.isHeld) {
      return { promise: Promise.resolve(getBurnModel(input)), cancel: doNothing };
    }

    return this.getHeldGeneration(input);
  }

  public dispose(): void {
    this.disposeCount++;
  }

  /** Finishes a held build with the model of its input. */
  public resolveHeldGeneration(generationIndex: number): void {
    const heldGeneration: HeldBurnModelGeneration = this.getGeneration(generationIndex);

    heldGeneration.isRunning = false;
    heldGeneration.resolve(getBurnModel(heldGeneration.input));
  }

  /** Fails a held build with the given error. */
  public rejectHeldGeneration(generationIndex: number, error: Error): void {
    const heldGeneration: HeldBurnModelGeneration = this.getGeneration(generationIndex);

    heldGeneration.isRunning = false;
    heldGeneration.reject(error);
  }

  private getGeneration(generationIndex: number): HeldBurnModelGeneration {
    const heldGeneration: HeldBurnModelGeneration | undefined = this.heldGenerations[generationIndex];

    if (!heldGeneration) {
      throw new Error(NO_HELD_GENERATION_MESSAGE);
    }

    return heldGeneration;
  }

  private getHeldGeneration(input: BurnModelInput): BurnModelGeneration {
    let heldGeneration: HeldBurnModelGeneration | undefined;
    const promise: Promise<BurnModel> = new Promise<BurnModel>((
      resolve: (model: BurnModel) => void,
      reject: (reason: unknown) => void,
    ) => {
      heldGeneration = { input, resolve, reject, isRunning: true };
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
