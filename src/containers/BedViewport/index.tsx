/**
 * The bed view: the bed drawing, its rulers in bands along the top and left, and the zoom cluster, with zoom and pan.
 * The mouse wheel zooms around the pointer, a middle drag or Space plus a drag pans, and the buttons and the plus,
 * minus and zero keys zoom in, zoom out and fit the bed. The bed point under the pointer goes to the status strip
 * through the bed cursor store. The view lives for the session and starts fitted; the bed panel keeps it while the 3D
 * view is shown. While a drawer pushes the bed aside the whole bed fits the strip left, and gets its zoom back after. The
 * zoom is the drawing's view box, so the objects layer and the Toolpath layer read pointer positions through the SVG's
 * screen matrix as before; every position is read in the drawing area, which starts where the ruler bands end.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { BED_CURSOR_STORE } from '../../utils/bed/bed.cursor.store';
import { BedZoomContext } from '../../utils/bed/bed.zoom.context';
import { BED_ZOOM_STEP_FACTOR, MAX_BED_ZOOM, MIN_BED_ZOOM } from '../../utils/bed/bed.zoom.constants';
import { getBedCursorPoint } from '../../utils/bed/get.bed.cursor.point';
import { getBedRulers } from '../../utils/bed/get.bed.rulers';
import { getBedViewBox } from '../../utils/bed/get.bed.view.box';
import type { BedRulerLayout } from '../../utils/bed/interfaces/BedRulerLayout';
import type { BedScreenSize } from '../../utils/bed/interfaces/BedScreenSize';
import type { BedViewBox } from '../../utils/bed/interfaces/BedViewBox';
import { isBedViewportFitted } from '../../utils/bed/is.bed.viewport.fitted';
import { getRootFontSizePixels } from '../../utils/browser/get.root.font.size.pixels';
import { useIsBedRegionDrawerOpen } from '../../utils/hooks/use.is.bed.region.drawer.open';
import { PERCENT_DIVISOR } from '../../utils/percent.constants';
import { BedRulers } from '../../views/BedRulers';
import { BedView } from '../../views/BedView';
import { BedZoomControls } from '../../views/BedZoomControls';
import { BedColourPicker } from '../BedColourPicker';
import type { BedPanGesture } from './interfaces/BedPanGesture';
import type { BedViewportControls } from './interfaces/BedViewportControls';
import type { BedViewportProps } from './interfaces/BedViewportProps';
import styles from './styles.module.scss';
import { useBedPanGesture } from './use.bed.pan.gesture';
import { useBedScreenSize } from './use.bed.screen.size';
import { useBedViewportControls } from './use.bed.viewport.controls';
import { useBedWheelZoom } from './use.bed.wheel.zoom';
import { useBedZoomHotkeys } from './use.bed.zoom.hotkeys';

const getDrawingAreaClassName = ({ isPanReady, isPanning }: BedPanGesture): string | undefined => {
  if (isPanning) {
    return [styles.drawingArea, styles.panning].join(' ');
  }

  return isPanReady ? [styles.drawingArea, styles.panReady].join(' ') : styles.drawingArea;
};

export const BedViewport = (props: BedViewportProps): ReactNode => {
  const { dimensions, isWide, controlsHost, keptViewportRef, children, ...markerProps } = props;
  const viewRef = useRef<HTMLDivElement>(null);
  const screenSize: BedScreenSize = useBedScreenSize(viewRef);
  const [rootFontSizePx] = useState<number>(getRootFontSizePixels);
  // Only a wide window pushes the bed aside; a narrow one lets the drawer cover it.
  const isPushedAside: boolean = useIsBedRegionDrawerOpen() && isWide;
  const { viewport, zoomBedBy, panBedBy, fitBedToView }: BedViewportControls =
    useBedViewportControls(dimensions, screenSize, keptViewportRef, isPushedAside);
  const panGesture: BedPanGesture = useBedPanGesture(panBedBy);
  const viewBox: BedViewBox = getBedViewBox({ viewport, screenSize, dimensions });
  const rulers: BedRulerLayout = useMemo(
    () => getBedRulers({ viewport, screenSize, dimensions, rootFontSizePx }),
    [viewport, screenSize, dimensions, rootFontSizePx],
  );
  const { onPointerDownCapture, onPointerMove, onPointerUp, onPointerEnter, onPointerLeave, onMouseDownCapture } =
    panGesture;

  useBedWheelZoom(viewRef, isWide, zoomBedBy);
  useBedZoomHotkeys(zoomBedBy, fitBedToView);
  useEffect(() => () => {
    BED_CURSOR_STORE.setBedCursorPoint(undefined);
  }, []);

  const handlePointerMove = (pointerEvent: PointerEvent<HTMLElement>): void => {
    const viewRect: DOMRect = pointerEvent.currentTarget.getBoundingClientRect();

    onPointerMove(pointerEvent);
    BED_CURSOR_STORE.setBedCursorPoint(getBedCursorPoint({ viewport, screenSize, dimensions }, {
      xPx: pointerEvent.clientX - viewRect.left,
      yPx: pointerEvent.clientY - viewRect.top,
    }));
  };

  const handlePointerLeave = (): void => {
    onPointerLeave();
    BED_CURSOR_STORE.setBedCursorPoint(undefined);
  };

  const zoomControlsComponent: ReactNode = (
    <BedZoomControls
      leadingControlComponent={<BedColourPicker />}
      zoomPercent={Math.round(viewport.zoom * PERCENT_DIVISOR)}
      isFitted={isBedViewportFitted(viewport, dimensions)}
      canZoomIn={viewport.zoom < MAX_BED_ZOOM}
      canZoomOut={viewport.zoom > MIN_BED_ZOOM}
      onZoomIn={() => zoomBedBy(BED_ZOOM_STEP_FACTOR)}
      onZoomOut={() => zoomBedBy(1 / BED_ZOOM_STEP_FACTOR)}
      onFit={fitBedToView}
    />
  );

  return (
    // Plain elements: the outer box holds the ruler bands and the drawing area; the drawing area is the positioned box
    // of the drawing and its overlays, the box every pointer position is read in, and it takes the pan gesture.
    <div className={styles.bedViewport}>
      <BedRulers rulers={rulers} />
      <div
        ref={viewRef}
        className={getDrawingAreaClassName(panGesture)}
        onPointerDownCapture={onPointerDownCapture}
        onPointerMove={handlePointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={onPointerEnter}
        onPointerLeave={handlePointerLeave}
        onMouseDownCapture={onMouseDownCapture}
      >
        <BedZoomContext value={viewport.zoom}>
          <BedView dimensions={dimensions} viewBox={viewBox} zoom={viewport.zoom} {...markerProps}>
            {children}
          </BedView>
        </BedZoomContext>
      </div>
      {/* The view controls sit in the bed header, never over the drawing; the viewport keeps the zoom they change. */}
      {controlsHost && createPortal(zoomControlsComponent, controlsHost)}
    </div>
  );
};
