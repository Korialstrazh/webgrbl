/**
 * A small plug status on a control that needs a laser or a profile. The reason lives in its tooltip, which opens on
 * hover and on keyboard focus, so the screen stays quiet. Given a click handler it is a button that leads to where the
 * reason is solved.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { ApiOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useAnchoredTooltipOpen } from '../../utils/hooks/use.anchored.tooltip.open';
import type { AnchoredTooltipOpen } from '../../utils/hooks/interfaces/AnchoredTooltipOpen';
import {
  ANTD_BUTTON_SIZE_SMALL,
  ANTD_BUTTON_TYPE_TEXT,
  ANTD_TOOLTIP_PLACEMENT_TOP_RIGHT,
  ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS,
} from '../../utils/antd.constants';
import { KEYBOARD_FOCUSABLE_TAB_INDEX } from '../../utils/tab.index.constants';
import styles from './styles.module.scss';

interface PlugBadgeProps {
  /** Why the control is blocked: the tooltip and the accessible name. */
  reasonText: string;
  /** The picture; a plug unless the reason is about something else. */
  iconComponent?: ReactNode;
  /** Leads to where the reason is solved; it must only open a view, never act on the machine. */
  onClick?: () => void;
}

export const PlugBadge = ({ reasonText, iconComponent = <ApiOutlined />, onClick }: PlugBadgeProps): ReactNode => {
  // The click opens another view, so the tooltip closes with it instead of staying behind once the layout moves.
  const tooltipOpen: AnchoredTooltipOpen = useAnchoredTooltipOpen();

  const handleClick = (): void => {
    tooltipOpen.close();
    onClick?.();
  };

  return (
    <Tooltip
      title={reasonText}
      // The badges sit at the right end of their card headings, so the tooltip grows leftwards, clear of the edge.
      placement={ANTD_TOOLTIP_PLACEMENT_TOP_RIGHT}
      trigger={ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS}
      open={tooltipOpen.isOpen}
      onOpenChange={tooltipOpen.setIsOpen}
    >
      {onClick ? (
        <Button
          className={styles.plugButton}
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_SMALL}
          icon={iconComponent}
          aria-label={reasonText}
          onClick={handleClick}
        />
      ) : (
        <span className={styles.plugBadge} role="img" aria-label={reasonText} tabIndex={KEYBOARD_FOCUSABLE_TAB_INDEX}>
          {iconComponent}
        </span>
      )}
    </Tooltip>
  );
};
