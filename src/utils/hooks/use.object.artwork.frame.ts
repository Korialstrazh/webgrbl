/**
 * Reads where an object's drawn geometry sits inside its box, once per SVG and imported size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useMemo } from 'react';
import { getObjectArtworkFrame } from '../toolpath/get.object.artwork.frame';
import type { ObjectArtworkFrame } from '../toolpath/interfaces/ObjectArtworkFrame';
import type { ObjectArtworkFrameSource } from '../toolpath/interfaces/ObjectArtworkFrameSource';

export const useObjectArtworkFrame = (source: ObjectArtworkFrameSource): ObjectArtworkFrame => {
  const { svgText, intrinsicWidthMm, intrinsicHeightMm }: ObjectArtworkFrameSource = source;

  return useMemo(
    () => getObjectArtworkFrame({ svgText, intrinsicWidthMm, intrinsicHeightMm }),
    [svgText, intrinsicWidthMm, intrinsicHeightMm],
  );
};
