/**
 * One named colour of the laser palette with the laser settings used for it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { LayerMode } from '../palette.constants';

export interface PaletteEntry {
  /** Stable identifier; the shading entry has the fixed id SHADING_ENTRY_ID. */
  id: string;
  /** Name shown to the user and written to the exported palette. */
  name: string;
  /** Colour as lowercase #rrggbb. */
  colour: string;
  /** Whether the colour is burned as a line or as a fill. */
  mode: LayerMode;
  /** Laser power in percent at the darkest point. */
  maxPowerPercent: number;
  /** Laser power in percent at the lightest point of a shaded fill. */
  minPowerPercent: number;
  /** Feed rate in mm per minute. */
  speedMmPerMin: number;
  /** How many times the shape is burned. */
  passes: number;
  /** Whether air assist is on while this entry burns. */
  airAssist: boolean;
  /** Distance in mm between the scan lines of a fill. */
  lineIntervalMm: number;
}
