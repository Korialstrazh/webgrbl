/**
 * The laser machine of a Laser profile: a bold laser head with a nozzle, its beam and two sparks where the beam meets
 * the work surface. The icon set has none.
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
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Few bold shapes, so it still reads as a laser head at 16 px: the module, its nozzle and one fin line. */}
    <path d="M3.5 1.25h9v5.5h-9Z" />
    <path d="M6 4h4" />
    <path d="M6 6.75l1 2h2l1-2" />
    {/* The beam, the boldest line, down to the work surface, with two sparks where it burns. */}
    <path d="M8 8.75v4.5" strokeWidth="2" />
    <path d="M1.75 14.75h12.5" />
    <path d="M4.5 12l1.25 1.25 M11.5 12l-1.25 1.25" />
  </svg>
);

export const LaserMachineIcon = (props: IconComponentProps): ReactNode => (
  <Icon component={LaserMachineIconDrawing} {...props} />
);
