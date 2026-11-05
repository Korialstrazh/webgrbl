/**
 * A curved arrow going forward, the mirror of the undo arrow.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import Icon from '@ant-design/icons';
import type { IconComponentProps } from '@ant-design/icons/lib/components/Icon';
import type { ReactNode } from 'react';

const RedoArrowIconDrawing = (): ReactNode => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M10 3l3.5 3.5L10 10 M13.5 6.5H6a3.5 3.5 0 0 0 0 7h3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const RedoArrowIcon = (props: IconComponentProps): ReactNode => (
  <Icon component={RedoArrowIconDrawing} {...props} />
);
