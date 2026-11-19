/**
 * The laser machine of a Laser profile: a gantry, its head and an accent beam on the work plate. The icon set has
 * none.
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
    <path d="M5 1.5h6v4.5l-1.5 2h-3L5 6Z" />
    <path d="M8 8v4.5" strokeWidth="1.6" />
    <path d="M2 14.5h12" />
    <path d="M4.5 10.5l1.2 1.2 M11.5 10.5l-1.2 1.2" />
  </svg>
);

export const LaserMachineIcon = (props: IconComponentProps): ReactNode => (
  <Icon component={LaserMachineIconDrawing} {...props} />
);
