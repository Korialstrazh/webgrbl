/**
 * Keeps a value for a lifetime, then clears it: for a confirmation that should not stay until the next action. Each
 * set starts the lifetime again, so a repeated confirmation shows for the full time too.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useCallback, useEffect, useState } from 'react';
import type { ExpiringValue } from './interfaces/ExpiringValue';

/** Wraps the value, so setting the same value again is a new object and starts the lifetime again. */
interface ExpiringValueBox<T> {
  value: T;
}

export const useExpiringValue = <T>(lifetimeMs: number): ExpiringValue<T> => {
  const [valueBox, setValueBox] = useState<ExpiringValueBox<T> | undefined>(undefined);

  const setValue = useCallback((value: T | undefined): void => {
    setValueBox(value ? { value } : undefined);
  }, []);

  useEffect(() => {
    if (!valueBox) {
      return undefined;
    }

    const timeoutId: number = window.setTimeout(() => setValueBox(undefined), lifetimeMs);

    return () => window.clearTimeout(timeoutId);
  }, [valueBox, lifetimeMs]);

  return { value: valueBox?.value, setValue };
};
