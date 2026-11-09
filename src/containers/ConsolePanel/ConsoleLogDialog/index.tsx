/**
 * The console log in a large dialog, for reading long traffic without resizing the console dock. It shows the same
 * lines as the console, status reports only when the console shows them, and follows new lines from the bottom.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { selectConsoleEntries } from '../../../utils/states/grbl.console.state';
import type { GrblConsoleViewEntry } from '../../../utils/states/interfaces/GrblConsoleViewEntry';
import { ConsoleEntryList } from '../../../views/ConsoleEntryList';
import { AppModal } from '../../AppModal';
import type { ConsoleLogDialogProps } from './interfaces/ConsoleLogDialogProps';
import styles from './styles.module.scss';

const CONSOLE_LOG_DIALOG_OVERLAY_ID = 'console-log-dialog';

/** Wide enough for a full $$ settings line with its time. */
const CONSOLE_LOG_DIALOG_WIDTH = '64rem';

export const ConsoleLogDialog = ({ isOpen, onClose }: ConsoleLogDialogProps): ReactNode => {
  const { t } = useTranslation();
  const entries: GrblConsoleViewEntry[] = useSelector(selectConsoleEntries);
  const scrollElementRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scrollElement: HTMLDivElement | null = scrollElementRef.current;

    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [entries, isOpen]);

  return (
    <AppModal
      isOpen={isOpen}
      overlayIdPrefix={CONSOLE_LOG_DIALOG_OVERLAY_ID}
      title={t(DEFAULT.CONSOLE_LOG_DIALOG_TITLE)}
      maxWidth={CONSOLE_LOG_DIALOG_WIDTH}
      footer={null}
      onClose={onClose}
    >
      <div
        ref={scrollElementRef}
        className={styles.logArea}
        role="log"
        aria-label={t(DEFAULT.CONSOLE_LOG_DIALOG_TITLE)}
      >
        {entries.length
          ? <ConsoleEntryList entries={entries} />
          : <p className={styles.emptyHint}>{t(DEFAULT.CONSOLE_EMPTY_HINT)}</p>}
      </div>
    </AppModal>
  );
};
