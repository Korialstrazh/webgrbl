/**
 * Controller event: a line or realtime byte went over the wire.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GRBL_CONTROLLER_EVENT_KIND } from '../grbl.constants';
import type { GrblConsoleEntry } from './GrblConsoleEntry';

export interface GrblConsoleEntryEvent {
  kind: typeof GRBL_CONTROLLER_EVENT_KIND.CONSOLE_ENTRY;
  entry: GrblConsoleEntry;
}
