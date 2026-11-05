/**
 * A short note shown as one icon instead of a standing sentence: the text is its tooltip, and the icon takes the
 * keyboard focus and carries the text as its accessible name, so keyboard and screen reader users still reach it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { ARIA_ROLE_NOTE } from '../../utils/aria.constants';
import { KEYBOARD_FOCUSABLE_TAB_INDEX } from '../../utils/tab.index.constants';
import styles from './styles.module.scss';

interface TooltipNoteIconProps {
  noteText: string;
  /** The icon that stands for the note; an info circle when none is given. */
  iconComponent?: ReactNode;
  /** A note that says why something cannot be done yet, in the warning colour instead of the muted one. */
  isWarning?: boolean;
}

export const TooltipNoteIcon = ({ noteText, iconComponent, isWarning = false }: TooltipNoteIconProps): ReactNode => (
  <Tooltip title={noteText}>
    <span
      className={[styles.tooltipNoteIcon, isWarning ? styles.warning : undefined].join(' ')}
      role={ARIA_ROLE_NOTE}
      tabIndex={KEYBOARD_FOCUSABLE_TAB_INDEX}
      aria-label={noteText}
    >
      <span className={styles.icon} aria-hidden>{iconComponent ?? <InfoCircleOutlined />}</span>
    </span>
  </Tooltip>
);
