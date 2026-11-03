/**
 * The place of a pointer event on the canvas of the 3D scene, as the renderer reads it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnScenePointer } from '../../utils/burn.scene/interfaces/BurnScenePointer';

const NDC_SPAN = 2;

export const getBurnScenePointer = (
  canvas: HTMLCanvasElement,
  { clientX, clientY }: Pick<PointerEvent, 'clientX' | 'clientY'>,
): BurnScenePointer => {
  const { left, top, width, height }: DOMRect = canvas.getBoundingClientRect();

  return {
    xNdc: ((clientX - left) / width) * NDC_SPAN - 1,
    yNdc: 1 - ((clientY - top) / height) * NDC_SPAN,
  };
};
