/**
 * The burn model worker could not build a model, or the worker itself failed. Its message is for the developer log
 * only; the user sees a fixed message.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class BurnModelWorkerError extends Error {
  constructor(errorText: string) {
    super(errorText);
    this.name = 'BurnModelWorkerError';
  }
}
