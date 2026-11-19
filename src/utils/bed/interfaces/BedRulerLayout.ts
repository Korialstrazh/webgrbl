/**
 * Both bed rulers on screen: the labels and the tick marks in the top band (bed X) and in the left band (machine Y), in
 * CSS pixels from the top-left corner of the bed drawing, which starts where the bands end.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedRulerLabel } from './BedRulerLabel';
import type { BedRulerTick } from './BedRulerTick';

export interface BedRulerLayout {
  /** Labels of bed X in the top band; each is written to the right of its position. */
  topLabels: BedRulerLabel[];
  /** Labels of machine Y in the left band; each is written upwards from its position. */
  leftLabels: BedRulerLabel[];
  /** The tick marks of the top band, from the part of the bed in view only. */
  topTicks: BedRulerTick[];
  /** The tick marks of the left band, from the part of the bed in view only. */
  leftTicks: BedRulerTick[];
}
