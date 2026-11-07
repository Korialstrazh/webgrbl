/**
 * Closes hover tooltips when the window is resized, loses focus or the bed view changes, so a tooltip never floats
 * detached from a control that has moved or gone. Renders nothing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import type { BedViewMode } from '../../utils/bed/bed.view.constants';
import { BLUR_EVENT_NAME, RESIZE_EVENT_NAME } from '../../utils/browser/browser.events.constants';
import { dismissHoverTooltips } from '../../utils/browser/dismiss.hover.tooltips';
import { selectBedViewMode } from '../../utils/states/bed.view.state';

export const TooltipDismissal = (): ReactNode => {
  const viewMode: BedViewMode = useSelector(selectBedViewMode);

  useEffect(() => {
    window.addEventListener(RESIZE_EVENT_NAME, dismissHoverTooltips);
    window.addEventListener(BLUR_EVENT_NAME, dismissHoverTooltips);

    return (): void => {
      window.removeEventListener(RESIZE_EVENT_NAME, dismissHoverTooltips);
      window.removeEventListener(BLUR_EVENT_NAME, dismissHoverTooltips);
    };
  }, []);

  useEffect(() => {
    dismissHoverTooltips();
  }, [viewMode]);

  return undefined;
};
