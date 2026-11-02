/**
 * The toolpath worker could not build a toolpath, or the worker itself failed. Its message is for the developer log
 * only; the user sees a fixed message.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class ToolpathWorkerError extends Error {
  constructor(errorText: string) {
    super(errorText);
    this.name = 'ToolpathWorkerError';
  }
}
