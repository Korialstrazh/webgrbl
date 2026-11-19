/**
 * A value that clears itself after its lifetime, and the setter that starts the lifetime again.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ExpiringValue<T> {
  /** The value while its lifetime lasts; undefined after it, or after it was cleared. */
  value: T | undefined;
  /** Sets the value and starts its lifetime again, even for the same value; undefined or empty clears it at once. */
  setValue: (value: T | undefined) => void;
}
