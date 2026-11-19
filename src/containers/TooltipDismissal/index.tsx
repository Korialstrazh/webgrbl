/**
 * Closes hover tooltips when the window is resized, loses focus, anything scrolls, the bed view or the narrow region
 * changes or the tab is hidden or shown, so a tooltip never floats detached from a control that has moved or gone.
 * After a region or tab change tooltips stay hidden until the pointer moves, so a control that appears under a still
 * pointer does not open its tooltip either. On a touch screen a tap opens a hover tooltip that
 * never gets its leave, so the element the pointer last entered is remembered and told to close. Renders nothing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
  VISIBILITY_CHANGE_EVENT_NAME,
} from '../../utils/browser/browser.events.constants';
import { dismissHoverTooltips } from '../../utils/browser/dismiss.hover.tooltips';
import { holdTooltipsUntilPointerMoves } from '../../utils/browser/hold.tooltips.until.pointer.moves';
import type { TooltipHoldRelease } from '../../utils/browser/interfaces/TooltipHoldRelease';
import { selectBedViewMode } from '../../utils/states/bed.view.state';
import { selectNarrowRegion } from '../../utils/states/ui.workbench.state';
import type { WorkbenchRegion } from '../../utils/states/workbench.region.constants';

// Scroll events do not bubble, so the capture phase on the document sees the scroll of every card and list.
const USE_CAPTURE_PHASE = true;

export const TooltipDismissal = (): ReactNode => {
  const viewMode: BedViewMode = useSelector(selectBedViewMode);
  const narrowRegion: WorkbenchRegion = useSelector(selectNarrowRegion);
  const lastEnteredElementRef: RefObject<Element | undefined> = useRef<Element | undefined>(undefined);
  const releaseTooltipHoldRef: RefObject<TooltipHoldRelease | undefined> = useRef<TooltipHoldRelease | undefined>(
    undefined,
  );
  const isFirstRegionRef: RefObject<boolean> = useRef<boolean>(true);

  useEffect(() => {
    const rememberEnteredElement = (event: Event): void => {
      lastEnteredElementRef.current = event.target instanceof Element ? event.target : undefined;
    };
    const dismissTooltips = (): void => {
      dismissHoverTooltips(lastEnteredElementRef.current);
    };
    const dismissAndHoldTooltips = (): void => {
      dismissHoverTooltips(lastEnteredElementRef.current);
      releaseTooltipHoldRef.current?.();
      releaseTooltipHoldRef.current = holdTooltipsUntilPointerMoves();
    };

    document.addEventListener(MOUSE_OVER_EVENT_NAME, rememberEnteredElement, USE_CAPTURE_PHASE);
    document.addEventListener(SCROLL_EVENT_NAME, dismissTooltips, USE_CAPTURE_PHASE);
    window.addEventListener(RESIZE_EVENT_NAME, dismissTooltips);
    window.addEventListener(BLUR_EVENT_NAME, dismissTooltips);
    document.addEventListener(VISIBILITY_CHANGE_EVENT_NAME, dismissAndHoldTooltips);

    return (): void => {
      document.removeEventListener(VISIBILITY_CHANGE_EVENT_NAME, dismissAndHoldTooltips);
      releaseTooltipHoldRef.current?.();
      document.removeEventListener(MOUSE_OVER_EVENT_NAME, rememberEnteredElement, USE_CAPTURE_PHASE);
      document.removeEventListener(SCROLL_EVENT_NAME, dismissTooltips, USE_CAPTURE_PHASE);
      window.removeEventListener(RESIZE_EVENT_NAME, dismissTooltips);
      window.removeEventListener(BLUR_EVENT_NAME, dismissTooltips);
    };
  }, []);

  useEffect(() => {
    dismissHoverTooltips(lastEnteredElementRef.current);
  }, [viewMode]);

  useEffect(() => {
    if (isFirstRegionRef.current) {
      isFirstRegionRef.current = false;

      return;
    }

    dismissHoverTooltips(lastEnteredElementRef.current);
    releaseTooltipHoldRef.current?.();
    releaseTooltipHoldRef.current = holdTooltipsUntilPointerMoves();
  }, [narrowRegion]);

  return undefined;
};
