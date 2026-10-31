/**
 * Controller event: a line or realtime byte went over the wire.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GRBL_CONTROLLER_EVENT_KIND } from '../grbl.constants';
import type { GrblConsoleEntry } from './GrblConsoleEntry';

export interface GrblConsoleEntryEvent {
  kind: typeof GRBL_CONTROLLER_EVENT_KIND.CONSOLE_ENTRY;
  entry: GrblConsoleEntry;
}
