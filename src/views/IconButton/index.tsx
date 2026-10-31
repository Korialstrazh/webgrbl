/**
 * A square button that shows only an icon; the label is its accessible name.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import styles from './styles.module.scss';

interface IconButtonProps {
  /** The accessible name, since the button shows no text. */
  label: string;
  iconComponent: ReactNode;
  onClick?: () => void;
  isDisabled?: boolean;
}

export const IconButton = ({ label, iconComponent, onClick, isDisabled = false }: IconButtonProps): ReactNode => (
  <button type="button" className={styles.iconButton} aria-label={label} disabled={isDisabled} onClick={onClick}>
    {iconComponent}
  </button>
);
