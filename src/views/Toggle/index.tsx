/**
 * A labelled on/off switch built on a real checkbox.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ChangeEvent, ReactNode } from 'react';
import styles from './styles.module.scss';

interface ToggleProps {
  label: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  isDisabled?: boolean;
}

export const Toggle = ({ label, isChecked, onChange, isDisabled = false }: ToggleProps): ReactNode => (
  <label className={styles.toggle}>
    <input
      type="checkbox"
      className={styles.input}
      checked={isChecked}
      disabled={isDisabled}
      onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => onChange(changeEvent.target.checked)}
    />
    <span className={styles.label}>{label}</span>
  </label>
);
