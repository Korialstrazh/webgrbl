/**
 * Payload of a new burn order for the project layers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface LayerKeysPayload {
  /** Keys of the visible layers in the new burn order; hidden layers keep their old order after them. */
  layerKeys: string[];
}
