/**
 * Posts a message of the burn model worker, handing over the listed buffers instead of copying them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnModelWorkerMessage } from './BurnModelWorkerMessage';

export type BurnModelWorkerMessagePoster = (message: BurnModelWorkerMessage, transferables: Transferable[]) => void;
