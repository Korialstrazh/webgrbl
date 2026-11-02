/**
 * One layer of a project: a colour with its laser settings, on or off, and its place in the burn order.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { LayerSettings } from './LayerSettings';

export interface ProjectLayer {
  /** Colour as lowercase #rrggbb; for the shading layer, the colour of the shading palette entry. */
  colour: string;
  /** Whether the layer is sent to the laser. */
  enabled: boolean;
  /** Burn order; lower burns first. */
  order: number;
  /** Laser settings of the layer. */
  settings: LayerSettings;
  /** Id of the palette entry the layer came from; undefined for a colour that is not in the palette. */
  paletteEntryId: string | undefined;
  /** Whether this is the shading layer that covers the whole grey axis. */
  isShading: boolean;
}
