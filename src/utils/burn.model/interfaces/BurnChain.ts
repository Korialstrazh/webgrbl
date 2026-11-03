/**
 * One unbroken run of burning moves on a Line-mode layer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
