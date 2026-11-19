/**
 * One unbroken run of burning moves on a Line-mode layer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToolpathMove } from '../../toolpath/interfaces/ToolpathMove';

export interface BurnChain {
  /** Key of the layer the moves belong to. */
  layerKey: string;
  /** The moves of the run, in burn order. */
  moves: ToolpathMove[];
  /** Whether the run ends within the closed gap of its start, so it can cut a part free. */
  isClosed: boolean;
}
