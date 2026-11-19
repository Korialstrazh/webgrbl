/**
 * Any message the burn model worker posts back.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnModelWorkerErrorMessage } from './BurnModelWorkerErrorMessage';
import type { BurnModelWorkerResultMessage } from './BurnModelWorkerResultMessage';

export type BurnModelWorkerMessage = BurnModelWorkerResultMessage | BurnModelWorkerErrorMessage;
