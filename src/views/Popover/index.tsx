/**
 * A small non-modal panel next to its anchor; Escape closes it.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useOverlayFocus } from '../../utils/hooks/use.overlay.focus';
import { SCRIPT_FOCUS_ONLY_TAB_INDEX } from '../../utils/tab.index.constants';
import styles from './styles.module.scss';

interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  /** The accessible name of the popover, usually the label of the control that opened it. */
  anchorLabel: string;
  children: ReactNode;
}

export const Popover = ({ isOpen, onClose, anchorLabel, children }: PopoverProps): ReactNode => {
  const { overlayRef, handleOverlayKeyDown } = useOverlayFocus(isOpen, onClose, false);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className={styles.popover}
      role="dialog"
      aria-label={anchorLabel}
      tabIndex={SCRIPT_FOCUS_ONLY_TAB_INDEX}
      onKeyDown={handleOverlayKeyDown}
    >
      {children}
    </div>
  );
};
