/**
 * Reads where an object's drawn geometry sits inside its box, once per SVG and imported size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
