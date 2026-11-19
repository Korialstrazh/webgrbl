/**
 * The burn model worker could not build a model, or the worker itself failed. Its message is for the developer log
 * only; the user sees a fixed message.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class BurnModelWorkerError extends Error {
  constructor(errorText: string) {
    super(errorText);
    this.name = 'BurnModelWorkerError';
  }
}
