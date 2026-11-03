/**
 * Any message the burn model worker posts back.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnModelWorkerErrorMessage } from './BurnModelWorkerErrorMessage';
import type { BurnModelWorkerResultMessage } from './BurnModelWorkerResultMessage';

export type BurnModelWorkerMessage = BurnModelWorkerResultMessage | BurnModelWorkerErrorMessage;
