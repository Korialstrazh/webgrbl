/**
 * The outcome of reading the stored bed colour against the read timeout.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BedColourReadRace {
  /** The colour read from storage when the read finished first; undefined when none or no valid one is stored. */
  storedBedColour?: string;
  /** Set when the timeout ended first, so the default colour applies. */
  timeout?: true;
}
