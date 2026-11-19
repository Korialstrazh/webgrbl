/**
 * A curved arrow going back: unlike a near-closed circle, it cannot be read as refresh.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import Icon from '@ant-design/icons';
import type { IconComponentProps } from '@ant-design/icons/lib/components/Icon';
import type { ReactNode } from 'react';

const UndoArrowIconDrawing = (): ReactNode => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M6 3 2.5 6.5 6 10 M2.5 6.5H10a3.5 3.5 0 0 1 0 7H7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const UndoArrowIcon = (props: IconComponentProps): ReactNode => (
  <Icon component={UndoArrowIconDrawing} {...props} />
);
