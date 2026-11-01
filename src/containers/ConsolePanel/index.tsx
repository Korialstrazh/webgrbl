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
import { Checkbox, Input } from 'antd';
import type { ChangeEvent, KeyboardEvent, ReactNode, RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ARROW_DOWN_KEY, ARROW_UP_KEY, ENTER_KEY } from '../../utils/browser/browser.events.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectIsConnected } from '../../utils/states/grbl.connection.state';
import {
  ConsoleCommandSubmitted,
  StatusReportVisibilityToggled,
  selectCommandHistory,
  selectConsoleEntries,
  selectIsStatusReportVisible,
} from '../../utils/states/grbl.console.state';
import type { GrblConsoleViewEntry } from '../../utils/states/interfaces/GrblConsoleViewEntry';
import type { AppDispatch } from '../../utils/states/new.store';
import { ConsoleEntryList } from '../../views/ConsoleEntryList';
import { EMPTY_INPUT_TEXT, NO_HISTORY_OFFSET } from './console.history.constants';
import { getConsoleHistoryRecall } from './get.console.history.recall';
import type { ConsoleHistoryRecall } from './interfaces/ConsoleHistoryRecall';
import { isConsoleScrolledToBottom } from './is.console.scrolled.to.bottom';
import styles from './styles.module.scss';

const OLDER_COMMAND_STEP = 1;
const NEWER_COMMAND_STEP = -1;

const getHistoryStep = (key: string): number | undefined => {
  switch (key) {
  case ARROW_UP_KEY:
    return OLDER_COMMAND_STEP;
  case ARROW_DOWN_KEY:
    return NEWER_COMMAND_STEP;
  default:
    return undefined;
  }
};

export const ConsolePanel = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const entries: GrblConsoleViewEntry[] = useSelector(selectConsoleEntries);
  const isStatusReportVisible: boolean = useSelector(selectIsStatusReportVisible);
  const isConnected: boolean = useSelector(selectIsConnected);
  const commandHistory: string[] = useSelector(selectCommandHistory);
  const [inputText, setInputText] = useState<string>(EMPTY_INPUT_TEXT);
  const [historyOffset, setHistoryOffset] = useState<number>(NO_HISTORY_OFFSET);
  const scrollElementRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);
  const isFollowingNewLinesRef: RefObject<boolean> = useRef<boolean>(true);

  useEffect(() => {
    const scrollElement: HTMLDivElement | null = scrollElementRef.current;

    if (scrollElement && isFollowingNewLinesRef.current) {
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [entries]);

  const submitCommand = (): void => {
    const commandText: string = inputText.trim();

    if (!commandText) {
      return;
    }

    dispatch(new ConsoleCommandSubmitted({ commandText }));
    setInputText(EMPTY_INPUT_TEXT);
    setHistoryOffset(NO_HISTORY_OFFSET);
  };

  const recallHistory = (historyStep: number): void => {
    const recall: ConsoleHistoryRecall = getConsoleHistoryRecall(commandHistory, historyOffset, historyStep);

    setHistoryOffset(recall.historyOffset);
    setInputText(recall.inputText);
  };

  /** Typing edits the input, so the next ArrowUp starts again from the newest command. */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setInputText(event.target.value);
    setHistoryOffset(NO_HISTORY_OFFSET);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    const historyStep: number | undefined = getHistoryStep(event.key);

    if (event.key === ENTER_KEY) {
      submitCommand();
    } else if (historyStep) {
      event.preventDefault();
      recallHistory(historyStep);
    }
  };

  return (
    <section className={styles.consolePanel}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t(DEFAULT.CONSOLE_TITLE)}</h2>
        <Checkbox
          className={styles.statusReports}
          checked={isStatusReportVisible}
          onChange={() => dispatch(new StatusReportVisibilityToggled())}
        >
          {t(DEFAULT.CONSOLE_SHOW_STATUS_REPORTS)}
        </Checkbox>
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
        <ConsoleEntryList entries={entries} />
      </div>
      <Input
        className={styles.commandInput}
        value={inputText}
        disabled={!isConnected}
        aria-label={t(DEFAULT.CONSOLE_INPUT_LABEL)}
        placeholder={t(DEFAULT.CONSOLE_INPUT_PLACEHOLDER)}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
    </section>
  );
};
