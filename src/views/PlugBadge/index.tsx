/**
 * A small unplugged-plug badge on a control that needs a laser or a profile. The reason lives in its tooltip, which
 * opens on hover and on keyboard focus, so the screen stays quiet and the reason can still be read.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DisconnectOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS } from '../../utils/antd.constants';
import { KEYBOARD_FOCUSABLE_TAB_INDEX } from '../../utils/tab.index.constants';
import styles from './styles.module.scss';

interface PlugBadgeProps {
  /** Why the control is blocked: the tooltip and the accessible name. */
  reasonText: string;
}

export const PlugBadge = ({ reasonText }: PlugBadgeProps): ReactNode => (
  <Tooltip title={reasonText} trigger={ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS}>
    <span className={styles.plugBadge} role="img" aria-label={reasonText} tabIndex={KEYBOARD_FOCUSABLE_TAB_INDEX}>
      <DisconnectOutlined aria-hidden />
    </span>
  </Tooltip>
);
