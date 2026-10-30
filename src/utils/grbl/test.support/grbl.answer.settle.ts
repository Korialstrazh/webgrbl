/**
 * Test time that lets the simulated laser answer.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

/** Fake timers delay a 0 ms timer set during a tick by 1 ms, so each simulator round trip costs 1 ms. */
export const ANSWER_SETTLE_MS = 10;
