/**
 * Test time that lets the simulated laser answer.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

/** Fake timers delay a 0 ms timer set during a tick by 1 ms, so each simulator round trip costs 1 ms. */
export const ANSWER_SETTLE_MS = 10;
