/**
 * What the bed view controls give: the viewport and the zoom and pan steps, each kept inside the limits.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedViewport } from '../../../utils/bed/interfaces/BedViewport';
import type { ProjectObject } from '../../../utils/project/interfaces/ProjectObject';
import type { BedPanStep } from './BedPanStep';
import type { BedZoomStep } from './BedZoomStep';

export interface BedViewportControls {
  viewport: BedViewport;
  zoomBedBy: BedZoomStep;
  panBedBy: BedPanStep;
  /** Shows the whole bed fitted to the view again. */
  fitBedToView: () => void;
  /** Shows the whole bed and every given object, parts off the bed included. */
  fitAllObjectsToView: (projectObjects: readonly ProjectObject[]) => void;
}
