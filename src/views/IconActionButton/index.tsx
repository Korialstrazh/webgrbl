/**
 * An icon action: the button names itself with its label for assistive technology, and a tooltip shows the label, or
 * why the action is off. With a caption it also shows that short text beside the icon, for rows that must read without
 * hovering. The tooltip goes away on a click, so it never covers what the click opened.
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
import type { ReactNode } from 'react';
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
}

export const IconActionButton = (props: IconActionButtonProps): ReactNode => {
  const { labelText, iconComponent, blockedReasonText, isDisabled = false, captionText, ...buttonProps } = props;

  return (
    <DismissibleTooltip title={blockedReasonText ?? labelText}>
      <Button
        {...buttonProps}
        icon={iconComponent}
        aria-label={labelText}
        aria-description={blockedReasonText}
        disabled={isDisabled || Boolean(blockedReasonText)}
      >
        {captionText}
      </Button>
    </DismissibleTooltip>
  );
};
