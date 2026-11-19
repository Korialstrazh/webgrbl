/**
 * A zoom step of the bed view: zooms by the factor around the view point, or around the view centre when left out.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedScreenPoint } from '../../../utils/bed/interfaces/BedScreenPoint';

export type BedZoomStep = (zoomFactor: number, anchorPoint?: BedScreenPoint) => void;
