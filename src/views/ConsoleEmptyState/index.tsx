/**
 * What the console shows before any message: a centred terminal icon over one muted line, so the empty log reads as
 * waiting, not as a blank box. Shared by the console panel and the large console dialog.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { CodeOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import styles from './styles.module.scss';

interface ConsoleEmptyStateProps {
  hintText: string;
}

export const ConsoleEmptyState = ({ hintText }: ConsoleEmptyStateProps): ReactNode => (
  <div className={styles.consoleEmptyState}>
    <CodeOutlined className={styles.icon} aria-hidden />
    <p className={styles.hint}>{hintText}</p>
  </div>
);
