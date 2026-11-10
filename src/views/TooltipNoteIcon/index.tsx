/**
 * A short note shown as one icon instead of a standing sentence: the text opens in a popover on a hover, a tap or a
 * click, or Enter or Space from the keyboard, so it never needs a hover. The icon sits in a tinted circle that reads as
 * tappable, takes the keyboard focus and carries the text as its accessible name for screen reader users. A
 * pointer-only note opens on a hover alone and stays out of the tab order, for text that is reachable elsewhere.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import type { PopoverProps } from 'antd';
import { useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { ANTD_POPOVER_TRIGGER_HOVER, ANTD_POPOVER_TRIGGER_HOVER_AND_CLICK } from '../../utils/antd.constants';
import { ARIA_ROLE_NOTE } from '../../utils/aria.constants';
import { ENTER_KEY, SPACE_KEY } from '../../utils/browser/browser.events.constants';
import { KEYBOARD_FOCUSABLE_TAB_INDEX } from '../../utils/tab.index.constants';
import styles from './styles.module.scss';

interface TooltipNoteIconProps {
  noteText: string;
  /** The icon that stands for the note; an info circle when none is given. */
  iconComponent?: ReactNode;
  /** A note that says why something cannot be done yet, in the warning colour instead of the muted one. */
  isWarning?: boolean;
  /**
   * True where the same text already reaches keyboard and screen reader users another way (the description of a
   * button): the icon opens on a pointer hover only, takes no tab stop and is hidden from screen readers.
   */
  isPointerOnly?: boolean;
  /** Where the note opens; above the icon when none is given. antd flips it when it would leave the window. */
  placement?: PopoverProps['placement'];
}

const NOTE_TOGGLE_KEYS: readonly string[] = [ENTER_KEY, SPACE_KEY];

export const TooltipNoteIcon = (props: TooltipNoteIconProps): ReactNode => {
  const { noteText, iconComponent, isWarning = false, isPointerOnly = false, placement }: TooltipNoteIconProps = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const iconClassName: string = [
    styles.tooltipNoteIcon,
    isWarning ? styles.warning : undefined,
    isPointerOnly ? styles.pointerOnly : undefined,
  ].join(' ');

  // Enter and Space open and close it from the keyboard, like a tap does.
  const handleKeyDown = (keyEvent: KeyboardEvent<HTMLSpanElement>): void => {
    if (NOTE_TOGGLE_KEYS.includes(keyEvent.key)) {
      keyEvent.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  if (isPointerOnly) {
    return (
      <Popover
        content={<span className={styles.noteText}>{noteText}</span>}
        trigger={ANTD_POPOVER_TRIGGER_HOVER}
        placement={placement}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <span className={iconClassName} aria-hidden>
          <span className={styles.icon}>{iconComponent ?? <InfoCircleOutlined />}</span>
        </span>
      </Popover>
    );
  }

  return (
    <Popover
      content={<span className={styles.noteText}>{noteText}</span>}
      trigger={ANTD_POPOVER_TRIGGER_HOVER_AND_CLICK}
      placement={placement}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <span
        className={iconClassName}
        role={ARIA_ROLE_NOTE}
        tabIndex={KEYBOARD_FOCUSABLE_TAB_INDEX}
        aria-label={noteText}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.icon} aria-hidden>{iconComponent ?? <InfoCircleOutlined />}</span>
      </span>
    </Popover>
  );
};
