/**
 * An action as an icon over one word, so it explains itself without a hover. The longer name stays the accessible name
 * and, with the reason it is off, the tooltip (on hover and on focus), which opens below the row and away from the
 * actions above it. An off action has no fill, a dashed outline and a small lock on its icon, so it never looks like
 * one that can be used; when it is blocked for a reason it stays focusable (aria-disabled) and ignores activation.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { LockFilled } from '@ant-design/icons';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';
import type { MouseEvent, ReactNode } from 'react';
import {
  ANTD_TOOLTIP_PLACEMENT_BOTTOM,
  ANTD_TOOLTIP_PLACEMENT_LEFT,
  ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS,
} from '../../utils/antd.constants';
import { DismissibleTooltip } from '../DismissibleTooltip';
import { CAPTIONED_ACTION_LOCK_TEST_ID } from './captioned.action.constants';
import styles from './styles.module.scss';

interface CaptionedActionButtonProps extends Omit<ButtonProps, 'icon' | 'children' | 'aria-label' | 'disabled'> {
  /** The full name of the action: the tooltip and the accessible name. */
  labelText: string;
  captionText: string;
  iconComponent: ReactNode;
  /** Why the action is off; it replaces the label in the tooltip and turns the button off. */
  blockedReasonText?: string;
  isDisabled?: boolean;
  /** False on a main action: a name in a tooltip would cover what is around it. A blocked reason still shows. */
  isLabelTooltipShown?: boolean;
  /** True on a secondary action beside a main one: a faint border, so it never draws the eye first. */
  isQuiet?: boolean;
}

export const CaptionedActionButton = (props: CaptionedActionButtonProps): ReactNode => {
  const {
    labelText,
    captionText,
    iconComponent,
    blockedReasonText,
    isDisabled = false,
    isLabelTooltipShown = true,
    isQuiet = false,
    className,
    onClick,
    ...buttonProps
  } = props;
  const tooltipText: string | undefined = blockedReasonText ?? (isLabelTooltipShown ? labelText : undefined);
  const isBlocked: boolean = Boolean(blockedReasonText);
  const isButtonDisabled: boolean = isDisabled || isBlocked;

  // A blocked action stays in the tab order, so keyboard and screen reader users reach its reason; a click, Enter or
  // Space on it does nothing and never reaches a wrapper such as a confirmation.
  const handleClick = (clickEvent: MouseEvent<HTMLElement>): void => {
    if (isBlocked) {
      clickEvent.preventDefault();
      clickEvent.stopPropagation();

      return;
    }

    onClick?.(clickEvent);
  };

  return (
    // The tooltip opens on keyboard focus too, so the reason a locked action is off shows without a pointer.
    <DismissibleTooltip
      title={tooltipText}
      // A main action's reason opens to its side, so it never covers the smaller actions laid out below it.
      placement={isLabelTooltipShown ? ANTD_TOOLTIP_PLACEMENT_BOTTOM : ANTD_TOOLTIP_PLACEMENT_LEFT}
      trigger={ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS}
    >
      <Button
        {...buttonProps}
        className={[styles.captionedActionButton, isQuiet ? styles.quiet : undefined, className].join(' ')}
        aria-label={labelText}
        aria-description={blockedReasonText}
        aria-disabled={isBlocked || undefined}
        disabled={isDisabled && !isBlocked}
        onClick={handleClick}
      >
        <span className={styles.icon} aria-hidden>
          {iconComponent}
          {isButtonDisabled && <LockFilled className={styles.lockBadge} data-testid={CAPTIONED_ACTION_LOCK_TEST_ID} />}
        </span>
        <span className={styles.caption}>{captionText}</span>
      </Button>
    </DismissibleTooltip>
  );
};
