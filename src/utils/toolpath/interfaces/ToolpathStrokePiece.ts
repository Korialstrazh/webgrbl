/**
 * One drawn piece of a burn path group at one time: a whole chunk of its moves, or the burnt or remaining part of the
 * chunk the head is in.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
