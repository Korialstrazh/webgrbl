/**
 * A titled section of the workbench with an optional action next to the heading. Without content it is the heading
 * line only, for a section collapsed to one line.
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
  /** The icon before the title. */
  iconComponent?: ReactNode;
  /** The content below the heading; none leaves the section at its heading line. */
  children?: ReactNode;
  headerActionComponent?: ReactNode;
}

export const Panel = ({ title, iconComponent, children, headerActionComponent }: PanelProps): ReactNode => {
  const headingId: string = useId();

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <header className={children ? [styles.header, styles.headerAboveBody].join(' ') : styles.header}>
        <h2 id={headingId} className={styles.title}>
          {iconComponent && <span className={styles.icon} aria-hidden>{iconComponent}</span>}
          {title}
        </h2>
        {headerActionComponent}
      </header>
      {children && <div className={styles.body}>{children}</div>}
    </section>
  );
};
