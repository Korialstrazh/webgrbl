/**
 * A form field label with an icon before its text, the language of the layer settings drawer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
