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
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { vi } from 'vitest';

type FakeTimersConfig = NonNullable<Parameters<typeof vi.useFakeTimers>[0]>;

const STORAGE_SAFE_FAKE_TIMERS_CONFIG: FakeTimersConfig = { toFake: ['setTimeout', 'clearTimeout', 'Date'] };

export const useStorageSafeFakeTimers = (): void => {
  vi.useFakeTimers(STORAGE_SAFE_FAKE_TIMERS_CONFIG);
};
