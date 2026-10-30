import { GRBL_CONTROLLER_EVENT_KIND } from './grbl.constants';
import type { GrblConsoleEntry } from './interfaces/GrblConsoleEntry';
import type { GrblConsoleEntryEvent } from './interfaces/GrblConsoleEntryEvent';

/** A console entry before it is stamped with its time. */
type GrblUnstampedConsoleEntry = Omit<GrblConsoleEntry, 'timestamp'>;

/**
 * Wraps a console entry, stamped with the current time, in a console-entry controller event.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const newGrblConsoleEntryEvent = (unstampedEntry: GrblUnstampedConsoleEntry): GrblConsoleEntryEvent => ({
  kind: GRBL_CONTROLLER_EVENT_KIND.CONSOLE_ENTRY,
  entry: { ...unstampedEntry, timestamp: Date.now() },
});
