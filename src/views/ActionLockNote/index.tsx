/**
 * Why a locked action is off, as one small antd warning status badge drawn inside the top end corner of the action's button, so it
 * clearly belongs to that button: the text opens on a pointer hover. The button itself carries the reason as its
 * description and in its focus tooltip, so the dot takes no tab stop and is hidden from screen readers. The dot floats
 * over the button instead of taking a line under it, so a reason that comes and goes never shifts the buttons. It
 * renders nothing without a text. Given every reason, its popover lists each one with a warning icon. The dot keeps the
 * warning colour on hover and focus, and the popover opens above the button, so it never covers the button's caption.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { WarningFilled } from '@ant-design/icons';
import { Badge, Popover } from 'antd';
import type { ReactNode } from 'react';
import {
  ANTD_BADGE_STATUS_WARNING,
  ANTD_POPOVER_PLACEMENT_TOP_RIGHT,
  ANTD_POPOVER_TRIGGER_HOVER,
} from '../../utils/antd.constants';
import styles from './styles.module.scss';

interface ActionLockNoteProps {
  noteText: string | undefined;
  testId: string;
  /** Every reason the action is off, in full, listed in the popover; the note text alone when none are given. */
  reasonTexts?: readonly string[];
}

const getReasonListComponent = (reasonTexts: readonly string[]): ReactNode => (
  <ul className={styles.reasonList}>
    {reasonTexts.map((reasonText: string) => (
      <li key={reasonText} className={styles.reason}>
        <WarningFilled className={styles.reasonIcon} aria-hidden />
        <span>{reasonText}</span>
      </li>
    ))}
  </ul>
);

export const ActionLockNote = ({ noteText, testId, reasonTexts }: ActionLockNoteProps): ReactNode => noteText && (
  <span className={styles.actionLockNote} data-testid={testId}>
    {/* Opens on a pointer hover above the corner dot, clear of the button and its caption, and flips back in when it
        would touch the window edge. */}
    <Popover
      content={reasonTexts?.length
        ? getReasonListComponent(reasonTexts)
        : <span className={styles.noteText}>{noteText}</span>}
      trigger={ANTD_POPOVER_TRIGGER_HOVER}
      placement={ANTD_POPOVER_PLACEMENT_TOP_RIGHT}
    >
      <span className={styles.dotTarget} aria-hidden>
        <Badge status={ANTD_BADGE_STATUS_WARNING} className={styles.dot} />
      </span>
    </Popover>
  </span>
);
