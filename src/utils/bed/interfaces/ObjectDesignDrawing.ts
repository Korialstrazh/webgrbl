/**
 * An object artwork read for the Design view: its painted parts grouped in runs, in drawing order.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ObjectDesignPaintRun } from './ObjectDesignPaintRun';

export interface ObjectDesignDrawing {
  /** The runs in drawing order; empty when the SVG could not be read or paints nothing. */
  runs: ObjectDesignPaintRun[];
}
