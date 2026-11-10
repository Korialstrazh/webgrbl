/**
 * Holds the bed viewport of one bed view for the session and gives its zoom, pan and fit steps. It starts from the
 * kept viewport, when there is one, and keeps every change there, so leaving for the 3D view and back keeps the zoom.
 * Each step works on the latest viewport and view size, so steps that come quickly one after another, like wheel
 * events, add up. While a drawer has pushed the bed into a strip it shows the whole bed fitted to that strip; the first
 * zoom or pan starts from there, and once the drawer closes the viewport from before it opened comes back.
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
import { getBedOverlayShiftPx } from '../../utils/bed/get.bed.overlay.shift.px';
import { getPannedBedViewport } from '../../utils/bed/get.panned.bed.viewport';
import { getZoomedBedViewport } from '../../utils/bed/get.zoomed.bed.viewport';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import type { BedScreenPoint } from '../../utils/bed/interfaces/BedScreenPoint';
import type { BedScreenSize } from '../../utils/bed/interfaces/BedScreenSize';
import type { BedViewport } from '../../utils/bed/interfaces/BedViewport';
import type { BedViewportFrame } from '../../utils/bed/interfaces/BedViewportFrame';
import { newFitBedViewport } from '../../utils/bed/new.fit.bed.viewport';
import { newSelectionFitBedViewport } from '../../utils/bed/new.selection.fit.bed.viewport';
import { newTopFitBedViewport } from '../../utils/bed/new.top.fit.bed.viewport';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
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
  isStripFitWanted = false,
  overlayInsetPx = 0,
  selectedObjects: ProjectObject[] = [],
  selectionFitRequestCount = 0,
): BedViewportControls => {
  const [viewport, setViewport] = useState<BedViewport>(
    () => keptViewportRef?.current ?? newFitBedViewport(dimensions),
  );
  const [isStripFit, setIsStripFit] = useState<boolean>(false);
  // The listeners keep one step function, so the step reads the size of the moment from here.
  const screenSizeRef = useRef<BedScreenSize>(screenSize);
  const viewportRef = useRef<BedViewport>(viewport);
  // Read by the steps, so quick steps one after another start from the fitted bed only once.
  const isStripFitRef = useRef<boolean>(false);
  // The viewport from before the drawer opened, given back once it closes.
  const viewportBeforeStripRef = useRef<BedViewport | undefined>(undefined);
  // The viewport from before a drawer slid over the bed, given back once it closes.
  const viewportBeforeOverlayRef = useRef<BedViewport | undefined>(undefined);
  // Read when a drawer opens; a later change of the selection does not move the bed again.
  const selectedObjectsRef = useRef<ProjectObject[]>(selectedObjects);

  // The count seen at mount, so a request made before this view existed does not move it.
  const handledSelectionFitCountRef = useRef<number>(selectionFitRequestCount);

  selectedObjectsRef.current = selectedObjects;

  screenSizeRef.current = screenSize;
  viewportRef.current = viewport;

  useEffect(() => {
    if (keptViewportRef) {
      keptViewportRef.current = viewport;
    }
  }, [keptViewportRef, viewport]);

  useEffect(() => {
    if (isStripFitWanted) {
      viewportBeforeStripRef.current = viewportRef.current;
      isStripFitRef.current = true;
      setIsStripFit(true);

      return;
    }

    const viewportBeforeStrip: BedViewport | undefined = viewportBeforeStripRef.current;

    viewportBeforeStripRef.current = undefined;
    isStripFitRef.current = false;
    setIsStripFit(false);

    if (viewportBeforeStrip) {
      setViewport(viewportBeforeStrip);
    }
  }, [isStripFitWanted]);

  // A drawer sliding over the bed keeps the zoom and only moves the bed right, so the selection clears it.
  useEffect(() => {
    if (overlayInsetPx > 0) {
      const viewportBeforeOverlay: BedViewport = viewportRef.current;
      const frame: BedViewportFrame = {
        viewport: viewportBeforeOverlay,
        screenSize: screenSizeRef.current,
        dimensions,
      };
      const shiftPx: number = getBedOverlayShiftPx(frame, overlayInsetPx, selectedObjectsRef.current);

      viewportBeforeOverlayRef.current = viewportBeforeOverlay;

      if (shiftPx > 0) {
        setViewport(getPannedBedViewport({ ...frame, pointerDelta: { xPx: shiftPx, yPx: 0 } }));
      }

      return;
    }

    const viewportBeforeOverlay: BedViewport | undefined = viewportBeforeOverlayRef.current;

    viewportBeforeOverlayRef.current = undefined;

    if (viewportBeforeOverlay) {
      setViewport(viewportBeforeOverlay);
    }
  }, [overlayInsetPx, dimensions]);

  useEffect(() => {
    if (selectionFitRequestCount === handledSelectionFitCountRef.current) {
      return;
    }

    handledSelectionFitCountRef.current = selectionFitRequestCount;
    const selectionViewport: BedViewport | undefined =
      newSelectionFitBedViewport(selectedObjectsRef.current, dimensions);

    if (selectionViewport) {
      isStripFitRef.current = false;
      setIsStripFit(false);
      setViewport(selectionViewport);
    }
  }, [selectionFitRequestCount, dimensions]);

  /** The fitted bed, once, on the first step after a drawer opened; undefined when the step starts from the state. */
  const takeStripStartViewport = useCallback((): BedViewport | undefined => {
    if (!isStripFitRef.current) {
      return undefined;
    }

    isStripFitRef.current = false;
    setIsStripFit(false);

    return newTopFitBedViewport(dimensions, screenSizeRef.current);
  }, [dimensions]);

  const zoomBedBy = useCallback((zoomFactor: number, anchorPoint?: BedScreenPoint): void => {
    const stripStartViewport: BedViewport | undefined = takeStripStartViewport();

    setViewport((currentViewport: BedViewport): BedViewport => getZoomedBedViewport({
      viewport: stripStartViewport ?? currentViewport,
      screenSize: screenSizeRef.current,
      dimensions,
      anchorPoint: anchorPoint ?? getViewCentre(screenSizeRef.current),
      zoomFactor,
    }));
  }, [dimensions, takeStripStartViewport]);

  const panBedBy = useCallback((pointerDelta: BedScreenPoint): void => {
    const stripStartViewport: BedViewport | undefined = takeStripStartViewport();

    setViewport((currentViewport: BedViewport): BedViewport => getPannedBedViewport({
      viewport: stripStartViewport ?? currentViewport,
      screenSize: screenSizeRef.current,
      dimensions,
      pointerDelta,
    }));
  }, [dimensions, takeStripStartViewport]);

  const fitBedToView = useCallback((): void => {
    isStripFitRef.current = false;
    setIsStripFit(false);
    setViewport(newFitBedViewport(dimensions));
  }, [dimensions]);

  const shownViewport: BedViewport = useMemo(
    // Held at the top of the strip, right under the ruler, never floating in the middle of a tall strip.
    () => (isStripFit ? newTopFitBedViewport(dimensions, screenSize) : viewport),
    [isStripFit, dimensions, screenSize, viewport],
  );

  return { viewport: shownViewport, zoomBedBy, panBedBy, fitBedToView };
};
