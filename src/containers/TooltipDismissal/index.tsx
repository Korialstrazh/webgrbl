/**
 * Closes hover tooltips when the window is resized, loses focus, anything scrolls or the bed view changes, so a tooltip
 * never floats detached from a control that has moved or gone. On a touch screen a tap opens a hover tooltip that
 * never gets its leave, so the element the pointer last entered is remembered and told to close. Renders nothing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import { useSelector } from 'react-redux';
import type { BedViewMode } from '../../utils/bed/bed.view.constants';
import {
  BLUR_EVENT_NAME,
  MOUSE_OVER_EVENT_NAME,
  RESIZE_EVENT_NAME,
  SCROLL_EVENT_NAME,
} from '../../utils/browser/browser.events.constants';
import { dismissHoverTooltips } from '../../utils/browser/dismiss.hover.tooltips';
import { selectBedViewMode } from '../../utils/states/bed.view.state';

// Scroll events do not bubble, so the capture phase on the document sees the scroll of every card and list.
const USE_CAPTURE_PHASE = true;

export const TooltipDismissal = (): ReactNode => {
  const viewMode: BedViewMode = useSelector(selectBedViewMode);
  const lastEnteredElementRef: RefObject<Element | undefined> = useRef<Element | undefined>(undefined);

  useEffect(() => {
    const rememberEnteredElement = (event: Event): void => {
      lastEnteredElementRef.current = event.target instanceof Element ? event.target : undefined;
    };
    const dismissTooltips = (): void => {
      dismissHoverTooltips(lastEnteredElementRef.current);
    };

    document.addEventListener(MOUSE_OVER_EVENT_NAME, rememberEnteredElement, USE_CAPTURE_PHASE);
    document.addEventListener(SCROLL_EVENT_NAME, dismissTooltips, USE_CAPTURE_PHASE);
    window.addEventListener(RESIZE_EVENT_NAME, dismissTooltips);
    window.addEventListener(BLUR_EVENT_NAME, dismissTooltips);

    return (): void => {
      document.removeEventListener(MOUSE_OVER_EVENT_NAME, rememberEnteredElement, USE_CAPTURE_PHASE);
      document.removeEventListener(SCROLL_EVENT_NAME, dismissTooltips, USE_CAPTURE_PHASE);
      window.removeEventListener(RESIZE_EVENT_NAME, dismissTooltips);
      window.removeEventListener(BLUR_EVENT_NAME, dismissTooltips);
    };
  }, []);

  useEffect(() => {
    dismissHoverTooltips(lastEnteredElementRef.current);
  }, [viewMode]);

  return undefined;
};
