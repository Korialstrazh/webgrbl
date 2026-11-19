/**
 * One group of burn moves the Toolpath view draws as a single SVG path: all burn moves of one layer, or of one layer
 * and one power band. Built once per toolpath; the burnt and remaining pieces at any time are cut from its texts.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ToolpathStrokePath {
  /** Unique key of the group: the layer key, plus the power band in power shading. */
  pathKey: string;
  /** Key of the layer the moves belong to. */
  layerKey: string;
  /** Power band of the moves in power shading, from 0; undefined when coloured by layer. */
  powerBand: number | undefined;
  /** Index of each move of the group in the toolpath, in burn order. */
  moveIndices: number[];
  /** Path text of each move: a line to its end, after a move to its start when it does not follow the previous one. */
  moveTexts: string[];
  /** The move texts joined in chunks of TOOLPATH_PATH_CHUNK_MOVE_COUNT, each starting with a move to. */
  chunkTexts: string[];
}
