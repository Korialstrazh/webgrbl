/**
 * A cube with its top face filled: the view from above, the same cube as the 3D view.
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

const CubeTopIconDrawing = (): ReactNode => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M8 1.5 14 5v6l-6 3.5L2 11V5Z M2 5l6 3.5L14 5 M8 8.5v6" strokeLinejoin="round" />
    <path d="M8 1.5 14 5 8 8.5 2 5Z" fill="currentColor" />
  </svg>
);

export const CubeTopIcon = (props: IconComponentProps): ReactNode => <Icon component={CubeTopIconDrawing} {...props} />;
