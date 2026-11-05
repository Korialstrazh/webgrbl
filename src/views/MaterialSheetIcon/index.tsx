/**
 * A sheet of material with its thickness and grain, for the material library. The icon set has none.
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

const MaterialSheetIconDrawing = (): ReactNode => (
  <svg
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3.5 4.5h11l-2 6.5h-11Z" />
    <path d="M1.5 11v1.5h11l2-6.5V4.5 M12.5 11v1.5" />
    <path d="M4.5 7c2-.8 3.5.8 6 0" stroke="var(--color-accent)" />
  </svg>
);

export const MaterialSheetIcon = (props: IconComponentProps): ReactNode => (
  <Icon component={MaterialSheetIconDrawing} {...props} />
);
