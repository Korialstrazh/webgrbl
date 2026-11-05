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
    <rect x="1.5" y="3.5" width="13" height="9" rx="1" />
    <path d="M1.5 6.5c2.5-1 4 .8 6.5 0s3.5-.8 6.5 0" />
    <path d="M1.5 10c2.5.7 3.5-.6 6-.3" />
    <ellipse cx="10.5" cy="9.8" rx="1.7" ry="0.9" />
  </svg>
);

export const MaterialSheetIcon = (props: IconComponentProps): ReactNode => (
  <Icon component={MaterialSheetIconDrawing} {...props} />
);
