/**
 * Holds the bed viewport of one bed view for the session and gives its zoom, pan and fit steps. It starts from the
 * kept viewport, when there is one, and keeps every change there, so leaving for the 3D view and back keeps the zoom.
 * Each step works on the latest viewport and view size, so steps that come quickly one after another, like wheel
 * events, add up. While a drawer has pushed the bed into a strip it shows the bed filling that strip; the first zoom or
 * pan starts from there, and once the drawer closes the viewport from before it opened comes back.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BED_VIEW_CENTER_FRACTION } from '../../utils/bed/bed.zoom.constants';
import { getPannedBedViewport } from '../../utils/bed/get.panned.bed.viewport';
import { getZoomedBedViewport } from '../../utils/bed/get.zoomed.bed.viewport';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import type { BedScreenPoint } from '../../utils/bed/interfaces/BedScreenPoint';
import type { BedScreenSize } from '../../utils/bed/interfaces/BedScreenSize';
import type { BedViewport } from '../../utils/bed/interfaces/BedViewport';
import { newCoverBedViewport } from '../../utils/bed/new.cover.bed.viewport';
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
  isCoverFitWanted = false,
): BedViewportControls => {
  const [viewport, setViewport] = useState<BedViewport>(
    () => keptViewportRef?.current ?? newFitBedViewport(dimensions),
  );
  const [isCovering, setIsCovering] = useState<boolean>(false);
  // The listeners keep one step function, so the step reads the size of the moment from here.
  const screenSizeRef = useRef<BedScreenSize>(screenSize);
  const viewportRef = useRef<BedViewport>(viewport);
  // Read by the steps, so quick steps one after another start from the filled strip only once.
  const isCoveringRef = useRef<boolean>(false);
  // The viewport from before the drawer opened, given back once it closes.
  const viewportBeforeCoverRef = useRef<BedViewport | undefined>(undefined);

  screenSizeRef.current = screenSize;
  viewportRef.current = viewport;

  useEffect(() => {
    if (keptViewportRef) {
      keptViewportRef.current = viewport;
    }
  }, [keptViewportRef, viewport]);

  useEffect(() => {
    if (isCoverFitWanted) {
      viewportBeforeCoverRef.current = viewportRef.current;
      isCoveringRef.current = true;
      setIsCovering(true);

      return;
    }

    const viewportBeforeCover: BedViewport | undefined = viewportBeforeCoverRef.current;

    viewportBeforeCoverRef.current = undefined;
    isCoveringRef.current = false;
    setIsCovering(false);

    if (viewportBeforeCover) {
      setViewport(viewportBeforeCover);
    }
  }, [isCoverFitWanted]);

  /** The filled strip, once, on the first step after a drawer opened; undefined when the step starts from the state. */
  const takeCoverStartViewport = useCallback((): BedViewport | undefined => {
    if (!isCoveringRef.current) {
      return undefined;
    }

    isCoveringRef.current = false;
    setIsCovering(false);

    return newCoverBedViewport(dimensions, screenSizeRef.current);
  }, [dimensions]);

  const zoomBedBy = useCallback((zoomFactor: number, anchorPoint?: BedScreenPoint): void => {
    const coverStartViewport: BedViewport | undefined = takeCoverStartViewport();

    setViewport((currentViewport: BedViewport): BedViewport => getZoomedBedViewport({
      viewport: coverStartViewport ?? currentViewport,
      screenSize: screenSizeRef.current,
      dimensions,
      anchorPoint: anchorPoint ?? getViewCentre(screenSizeRef.current),
      zoomFactor,
    }));
  }, [dimensions, takeCoverStartViewport]);

  const panBedBy = useCallback((pointerDelta: BedScreenPoint): void => {
    const coverStartViewport: BedViewport | undefined = takeCoverStartViewport();

    setViewport((currentViewport: BedViewport): BedViewport => getPannedBedViewport({
      viewport: coverStartViewport ?? currentViewport,
      screenSize: screenSizeRef.current,
      dimensions,
      pointerDelta,
    }));
  }, [dimensions, takeCoverStartViewport]);

  const fitBedToView = useCallback((): void => {
    isCoveringRef.current = false;
    setIsCovering(false);
    setViewport(newFitBedViewport(dimensions));
  }, [dimensions]);

  const shownViewport: BedViewport = useMemo(
    () => (isCovering ? newCoverBedViewport(dimensions, screenSize) : viewport),
    [isCovering, dimensions, screenSize, viewport],
  );

  return { viewport: shownViewport, zoomBedBy, panBedBy, fitBedToView };
};
