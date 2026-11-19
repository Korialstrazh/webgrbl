/**
 * Props of an object artwork drawn by layer in the Design view.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { DesignLayerLooks } from '../../../../../utils/bed/interfaces/DesignLayerLooks';
import type { ObjectDesignDrawing } from '../../../../../utils/bed/interfaces/ObjectDesignDrawing';

export interface ObjectDesignArtworkProps {
  /** The artwork read into paths, in artwork millimetres; the same object while the artwork does not change. */
  designDrawing: ObjectDesignDrawing;
  /** How each layer is drawn; the same object while the layers do not change. */
  layerLooks: DesignLayerLooks;
}
