/**
 * A painter's palette with paint dots, for the colour palette. The icon set has only a paint bucket.
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

const PALETTE_OUTLINE_PATH = 'M8 1.8C4.4 1.8 1.5 4.5 1.5 7.9c0 3.4 2.7 6.3 6 6.3 1 0 1.6-.6 1.6-1.4 0-.4-.2-.7-.4-1'
  + '-.2-.3-.4-.6-.4-1 0-.8.6-1.3 1.5-1.3h1.6c1.6 0 2.9-1.2 2.9-2.8 0-2.5-2.8-4.9-6.3-4.9Z';

const PaletteIconDrawing = (): ReactNode => (
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
    <path
      d={PALETTE_OUTLINE_PATH}
    />
    <circle cx="4.7" cy="7.4" r="0.9" fill="var(--color-accent)" stroke="none" />
    <circle cx="6.9" cy="4.8" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="10.2" cy="5" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const PaletteIcon = (props: IconComponentProps): ReactNode => (
  <Icon component={PaletteIconDrawing} {...props} />
);
