/**
 * The place of a pointer event on the canvas of the 3D scene, as the renderer reads it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
