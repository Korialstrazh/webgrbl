/**
 * One line of console traffic: a sent line, a received line or a realtime byte.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
