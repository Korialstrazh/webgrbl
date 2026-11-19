/**
 * Whether the Design view can show an object artwork exactly as it was drawn: nothing of it could be read into paths,
 * or every paint is on a layer that is on and fills. Such an artwork burns as it looks, so the cheaper image of the SVG
 * stands in for the per-layer paths.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { LAYER_MODE } from '../palette/palette.constants';
import type { DesignLayerLook } from './interfaces/DesignLayerLook';
import type { DesignLayerLooks } from './interfaces/DesignLayerLooks';
import type { ObjectDesignDrawing } from './interfaces/ObjectDesignDrawing';
import type { ObjectDesignPaintRun } from './interfaces/ObjectDesignPaintRun';

/** A paint on no layer yet, such as before the layers are read, keeps its drawn look. */
const isRunDrawnAsAuthored = (run: ObjectDesignPaintRun, layerLooks: DesignLayerLooks): boolean => {
  const layerLook: DesignLayerLook | undefined = layerLooks.get(run.layerKey);

  return !layerLook || (layerLook.isEnabled && layerLook.mode === LAYER_MODE.FILL);
};

export const isDesignDrawnAsAuthored = (designDrawing: ObjectDesignDrawing, layerLooks: DesignLayerLooks): boolean =>
  !designDrawing.runs.length
  || designDrawing.runs.every((run: ObjectDesignPaintRun): boolean => isRunDrawnAsAuthored(run, layerLooks));
