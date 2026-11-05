/**
 * The laser machine of a Laser profile: a gantry, its head and an accent beam on the work plate. The icon set has
 * none.
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

const LaserMachineIconDrawing = (): ReactNode => (
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
    <path d="M2 2.5h12 M2 2.5v11 M14 2.5v11 M1 13.5h14" />
    <path d="M6 2.5h4v3.5l-2 1.5-2-1.5Z" />
    <path d="M8 8v3.5" stroke="var(--color-accent)" strokeWidth="1.6" />
  </svg>
);

export const LaserMachineIcon = (props: IconComponentProps): ReactNode => (
  <Icon component={LaserMachineIconDrawing} {...props} />
);
