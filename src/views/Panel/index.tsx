/**
 * A titled section of the workbench with an optional action next to the heading. Without content it is the heading
 * line only, for a section collapsed to one line. With a note it is a muted heading line whose icon (its own, such as
 * a crossed-out eye, instead of words) tells why it has no content in this view, by tooltip, keyboard focus and screen
 * reader, so a stack of panels keeps its order. A muted line still shows its header action (such as a warning count)
 * before the note icon. It is an antd Card exposed as a region named by its heading.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Card } from 'antd';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { ANTD_CARD_SIZE_SMALL } from '../../utils/antd.constants';
import { ARIA_ROLE_REGION } from '../../utils/aria.constants';
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
  /** The icon of the note, such as a crossed-out eye for a card not used in this view; an info circle when none. */
  noteIconComponent?: ReactNode;
  /** Tighter header and body padding, for a dense read-out card in a crowded column. */
  isCompact?: boolean;
  /** The heading stays for screen readers but is hidden on screen, for a one-line card whose content names itself. */
  isTitleVisuallyHidden?: boolean;
}

export const Panel = ({
  title,
  iconComponent,
  children,
  headerActionComponent,
  noteText,
  noteIconComponent,
  isCompact = false,
  isTitleVisuallyHidden = false,
}: PanelProps): ReactNode => {
  const headingId: string = useId();
  const bodyComponent: ReactNode = noteText ? undefined : children;
  const panelClassName: string = [
    styles.panel,
    noteText ? styles.mutedPanel : undefined,
    isCompact ? styles.compactPanel : undefined,
  ].join(' ');

  const titleComponent: ReactNode = (
    <h2 id={headingId} className={isTitleVisuallyHidden ? styles.hiddenTitle : styles.title}>
      {iconComponent && <span className={styles.icon} aria-hidden>{iconComponent}</span>}
      {title}
    </h2>
  );
  const extraComponent: ReactNode = noteText ? (
    <span className={styles.headerActions}>
      {headerActionComponent}
      <TooltipNoteIcon noteText={noteText} iconComponent={noteIconComponent} />
    </span>
  ) : headerActionComponent;

  return (
    <Card
      role={ARIA_ROLE_REGION}
      aria-labelledby={headingId}
      size={ANTD_CARD_SIZE_SMALL}
      className={panelClassName}
      title={titleComponent}
      extra={extraComponent}
      classNames={{
        header: bodyComponent ? [styles.header, styles.headerAboveBody].join(' ') : styles.header,
        body: bodyComponent ? styles.body : styles.emptyBody,
      }}
    >
      {bodyComponent}
    </Card>
  );
};
