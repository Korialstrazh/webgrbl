/**
 * Holds the bed viewport of one bed view for the session and gives its zoom, pan and fit steps. It starts from the
 * kept viewport, when there is one, and keeps every change there, so leaving for the 3D view and back keeps the zoom.
 * Each step works on the latest viewport and view size, so steps that come quickly one after another, like wheel
 * events, add up.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { BED_VIEW_CENTER_FRACTION } from '../../utils/bed/bed.zoom.constants';
import { getPannedBedViewport } from '../../utils/bed/get.panned.bed.viewport';
import { getZoomedBedViewport } from '../../utils/bed/get.zoomed.bed.viewport';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import type { BedScreenPoint } from '../../utils/bed/interfaces/BedScreenPoint';
import type { BedScreenSize } from '../../utils/bed/interfaces/BedScreenSize';
import type { BedViewport } from '../../utils/bed/interfaces/BedViewport';
import { newFitBedViewport } from '../../utils/bed/new.fit.bed.viewport';
import type { BedViewportControls } from './interfaces/BedViewportControls';
import type { KeptBedViewportRef } from './interfaces/KeptBedViewportRef';

const getViewCentre = (screenSize: BedScreenSize): BedScreenPoint => ({
  xPx: screenSize.widthPx * BED_VIEW_CENTER_FRACTION,
  yPx: screenSize.heightPx * BED_VIEW_CENTER_FRACTION,
});

export const useBedViewportControls = (
  dimensions: BedDimensions,
  screenSize: BedScreenSize,
  keptViewportRef?: KeptBedViewportRef,
): BedViewportControls => {
  const [viewport, setViewport] = useState<BedViewport>(
    () => keptViewportRef?.current ?? newFitBedViewport(dimensions),
  );
  // The listeners keep one step function, so the step reads the size of the moment from here.
  const screenSizeRef = useRef<BedScreenSize>(screenSize);

  screenSizeRef.current = screenSize;

  useEffect(() => {
    if (keptViewportRef) {
      keptViewportRef.current = viewport;
    }
  }, [keptViewportRef, viewport]);

  const zoomBedBy = useCallback((zoomFactor: number, anchorPoint?: BedScreenPoint): void => {
    setViewport((currentViewport: BedViewport): BedViewport => getZoomedBedViewport({
      viewport: currentViewport,
      screenSize: screenSizeRef.current,
      dimensions,
      anchorPoint: anchorPoint ?? getViewCentre(screenSizeRef.current),
      zoomFactor,
    }));
  }, [dimensions]);

  const panBedBy = useCallback((pointerDelta: BedScreenPoint): void => {
    setViewport((currentViewport: BedViewport): BedViewport => getPannedBedViewport({
      viewport: currentViewport,
      screenSize: screenSizeRef.current,
      dimensions,
      pointerDelta,
    }));
  }, [dimensions]);

  const fitBedToView = useCallback((): void => {
    setViewport(newFitBedViewport(dimensions));
  }, [dimensions]);

  return { viewport, zoomBedBy, panBedBy, fitBedToView };
};
