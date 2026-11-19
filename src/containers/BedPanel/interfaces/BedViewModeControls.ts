/**
 * The bed view mode and how to change it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedViewMode } from '../../../utils/bed/bed.view.constants';

export interface BedViewModeControls {
  /** The view the bed shows. */
  viewMode: BedViewMode;
  /** Switches the view; entering Toolpath or 3D may ask for a toolpath. */
  changeBedViewMode: (viewMode: BedViewMode) => void;
}
