/**
 * A zoom step of the bed view: zooms by the factor around the view point, or around the view centre when left out.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedScreenPoint } from '../../../utils/bed/interfaces/BedScreenPoint';

export type BedZoomStep = (zoomFactor: number, anchorPoint?: BedScreenPoint) => void;
