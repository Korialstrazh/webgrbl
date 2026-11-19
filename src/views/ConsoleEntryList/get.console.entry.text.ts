/**
 * The text a console entry shows: a translated message for lines the app added, the command label for realtime
 * entries, and the raw line for everything the laser sent or received.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { TFunction } from 'i18next';
import type { GrblConsoleViewEntry } from '../../utils/states/interfaces/GrblConsoleViewEntry';
import { CONSOLE_REALTIME_LABEL_KEYS } from './console.realtime.label.keys';

export const getConsoleEntryText = (entry: GrblConsoleViewEntry, t: TFunction): string => {
  if (entry.messageKey) {
    return t(entry.messageKey, entry.messageParameters);
  }

  if (entry.realtimeCommand) {
    return t(CONSOLE_REALTIME_LABEL_KEYS[entry.realtimeCommand]);
  }

  return entry.text;
};
