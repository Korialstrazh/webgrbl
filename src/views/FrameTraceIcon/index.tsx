/**
 * A dashed outline with the laser dot on it: the head tracing the edge of the job. Fit-to-view has its own glyph.
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

const FrameTraceIconDrawing = (): ReactNode => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="2" y="3" width="12" height="10" rx="1" strokeDasharray="2 1.6" /><circle cx="2.5" cy="3.5" r="1.7" fill="currentColor" stroke="none" />
  </svg>
);

export const FrameTraceIcon = (props: IconComponentProps): ReactNode => <Icon component={FrameTraceIconDrawing} {...props} />;
