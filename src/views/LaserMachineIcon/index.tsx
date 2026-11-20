/**
 * The laser machine of a Laser profile: a laser head with cooling fins and a nozzle, its beam and the sparks where the
 * beam meets the work surface. The icon set has none.
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
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* The laser module: a box with cooling fins and a tapered nozzle. */}
    <path d="M4.5 1.5h7v5h-7Z" />
    <path d="M6.5 3v2 M8 3v2 M9.5 3v2" />
    <path d="M6 6.5l1 1.5h2l1-1.5" />
    {/* The beam, a step bolder, down to the work surface, with sparks where it burns. */}
    <path d="M8 8v4.5" strokeWidth="1.4" />
    <path d="M1.5 14.5h13" />
    <path d="M5 11.5l1.3 1.3 M11 11.5l-1.3 1.3 M4.5 13.5h1.3 M11.5 13.5h-1.3" />
  </svg>
);

export const LaserMachineIcon = (props: IconComponentProps): ReactNode => (
  <Icon component={LaserMachineIconDrawing} {...props} />
);
