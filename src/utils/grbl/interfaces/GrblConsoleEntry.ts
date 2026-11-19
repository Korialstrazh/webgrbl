/**
 * One line of console traffic: a sent line, a received line or a realtime byte.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblConsoleDirection, GrblRealtimeCommand } from '../grbl.constants';

export interface GrblConsoleEntry {
  /** Which way the entry travelled. */
  direction: GrblConsoleDirection;
  /** The line as sent or received, without its line break; for a realtime byte its display text. */
  text: string;
  /** The realtime command of a realtime entry; undefined for sent and received lines. */
  realtimeCommand: GrblRealtimeCommand | undefined;
  /** True for status queries and status replies, so the console can hide them. */
  isStatusReport: boolean;
  /** When the entry was sent or received, in milliseconds since the epoch. */
  timestamp: number;
}
