/**
 * Wraps one control that is not built yet. The control itself is a real disabled antd control, so it looks and acts
 * like every other control that cannot be used right now; a small "Soon" tag beside it tells why. What the control will
 * do appears in a tooltip below it on hover, or when the tag takes the keyboard focus, so the notice never adds a line
 * to a bar and never covers the controls above it.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { ANTD_TOOLTIP_PLACEMENT_BOTTOM, ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS } from '../../utils/antd.constants';
import { SoonTag } from '../SoonTag';
import styles from './styles.module.scss';

interface ComingSoonProps {
  /** What the control will do, shown in the tooltip and read out with the tag. */
  description: string;
  /** The one control, rendered disabled by the caller. */
  children: ReactNode;
}

// A short wait, so the tooltip does not flash up while the pointer only passes over the control.
const COMING_SOON_TOOLTIP_DELAY_S = 0.4;

export const ComingSoon = ({ description, children }: ComingSoonProps): ReactNode => (
  // The tooltip sits on the wrapper: a disabled button fires no pointer events, so the wrapper takes the hover.
  <Tooltip
    title={description}
    trigger={ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS}
    placement={ANTD_TOOLTIP_PLACEMENT_BOTTOM}
    mouseEnterDelay={COMING_SOON_TOOLTIP_DELAY_S}
  >
    <span className={styles.comingSoon}>
      <span className={styles.control}>{children}</span>
      <SoonTag description={description} />
    </span>
  </Tooltip>
);
