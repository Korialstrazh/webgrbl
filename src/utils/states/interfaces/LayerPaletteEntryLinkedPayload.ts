/**
 * Payload of linking a project layer to a palette entry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface LayerPaletteEntryLinkedPayload {
  /** Key of the layer: its colour, or the shading key. */
  layerKey: string;
  /** Id of the palette entry the layer now comes from. */
  paletteEntryId: string;
}
