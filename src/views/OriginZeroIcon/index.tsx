/**
 * Two axes meeting in a corner with a small zero at the meeting point: the X/Y origin being set where the head is.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import Icon from '@ant-design/icons';
import type { IconComponentProps } from '@ant-design/icons/lib/components/Icon';
import type { ReactNode } from 'react';

const OriginZeroIconDrawing = (): ReactNode => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M3 1.5V13h11.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1.6 3.2 3 1.5l1.4 1.7M12.8 11.6l1.7 1.4-1.7 1.4" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="8.5" cy="7.5" rx="2.2" ry="3" />
  </svg>
);

export const OriginZeroIcon = (props: IconComponentProps): ReactNode => (
  <Icon component={OriginZeroIconDrawing} {...props} />
);
