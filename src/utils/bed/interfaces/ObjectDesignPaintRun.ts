/**
 * A run of design paths that follow each other in drawing order and share one paint role and one layer, so the Design
 * view styles them as one group.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { DesignPaintRole } from '../bed.design.constants';
import type { ObjectDesignPaint } from './ObjectDesignPaint';

export interface ObjectDesignPaintRun {
  /** A key unique within the object's drawing. */
  runKey: string;
  /** The paint role every path of the run shares. */
  role: DesignPaintRole;
  /** The layer every path of the run belongs to. */
  layerKey: string;
  /** The paths in drawing order. */
  paints: ObjectDesignPaint[];
}
