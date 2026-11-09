/**
 * Why a locked action is off, as one small warning dot drawn inside the top end corner of the action's button, so it
 * clearly belongs to that button: the text opens on a pointer hover. The button itself carries the reason as its
 * description and in its focus tooltip, so the dot takes no tab stop and is hidden from screen readers. The dot floats
 * over the button instead of taking a line under it, so a reason that comes and goes never shifts the buttons. It
 * renders nothing without a text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { TooltipNoteIcon } from '../TooltipNoteIcon';
import styles from './styles.module.scss';

interface ActionLockNoteProps {
  noteText: string | undefined;
  testId: string;
}

export const ActionLockNote = ({ noteText, testId }: ActionLockNoteProps): ReactNode => noteText && (
  <span className={styles.actionLockNote} data-testid={testId}>
    <TooltipNoteIcon noteText={noteText} iconComponent={<span className={styles.dot} />} isWarning isPointerOnly />
  </span>
);
