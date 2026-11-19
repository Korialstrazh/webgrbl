/**
 * The range of toolpath moves that belong to one layer, all passes included.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ToolpathLayerRange {
  /** Key of the layer. */
  layerKey: string;
  /** Index of the first move of the layer. */
  firstMoveIndex: number;
  /** Index of the last move of the layer. */
  lastMoveIndex: number;
}
