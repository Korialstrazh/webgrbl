/**
 * One preset of the bed colour picker: its colour and the name it is offered under.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BedColourPreset {
  /** The bed colour as #rrggbb. */
  colour: string;
  /** Localisation key of the preset name, shown in its tooltip and read as its accessible name. */
  labelKey: string;
}
