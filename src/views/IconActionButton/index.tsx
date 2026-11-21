/**
 * An icon action: the button names itself with its label for assistive technology, and a tooltip shows the label, or
 * why the action is off. With a caption it also shows that short text beside the icon, for rows that must read without
 * hovering. The tooltip goes away on a click, so it never covers what the click opened. A button that stays focusable
 * while off keeps its tooltip on hover and keyboard focus: it is marked aria-disabled and ignores clicks instead.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Button } from 'antd';
import type { ButtonProps } from 'antd';
import type { MouseEvent, ReactNode } from 'react';
import { ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS } from '../../utils/antd.constants';
import { DismissibleTooltip } from '../DismissibleTooltip';

interface IconActionButtonProps extends Omit<ButtonProps, 'icon' | 'children' | 'aria-label' | 'disabled'> {
  /** What the action does: the tooltip and the accessible name. */
  labelText: string;
  iconComponent: ReactNode;
  /** Why the action is off; it replaces the label in the tooltip and turns the button off. */
  blockedReasonText?: string;
  isDisabled?: boolean;
  /** A short visible text beside the icon; without it the button shows the icon only. */
  captionText?: string;
  /** A tooltip that says more than the label, such as the label with its keyboard shortcut. */
  tooltipText?: string;
  /** Keeps the off button in the Tab order, so its tooltip (why it is off) shows on hover and on keyboard focus. */
  isFocusableWhenDisabled?: boolean;
}

export const IconActionButton = (props: IconActionButtonProps): ReactNode => {
  const {
    labelText,
    iconComponent,
    blockedReasonText,
    isDisabled = false,
    captionText,
    tooltipText,
    isFocusableWhenDisabled = false,
    onClick,
    ...buttonProps
  } = props;
  const isOff: boolean = isDisabled || Boolean(blockedReasonText);
  // A disabled button gets no pointer or focus events, so its tooltip could never open; aria-disabled keeps them.
  const isAriaDisabled: boolean = isOff && isFocusableWhenDisabled;

  return (
    <DismissibleTooltip
      title={blockedReasonText ?? tooltipText ?? labelText}
      {...(isFocusableWhenDisabled ? { trigger: ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS } : {})}
    >
      <Button
        {...buttonProps}
        icon={iconComponent}
        aria-label={labelText}
        aria-description={blockedReasonText}
        aria-disabled={isAriaDisabled || undefined}
        disabled={isOff && !isFocusableWhenDisabled}
        onClick={(event: MouseEvent<HTMLElement>) => {
          if (!isAriaDisabled) {
            onClick?.(event);
          }
        }}
      >
        {captionText}
      </Button>
    </DismissibleTooltip>
  );
};
