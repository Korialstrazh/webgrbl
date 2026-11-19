/**
 * The short visible name inside a text field, an icon and one word before the value, in the muted look of the number
 * field captions, so a field still says what it holds once its placeholder is gone.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ReactNode } from 'react';
import styles from './styles.module.scss';

interface InputCaptionProps {
  iconComponent: ReactNode;
  captionText: string;
}

export const InputCaption = ({ iconComponent, captionText }: InputCaptionProps): ReactNode => (
  <span className={styles.inputCaption} aria-hidden>{iconComponent}{captionText}</span>
);
