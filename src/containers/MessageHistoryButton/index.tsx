/**
 * The bell in the status strip: it opens the message history, and a badge on it counts the messages that arrived
 * since the history was last opened, so a toast that closed itself is never lost.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BellOutlined } from '@ant-design/icons';
import { Badge } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_BADGE_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectUnreadMessageCount } from '../../utils/states/message.history.state';
import { IconActionButton } from '../../views/IconActionButton';
import { MessageHistoryDialog } from '../MessageHistoryDialog';
import styles from './styles.module.scss';

export const MessageHistoryButton = (): ReactNode => {
  const { t } = useTranslation();
  const unreadCount: number = useSelector(selectUnreadMessageCount);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const labelText: string = unreadCount
    ? t(DEFAULT.MESSAGE_HISTORY_OPEN_UNREAD, { count: unreadCount })
    : t(DEFAULT.MESSAGE_HISTORY_OPEN);

  return (
    <>
      <Badge count={unreadCount} size={ANTD_BADGE_SIZE_SMALL} className={styles.badge}>
        <IconActionButton
          className={styles.historyButton}
          type={ANTD_BUTTON_TYPE_TEXT}
          labelText={labelText}
          iconComponent={<BellOutlined aria-hidden />}
          onClick={() => setIsOpen(true)}
        />
      </Badge>
      <MessageHistoryDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
