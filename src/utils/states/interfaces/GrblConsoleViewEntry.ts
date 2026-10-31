/**
 * One line of the console as the UI shows it: an engine console entry, or a line the app added itself (info or
 * error) that carries a localisation key instead of text.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblConsoleViewDirection } from '../grbl.console.view.direction';
import type { GrblConsoleEntry } from '../../grbl/interfaces/GrblConsoleEntry';

export interface GrblConsoleViewEntry extends Omit<GrblConsoleEntry, 'direction'> {
  /** Running number that identifies the entry, also after older entries were dropped. */
  entryId: number;
  /** Which way the entry travelled, or info/error for a line the app added. */
  direction: GrblConsoleViewDirection;
  /** Localisation key of an app-added line; undefined for engine entries. */
  messageKey: string | undefined;
  /** Values for the placeholders of the message, for example a raw error text; undefined when there are none. */
  messageParameters: Record<string, string | number> | undefined;
}
