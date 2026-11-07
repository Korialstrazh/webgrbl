/**
 * A few plain words right under a locked action on why it is off, so the reason reads without a hover on a touch
 * screen too. It renders nothing without a text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import styles from './styles.module.scss';

interface ActionLockNoteProps {
  noteText: string | undefined;
  testId: string;
}

export const ActionLockNote = ({ noteText, testId }: ActionLockNoteProps): ReactNode => noteText && (
  <p className={styles.actionLockNote} data-testid={testId}>{noteText}</p>
);
