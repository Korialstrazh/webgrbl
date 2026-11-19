/**
 * The cube of the 3D view, drawn here because the icon set has only a brand logo of that shape.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import Icon from '@ant-design/icons';
import type { IconComponentProps } from '@ant-design/icons/lib/components/Icon';
import type { ReactNode } from 'react';

const CubeIconDrawing = (): ReactNode => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M8 1.5 14 5v6l-6 3.5L2 11V5Z M2 5l6 3.5L14 5 M8 8.5v6" strokeLinejoin="round" />
  </svg>
);

export const CubeIcon = (props: IconComponentProps): ReactNode => <Icon component={CubeIconDrawing} {...props} />;
