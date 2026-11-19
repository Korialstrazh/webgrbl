/**
 * A pan step of the bed view: moves the bed with a pointer move, in CSS pixels.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedScreenPoint } from '../../../utils/bed/interfaces/BedScreenPoint';

export type BedPanStep = (pointerDelta: BedScreenPoint) => void;
