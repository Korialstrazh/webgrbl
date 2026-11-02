/**
 * What the bed view controls give: the viewport and the zoom and pan steps, each kept inside the limits.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedViewport } from '../../../utils/bed/interfaces/BedViewport';
import type { BedPanStep } from './BedPanStep';
import type { BedZoomStep } from './BedZoomStep';

export interface BedViewportControls {
  viewport: BedViewport;
  zoomBedBy: BedZoomStep;
  panBedBy: BedPanStep;
  /** Shows the whole bed fitted to the view again. */
  fitBedToView: () => void;
}
