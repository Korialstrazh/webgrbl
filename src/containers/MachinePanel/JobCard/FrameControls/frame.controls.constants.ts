/**
 * Values of the frame controls: the text of each bed edge a frame can leave.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { FRAME_EDGE } from '../../../../utils/frame/frame.constants';
import type { FrameEdge } from '../../../../utils/frame/frame.constants';
import { DEFAULT } from '../../../../utils/localization/default.locales';

export const FRAME_EDGE_TEXT_KEYS: Readonly<Record<FrameEdge, string>> = {
  [FRAME_EDGE.LEFT]: DEFAULT.FRAME_EDGE_LEFT,
  [FRAME_EDGE.RIGHT]: DEFAULT.FRAME_EDGE_RIGHT,
  [FRAME_EDGE.FRONT]: DEFAULT.FRAME_EDGE_FRONT,
  [FRAME_EDGE.BACK]: DEFAULT.FRAME_EDGE_BACK,
};
