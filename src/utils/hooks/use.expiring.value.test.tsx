import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ExpiringValue } from './interfaces/ExpiringValue';
import { useExpiringValue } from './use.expiring.value';

const LIFETIME_MS = 1000;
const SAVED_TEXT = 'Saved';

describe(useExpiringValue.name, () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps a value for its lifetime and clears it after', () => {
    vi.useFakeTimers();

    const { result } = renderHook((): ExpiringValue<string> => useExpiringValue<string>(LIFETIME_MS));

    act(() => result.current.setValue(SAVED_TEXT));
    act(() => vi.advanceTimersByTime(LIFETIME_MS - 1));
    expect(result.current.value).toBe(SAVED_TEXT);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current.value).toBeUndefined();
  });

  it('starts the lifetime again when the same value is set again', () => {
    vi.useFakeTimers();

    const { result } = renderHook((): ExpiringValue<string> => useExpiringValue<string>(LIFETIME_MS));

    act(() => result.current.setValue(SAVED_TEXT));
    act(() => vi.advanceTimersByTime(LIFETIME_MS - 1));
    act(() => result.current.setValue(SAVED_TEXT));
    act(() => vi.advanceTimersByTime(LIFETIME_MS - 1));

    expect(result.current.value).toBe(SAVED_TEXT);
  });

  it('clears the value at once when set to undefined', () => {
    vi.useFakeTimers();

    const { result } = renderHook((): ExpiringValue<string> => useExpiringValue<string>(LIFETIME_MS));

    act(() => result.current.setValue(SAVED_TEXT));
    act(() => result.current.setValue(undefined));

    expect(result.current.value).toBeUndefined();
  });
});
