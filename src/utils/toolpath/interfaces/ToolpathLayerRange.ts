/**
 * The range of toolpath moves that belong to one layer, all passes included.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ToolpathLayerRange {
  /** Key of the layer. */
  layerKey: string;
  /** Index of the first move of the layer. */
  firstMoveIndex: number;
  /** Index of the last move of the layer. */
  lastMoveIndex: number;
}
