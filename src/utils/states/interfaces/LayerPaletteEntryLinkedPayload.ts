/**
 * Payload of linking a project layer to a palette entry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface LayerPaletteEntryLinkedPayload {
  /** Key of the layer: its colour, or the shading key. */
  layerKey: string;
  /** Id of the palette entry the layer now comes from. */
  paletteEntryId: string;
}
