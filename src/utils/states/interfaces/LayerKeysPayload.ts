/**
 * Payload of a new burn order for the project layers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface LayerKeysPayload {
  /** Keys of the visible layers in the new burn order; hidden layers keep their old order after them. */
  layerKeys: string[];
}
