/**
 * The test sample: a square with cells that burn darker step by step. The icon set has none.
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

const TestSampleIconDrawing = (): ReactNode => (
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
    <rect x="2" y="2" width="12" height="12" rx="1" />
    <rect x="4" y="4" width="3.5" height="3.5" fill="currentColor" fillOpacity="0.25" stroke="none" />
    <rect x="8.5" y="4" width="3.5" height="3.5" fill="currentColor" fillOpacity="0.5" stroke="none" />
    <rect x="4" y="8.5" width="3.5" height="3.5" fill="currentColor" fillOpacity="0.75" stroke="none" />
    <rect x="8.5" y="8.5" width="3.5" height="3.5" fill="var(--color-accent)" stroke="none" />
  </svg>
);

export const TestSampleIcon = (props: IconComponentProps): ReactNode => (
  <Icon component={TestSampleIconDrawing} {...props} />
);
