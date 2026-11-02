/**
 * Props of BedZoomControls: the zoom shown as a percentage of the fitted bed, whether it can still grow or shrink, and
 * the button callbacks.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';

export interface BedZoomControlsProps {
  /** A further view control at the start of the cluster, such as the bed colour button. */
  leadingControlComponent?: ReactNode;
  /** The zoom as a whole percentage; 100 shows the whole bed fitted to the view. */
  zoomPercent: number;
  /** False at the largest zoom. */
  canZoomIn: boolean;
  /** False at the smallest zoom. */
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}
