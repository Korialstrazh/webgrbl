/**
 * A titled section of the workbench with an optional action next to the heading. Without content it is the heading
 * line only, for a section collapsed to one line. With a note it is a muted heading line whose info icon tells why it
 * has no content in this view, by tooltip, keyboard focus and screen reader, so a stack of panels keeps its order. A
 * muted line still shows its header action (such as a warning count) before the note icon.
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
import { TooltipNoteIcon } from '../TooltipNoteIcon';
import styles from './styles.module.scss';

interface PanelProps {
  title: string;
  /** The icon before the title. */
  iconComponent?: ReactNode;
  /** The content below the heading; none leaves the section at its heading line. */
  children?: ReactNode;
  headerActionComponent?: ReactNode;
  /** Why the section is empty in this view: it collapses to a muted heading line with this note behind an icon. */
  noteText?: string;
  /** A word or two beside the note icon that says at a glance why the section is muted, such as "Design only". */
  noteCaptionText?: string;
  /** Tighter header and body padding, for a dense read-out card in a crowded column. */
  isCompact?: boolean;
}

export const Panel = ({
  title,
  iconComponent,
  children,
  headerActionComponent,
  noteText,
  noteCaptionText,
  isCompact = false,
}: PanelProps): ReactNode => {
  const headingId: string = useId();
  const bodyComponent: ReactNode = noteText ? undefined : children;
  const panelClassName: string = [
    styles.panel,
    noteText ? styles.mutedPanel : undefined,
    isCompact ? styles.compactPanel : undefined,
  ].join(' ');

  return (
    <section className={panelClassName} aria-labelledby={headingId}>
      <header className={bodyComponent ? [styles.header, styles.headerAboveBody].join(' ') : styles.header}>
        <h2 id={headingId} className={styles.title}>
          {iconComponent && <span className={styles.icon} aria-hidden>{iconComponent}</span>}
          {title}
        </h2>
        {noteText ? (
          <span className={styles.headerActions}>
            {headerActionComponent}
            {noteCaptionText && <span className={styles.noteCaption}>{noteCaptionText}</span>}
            <TooltipNoteIcon noteText={noteText} />
          </span>
        ) : headerActionComponent}
      </header>
      {bodyComponent && <div className={styles.body}>{bodyComponent}</div>}
    </section>
  );
};
