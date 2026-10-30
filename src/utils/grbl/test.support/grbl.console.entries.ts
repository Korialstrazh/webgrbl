import { GRBL_CONTROLLER_EVENT_KIND } from '../grbl.constants';
import type { GrblConsoleEntry } from '../interfaces/GrblConsoleEntry';
import type { GrblControllerEvent } from '../interfaces/GrblControllerEvent';

/**
 * Returns the console entries among recorded controller events, oldest first.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const getConsoleEntries = (events: GrblControllerEvent[]): GrblConsoleEntry[] => {
  const entries: GrblConsoleEntry[] = [];

  for (const event of events) {
    if (event.kind === GRBL_CONTROLLER_EVENT_KIND.CONSOLE_ENTRY) {
      entries.push(event.entry);
    }
  }

  return entries;
};
