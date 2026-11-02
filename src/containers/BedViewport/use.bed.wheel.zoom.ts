/**
 * Zooms the bed with the mouse wheel or a trackpad, around the pointer. In a narrow window, where the page itself
 * scrolls, a plain wheel scrolls the page and Ctrl or Cmd plus the wheel (a trackpad pinch) zooms, so the bed never
 * traps the page scroll. The listener is not passive, so the page does not scroll while the bed zooms.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect } from 'react';
import type { RefObject } from 'react';
import { getBedWheelZoomFactor } from '../../utils/bed/get.bed.wheel.zoom.factor';
import { WHEEL_EVENT_NAME } from '../../utils/browser/browser.events.constants';
import type { BedZoomStep } from './interfaces/BedZoomStep';

export const useBedWheelZoom = (
  viewRef: RefObject<HTMLElement | null>,
  isWide: boolean,
  zoomBedBy: BedZoomStep,
): void => {
  useEffect(() => {
    const viewElement: HTMLElement | null = viewRef.current;

    if (!viewElement) {
      return undefined;
    }

    const handleWheel = (wheelEvent: WheelEvent): void => {
      const isZoomGesture: boolean = isWide || wheelEvent.ctrlKey || wheelEvent.metaKey;

      if (!isZoomGesture) {
        return;
      }

      const viewRect: DOMRect = viewElement.getBoundingClientRect();

      wheelEvent.preventDefault();
      zoomBedBy(getBedWheelZoomFactor(wheelEvent.deltaY, wheelEvent.deltaMode), {
        xPx: wheelEvent.clientX - viewRect.left,
        yPx: wheelEvent.clientY - viewRect.top,
      });
    };

    viewElement.addEventListener(WHEEL_EVENT_NAME, handleWheel, { passive: false });

    return () => {
      viewElement.removeEventListener(WHEEL_EVENT_NAME, handleWheel);
    };
  }, [viewRef, isWide, zoomBedBy]);
};
