/**
 * One drawn piece of a burn path group at one time: a whole chunk of its moves, or the burnt or remaining part of the
 * chunk the head is in.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToolpathBurnState } from '../toolpath.drawing.constants';

export interface ToolpathStrokePiece {
  /** Unique within the group: the chunk index and the burn state. */
  pieceKey: string;
  /** Whether the head has passed these moves. */
  burnState: ToolpathBurnState;
  /** SVG path text of the piece; a whole chunk reuses the same prebuilt text, so its element is left unchanged. */
  pathText: string;
}
