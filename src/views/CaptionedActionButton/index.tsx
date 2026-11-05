/**
 * An action as an icon over one word, so it explains itself without a hover. The longer name stays the accessible name
 * and, with the reason it is off, the tooltip, which opens below the row and away from the actions above it. An off
 * action has no fill, a dashed outline and a small lock on its icon, so it never looks like one that can be used.
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
import type { ReactNode } from 'react';
import { ANTD_TOOLTIP_PLACEMENT_BOTTOM } from '../../utils/antd.constants';
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
    ...buttonProps
  } = props;
  const tooltipText: string | undefined = blockedReasonText ?? (isLabelTooltipShown ? labelText : undefined);
  const isButtonDisabled: boolean = isDisabled || Boolean(blockedReasonText);

  return (
    <DismissibleTooltip title={tooltipText} placement={ANTD_TOOLTIP_PLACEMENT_BOTTOM}>
      <Button
        {...buttonProps}
        className={[styles.captionedActionButton, isQuiet ? styles.quiet : undefined, className].join(' ')}
        aria-label={labelText}
        aria-description={blockedReasonText}
        disabled={isButtonDisabled}
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
