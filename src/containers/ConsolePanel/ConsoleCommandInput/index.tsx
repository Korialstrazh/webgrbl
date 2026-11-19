/**
 * The console command input with its history: Enter sends the line, ArrowUp and ArrowDown step through the commands
 * sent before. The console panel and the large console log dialog both show it, so a command can be sent from either.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Input } from 'antd';
import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ARROW_DOWN_KEY, ARROW_UP_KEY, ENTER_KEY } from '../../../utils/browser/browser.events.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { selectIsConnected } from '../../../utils/states/grbl.connection.state';
import { ConsoleCommandSubmitted, selectCommandHistory } from '../../../utils/states/grbl.console.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import { EMPTY_INPUT_TEXT, NO_HISTORY_OFFSET } from '../console.history.constants';
import { getConsoleHistoryRecall } from '../get.console.history.recall';
import type { ConsoleHistoryRecall } from '../interfaces/ConsoleHistoryRecall';
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

export const ConsoleCommandInput = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isConnected: boolean = useSelector(selectIsConnected);
  const commandHistory: string[] = useSelector(selectCommandHistory);
  const [inputText, setInputText] = useState<string>(EMPTY_INPUT_TEXT);
  const [historyOffset, setHistoryOffset] = useState<number>(NO_HISTORY_OFFSET);

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
  const handleInputChange = (changeEvent: ChangeEvent<HTMLInputElement>): void => {
    setInputText(changeEvent.target.value);
    setHistoryOffset(NO_HISTORY_OFFSET);
  };

  const handleKeyDown = (keyboardEvent: KeyboardEvent<HTMLInputElement>): void => {
    const historyStep: number | undefined = getHistoryStep(keyboardEvent.key);

    if (keyboardEvent.key === ENTER_KEY) {
      submitCommand();
    } else if (historyStep) {
      keyboardEvent.preventDefault();
      recallHistory(historyStep);
    }
  };

  return (
    <Input
      className={styles.commandInput}
      value={inputText}
      disabled={!isConnected}
      aria-label={t(DEFAULT.CONSOLE_INPUT_LABEL)}
      placeholder={t(DEFAULT.CONSOLE_INPUT_PLACEHOLDER)}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
    />
  );
};
