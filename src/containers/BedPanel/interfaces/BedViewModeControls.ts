/**
 * The bed view mode and how to change it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedViewMode } from '../../../utils/bed/bed.view.constants';

export interface BedViewModeControls {
  /** The view the bed shows. */
  viewMode: BedViewMode;
  /** Switches the view; entering Toolpath or 3D may ask for a toolpath. */
  changeBedViewMode: (viewMode: BedViewMode) => void;
}
