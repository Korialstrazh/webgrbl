/**
 * A pan step of the bed view: moves the bed with a pointer move, in CSS pixels.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedScreenPoint } from '../../../utils/bed/interfaces/BedScreenPoint';

export type BedPanStep = (pointerDelta: BedScreenPoint) => void;
