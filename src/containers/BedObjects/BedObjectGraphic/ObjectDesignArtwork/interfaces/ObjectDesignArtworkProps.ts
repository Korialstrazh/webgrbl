/**
 * Props of an object artwork drawn by layer in the Design view.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { DesignLayerLooks } from '../../../../../utils/bed/interfaces/DesignLayerLooks';
import type { ObjectDesignDrawing } from '../../../../../utils/bed/interfaces/ObjectDesignDrawing';

export interface ObjectDesignArtworkProps {
  /** The artwork read into paths, in artwork millimetres; the same object while the artwork does not change. */
  designDrawing: ObjectDesignDrawing;
  /** How each layer is drawn; the same object while the layers do not change. */
  layerLooks: DesignLayerLooks;
}
