/**
 * A value that clears itself after its lifetime, and the setter that starts the lifetime again.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ExpiringValue<T> {
  /** The value while its lifetime lasts; undefined after it, or after it was cleared. */
  value: T | undefined;
  /** Sets the value and starts its lifetime again, even for the same value; undefined or empty clears it at once. */
  setValue: (value: T | undefined) => void;
}
