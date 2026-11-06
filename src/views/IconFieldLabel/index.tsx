/**
 * A form field label with an icon before its text, the language of the layer settings drawer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import styles from './styles.module.scss';

interface IconFieldLabelProps {
  iconComponent: ReactNode;
  labelText: string;
}

export const IconFieldLabel = ({ iconComponent, labelText }: IconFieldLabelProps): ReactNode => (
  <>
    <span className={styles.icon} aria-hidden>{iconComponent}</span>
    {labelText}
  </>
);
