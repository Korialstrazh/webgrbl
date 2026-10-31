/**
 * Disconnects a test harness. disconnect() runs the stop sequence first while connected, and that stop waits for
 * status reports, so fake time has to pass for it to finish.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { vi } from 'vitest';
import { GRBL_HOLD_COMPLETE_MAX_WAIT_MS, GRBL_STATUS_POLL_INTERVAL_MS } from '../grbl.constants';
import { ANSWER_SETTLE_MS } from './grbl.answer.settle';
import type { GrblControllerHarness } from './GrblControllerHarness';

/** Long enough for any stop sequence to finish and the poll after it to answer. */
const DISCONNECT_STOP_SETTLE_MS = GRBL_HOLD_COMPLETE_MAX_WAIT_MS + GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS;

export const disconnectGrblHarness = async (harness: GrblControllerHarness): Promise<void> => {
  const disconnect: Promise<void> = harness.controller.disconnect();
  await vi.advanceTimersByTimeAsync(DISCONNECT_STOP_SETTLE_MS);
  await disconnect;
};
