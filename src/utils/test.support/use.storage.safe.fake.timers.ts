/**
 * Fake timers for tests that also use the project database. Only the timers sagas wait on and the clock are faked:
 * fake-indexeddb finishes its requests through setImmediate, so faking that as well would stop every database call.
 * Advance with `vi.advanceTimersByTimeAsync`, and wait for database results with `vi.waitFor`, which polls on real
 * timers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { vi } from 'vitest';

type FakeTimersConfig = NonNullable<Parameters<typeof vi.useFakeTimers>[0]>;

const STORAGE_SAFE_FAKE_TIMERS_CONFIG: FakeTimersConfig = { toFake: ['setTimeout', 'clearTimeout', 'Date'] };

export const useStorageSafeFakeTimers = (): void => {
  vi.useFakeTimers(STORAGE_SAFE_FAKE_TIMERS_CONFIG);
};
