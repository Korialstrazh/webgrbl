/**
 * An action as an icon over one word, so it explains itself without a hover. The longer name stays the accessible name
 * and, with the reason it is off, the tooltip, which opens below the row and away from the actions above it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button } from 'antd';
import type { ButtonProps } from 'antd';
import type { ReactNode } from 'react';
import { ANTD_TOOLTIP_PLACEMENT_BOTTOM } from '../../utils/antd.constants';
import { DismissibleTooltip } from '../DismissibleTooltip';
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
}

export const CaptionedActionButton = (props: CaptionedActionButtonProps): ReactNode => {
  const {
    labelText,
    captionText,
    iconComponent,
    blockedReasonText,
    isDisabled = false,
    isLabelTooltipShown = true,
    className,
    ...buttonProps
  } = props;
  const tooltipText: string | undefined = blockedReasonText ?? (isLabelTooltipShown ? labelText : undefined);

  return (
    <DismissibleTooltip title={tooltipText} placement={ANTD_TOOLTIP_PLACEMENT_BOTTOM}>
      <Button
        {...buttonProps}
        className={[styles.captionedActionButton, className].join(' ')}
        aria-label={labelText}
        aria-description={blockedReasonText}
        disabled={isDisabled || Boolean(blockedReasonText)}
      >
        <span className={styles.icon} aria-hidden>{iconComponent}</span>
        <span className={styles.caption}>{captionText}</span>
      </Button>
    </DismissibleTooltip>
  );
};
