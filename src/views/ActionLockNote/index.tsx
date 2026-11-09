/**
 * Why a locked action is off, as one small warning dot pinned to the top corner of the action: the text opens on a
 * hover, a tap, a click, or Enter or Space, and is the dot's accessible name. The dot floats over the action instead of
 * taking a line under it, so a reason that comes and goes (the laser turning busy while it moves) never shifts the
 * buttons. It renders nothing without a text.
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
    <TooltipNoteIcon noteText={noteText} iconComponent={<span className={styles.dot} />} isWarning />
  </span>
);
