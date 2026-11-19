/**
 * What the JobCutCheckLayersCaptured action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface JobCutCheckLayersPayload {
  /** Keys of the line layers the finished job burned, in burn order. */
  layerKeys: string[];
}
