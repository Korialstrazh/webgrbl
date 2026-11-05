/**
 * The colour of the bed: a drop of colour above the work surface. The icon set has none.
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

const BedColourIconDrawing = (): ReactNode => (
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
    <path d="M8 1.5s3.5 3.6 3.5 6a3.5 3.5 0 0 1-7 0c0-2.4 3.5-6 3.5-6Z" />
    <path d="M1.5 14h13" stroke="var(--color-accent)" />
  </svg>
);

export const BedColourIcon = (props: IconComponentProps): ReactNode => (
  <Icon component={BedColourIconDrawing} {...props} />
);
