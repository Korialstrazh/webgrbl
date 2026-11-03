/**
 * Posts a message of the burn model worker, handing over the listed buffers instead of copying them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnModelWorkerMessage } from './BurnModelWorkerMessage';

export type BurnModelWorkerMessagePoster = (message: BurnModelWorkerMessage, transferables: Transferable[]) => void;
