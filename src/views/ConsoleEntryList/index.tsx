/**
 * The console lines, oldest first: a direction prefix, the text and the time of each entry.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { GRBL_CONSOLE_VIEW_DIRECTION } from '../../utils/states/grbl.console.view.direction';
import type { GrblConsoleViewDirection } from '../../utils/states/grbl.console.view.direction';
import type { GrblConsoleViewEntry } from '../../utils/states/interfaces/GrblConsoleViewEntry';
import { getConsoleEntryText } from './get.console.entry.text';
import styles from './styles.module.scss';

interface ConsoleEntryListProps {
  /** The entries to show, oldest first. */
  entries: GrblConsoleViewEntry[];
}

const SENT_PREFIX = '>';
const RECEIVED_PREFIX = '<';
const NO_PREFIX = '';

const DIRECTION_PREFIXES: Readonly<Record<GrblConsoleViewDirection, string>> = {
  [GRBL_CONSOLE_VIEW_DIRECTION.SENT]: SENT_PREFIX,
  [GRBL_CONSOLE_VIEW_DIRECTION.REALTIME]: SENT_PREFIX,
  [GRBL_CONSOLE_VIEW_DIRECTION.RECEIVED]: RECEIVED_PREFIX,
  [GRBL_CONSOLE_VIEW_DIRECTION.INFO]: NO_PREFIX,
  [GRBL_CONSOLE_VIEW_DIRECTION.ERROR]: NO_PREFIX,
};

const getEntryClassName = (entry: GrblConsoleViewEntry): string => [styles.entry, styles[entry.direction]].join(' ');

export const ConsoleEntryList = ({ entries }: ConsoleEntryListProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <ol className={styles.consoleEntryList}>
      {entries.map((entry: GrblConsoleViewEntry) => (
        <li key={entry.entryId} className={getEntryClassName(entry)}>
          <time className={styles.time} dateTime={new Date(entry.timestamp).toISOString()}>
            {new Date(entry.timestamp).toLocaleTimeString()}
          </time>
          <span className={styles.prefix}>{DIRECTION_PREFIXES[entry.direction]}</span>
          <span className={styles.text}>{getConsoleEntryText(entry, t)}</span>
        </li>
      ))}
    </ol>
  );
};
