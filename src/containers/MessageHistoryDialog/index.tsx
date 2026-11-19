/**
 * The message history: every toast of this session, newest first, each with its time, its severity icon and its
 * full text, and a button that clears the list. While it is open new messages count as read.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BellOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT } from '../../utils/localization/default.locales';
import { getToastMessageText } from '../../utils/states/get.toast.message.text';
import type { MessageHistoryEntry } from '../../utils/states/interfaces/MessageHistoryEntry';
import {
  MessageHistoryCleared,
  MessageHistoryRead,
  selectMessageHistoryEntries,
  selectUnreadMessageCount,
} from '../../utils/states/message.history.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { EmptyState } from '../../views/EmptyState';
import { ToastSeverityIcon } from '../../views/ToastSeverityIcon';
import { AppModal } from '../AppModal';
import type { MessageHistoryDialogProps } from './interfaces/MessageHistoryDialogProps';
import { MESSAGE_HISTORY_DIALOG_OVERLAY_ID, MESSAGE_HISTORY_DIALOG_WIDTH } from './message.history.dialog.constants';
import styles from './styles.module.scss';

export const MessageHistoryDialog = ({ isOpen, onClose }: MessageHistoryDialogProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const entries: MessageHistoryEntry[] = useSelector(selectMessageHistoryEntries);
  const unreadCount: number = useSelector(selectUnreadMessageCount);
  const newestFirstEntries: MessageHistoryEntry[] = [...entries].reverse();

  useEffect(() => {
    if (isOpen && unreadCount) {
      dispatch(new MessageHistoryRead());
    }
  }, [dispatch, isOpen, unreadCount]);

  return (
    <AppModal
      isOpen={isOpen}
      overlayIdPrefix={MESSAGE_HISTORY_DIALOG_OVERLAY_ID}
      title={t(DEFAULT.MESSAGE_HISTORY_TITLE)}
      maxWidth={MESSAGE_HISTORY_DIALOG_WIDTH}
      // An empty history offers nothing to clear: the bell empty state is the whole dialog.
      footer={entries.length ? (
        <Button icon={<DeleteOutlined />} onClick={() => dispatch(new MessageHistoryCleared())}>
          {t(DEFAULT.MESSAGE_HISTORY_CLEAR)}
        </Button>
      ) : null}
      onClose={onClose}
    >
      {newestFirstEntries.length ? (
        <ol className={styles.messageList} aria-label={t(DEFAULT.MESSAGE_HISTORY_TITLE)}>
          {newestFirstEntries.map((entry: MessageHistoryEntry) => (
            <li key={entry.entryId} className={[styles.message, styles[entry.severity]].join(' ')}>
              <span className={styles.icon}><ToastSeverityIcon severity={entry.severity} /></span>
              <time className={styles.time} dateTime={new Date(entry.shownAtMs).toISOString()}>
                {new Date(entry.shownAtMs).toLocaleTimeString()}
              </time>
              <span className={styles.text}>{getToastMessageText(entry, t)}</span>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState iconComponent={<BellOutlined />} titleText={t(DEFAULT.MESSAGE_HISTORY_EMPTY)} />
      )}
    </AppModal>
  );
};
