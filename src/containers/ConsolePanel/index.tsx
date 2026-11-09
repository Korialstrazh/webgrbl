/**
 * The console: the traffic to and from the laser, a switch for status reports and the command input with history.
 * The list follows new lines unless the user has scrolled up.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CloseOutlined, CodeOutlined, ExpandOutlined } from '@ant-design/icons';
import { Checkbox } from 'antd';
import type { ReactNode, RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_TYPE_TEXT } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import {
  StatusReportVisibilityToggled,
  selectConsoleEntries,
  selectIsStatusReportVisible,
} from '../../utils/states/grbl.console.state';
import type { GrblConsoleViewEntry } from '../../utils/states/interfaces/GrblConsoleViewEntry';
import type { AppDispatch } from '../../utils/states/new.store';
import { ConsoleOpenChanged } from '../../utils/states/panel.layout.state';
import { ConsoleEntryList } from '../../views/ConsoleEntryList';
import { IconActionButton } from '../../views/IconActionButton';
import { ConsoleCommandInput } from './ConsoleCommandInput';
import { ConsoleLogDialog } from './ConsoleLogDialog';
import { isConsoleScrolledToBottom } from './is.console.scrolled.to.bottom';
import styles from './styles.module.scss';

export const ConsolePanel = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const entries: GrblConsoleViewEntry[] = useSelector(selectConsoleEntries);
  const isStatusReportVisible: boolean = useSelector(selectIsStatusReportVisible);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState<boolean>(false);
  const scrollElementRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);
  const isFollowingNewLinesRef: RefObject<boolean> = useRef<boolean>(true);

  useEffect(() => {
    const scrollElement: HTMLDivElement | null = scrollElementRef.current;

    if (scrollElement && isFollowingNewLinesRef.current) {
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [entries]);

  return (
    <section className={styles.consolePanel}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          <CodeOutlined aria-hidden />
          {t(DEFAULT.CONSOLE_TITLE)}
        </h2>
        <Checkbox
          className={styles.statusReports}
          checked={isStatusReportVisible}
          onChange={() => dispatch(new StatusReportVisibilityToggled())}
        >
          {t(DEFAULT.CONSOLE_SHOW_STATUS_REPORTS)}
        </Checkbox>
        <IconActionButton
          type={ANTD_BUTTON_TYPE_TEXT}
          labelText={t(DEFAULT.CONSOLE_EXPAND)}
          iconComponent={<ExpandOutlined aria-hidden />}
          onClick={() => setIsLogDialogOpen(true)}
        />
        <IconActionButton
          type={ANTD_BUTTON_TYPE_TEXT}
          labelText={t(DEFAULT.CONSOLE_CLOSE)}
          iconComponent={<CloseOutlined aria-hidden />}
          onClick={() => dispatch(new ConsoleOpenChanged({ isConsoleOpen: false }))}
        />
      </header>
      <div
        ref={scrollElementRef}
        className={styles.scrollArea}
        role="log"
        aria-label={t(DEFAULT.CONSOLE_LOG_LABEL)}
        onScroll={() => {
          if (scrollElementRef.current) {
            isFollowingNewLinesRef.current = isConsoleScrolledToBottom(scrollElementRef.current);
          }
        }}
      >
        {entries.length
          ? <ConsoleEntryList entries={entries} />
          : <p className={styles.emptyHint}>{t(DEFAULT.CONSOLE_EMPTY_HINT)}</p>}
      </div>
      <ConsoleCommandInput />
      <ConsoleLogDialog isOpen={isLogDialogOpen} onClose={() => setIsLogDialogOpen(false)} />
    </section>
  );
};
