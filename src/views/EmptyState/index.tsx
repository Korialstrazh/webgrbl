/**
 * A friendly empty state for a list or table area: an icon, a short title, one sentence and, when there is something
 * to do about it, one button.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button } from 'antd';
import type { ReactNode } from 'react';
import styles from './styles.module.scss';

interface EmptyStateProps {
  iconComponent: ReactNode;
  titleText: string;
  bodyText?: string;
  /** Label of the one action; none shows no button. */
  actionLabel?: string;
  onAction?: () => void;
  /** A control of its own, where a plain button would not do. */
  actionComponent?: ReactNode;
}

export const EmptyState = (props: EmptyStateProps): ReactNode => {
  const { iconComponent, titleText, bodyText, actionLabel, onAction, actionComponent } = props;

  return (
    <div className={styles.emptyState} role="note">
      <span className={styles.icon} aria-hidden>{iconComponent}</span>
      <p className={styles.title}>{titleText}</p>
      {bodyText && <p className={styles.body}>{bodyText}</p>}
      {actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
      {actionComponent}
    </div>
  );
};
