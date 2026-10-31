/**
 * A text button in one of four variants; large buttons meet the machine-control touch target.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { BUTTON_SIZE, BUTTON_TYPE } from './button.constants';
import type { ButtonSize, ButtonType, ButtonVariant } from './button.constants';
import styles from './styles.module.scss';

interface ButtonProps {
  /** The visual weight of the button. */
  variant: ButtonVariant;
  /** Regular for forms, large for machine controls. */
  size?: ButtonSize;
  isDisabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  type?: ButtonType;
}

export const Button = ({
  variant,
  size = BUTTON_SIZE.REGULAR,
  isDisabled = false,
  onClick,
  children,
  type = BUTTON_TYPE.BUTTON,
}: ButtonProps): ReactNode => (
  <button
    type={type}
    className={[styles.button, styles[variant], styles[size]].join(' ')}
    disabled={isDisabled}
    onClick={onClick}
  >
    {children}
  </button>
);
