/**
 * A tooltip that goes away when its control is clicked, so it does not cover what the click changed. The next hover
 * shows it again. A long press opens it too, so a touch screen without hover still shows the name of an icon.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Tooltip } from 'antd';
import type { TooltipProps } from 'antd';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ANTD_TOOLTIP_TRIGGER_HOVER_AND_LONG_PRESS } from '../../utils/antd.constants';

export const DismissibleTooltip = ({ children, ...tooltipProps }: TooltipProps): ReactNode => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // A hover timer that started before the click must not bring the tooltip back while the pointer stays on the control.
  const isDismissedRef = useRef<boolean>(false);

  const changeOpen = (isNextOpen: boolean): void => {
    setIsOpen(isNextOpen && !isDismissedRef.current);
  };

  const dismiss = (): void => {
    isDismissedRef.current = true;
    setIsOpen(false);
  };

  return (
    <Tooltip
      trigger={ANTD_TOOLTIP_TRIGGER_HOVER_AND_LONG_PRESS}
      {...tooltipProps}
      open={isOpen}
      onOpenChange={changeOpen}
    >
      {/* A click on the control bubbles up to here, whatever the control does with it. */}
      <span
        onClickCapture={dismiss}
        onMouseLeave={() => {
          isDismissedRef.current = false;
        }}
      >
        {children}
      </span>
    </Tooltip>
  );
};
