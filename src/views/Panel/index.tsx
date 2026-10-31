/**
 * A titled section of the workbench with an optional action next to the heading.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useId } from 'react';
import type { ReactNode } from 'react';
import styles from './styles.module.scss';

interface PanelProps {
  title: string;
  children: ReactNode;
  headerActionComponent?: ReactNode;
}

export const Panel = ({ title, children, headerActionComponent }: PanelProps): ReactNode => {
  const headingId: string = useId();

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <header className={styles.header}>
        <h2 id={headingId} className={styles.title}>{title}</h2>
        {headerActionComponent}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
};
