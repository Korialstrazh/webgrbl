/**
 * A modal dialog with a title and an optional footer; it traps focus and Escape closes it.
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
import { useOverlayFocus } from '../../utils/hooks/use.overlay.focus';
import { SCRIPT_FOCUS_ONLY_TAB_INDEX } from '../../utils/tab.index.constants';
import styles from './styles.module.scss';

interface DialogProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footerComponent?: ReactNode;
}

export const Dialog = ({ isOpen, title, onClose, children, footerComponent }: DialogProps): ReactNode => {
  const titleId: string = useId();
  const { overlayRef, handleOverlayKeyDown } = useOverlayFocus(isOpen, onClose, true);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.backdrop}>
      <div
        ref={overlayRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={SCRIPT_FOCUS_ONLY_TAB_INDEX}
        onKeyDown={handleOverlayKeyDown}
      >
        <h2 id={titleId} className={styles.title}>{title}</h2>
        <div className={styles.body}>{children}</div>
        {footerComponent && <footer className={styles.footer}>{footerComponent}</footer>}
      </div>
    </div>
  );
};
