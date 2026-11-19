/**
 * The outcome of reading the stored bed colour against the read timeout.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BedColourReadRace {
  /** The colour read from storage when the read finished first; undefined when none or no valid one is stored. */
  storedBedColour?: string;
  /** Set when the timeout ended first, so the default colour applies. */
  timeout?: true;
}
