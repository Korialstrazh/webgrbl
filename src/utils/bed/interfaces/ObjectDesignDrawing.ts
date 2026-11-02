/**
 * An object artwork read for the Design view: its painted parts grouped in runs, in drawing order.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ObjectDesignPaintRun } from './ObjectDesignPaintRun';

export interface ObjectDesignDrawing {
  /** The runs in drawing order; empty when the SVG could not be read or paints nothing. */
  runs: ObjectDesignPaintRun[];
}
