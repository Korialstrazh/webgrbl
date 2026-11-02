/**
 * One preset of the bed colour picker: its colour and the name it is offered under.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BedColourPreset {
  /** The bed colour as #rrggbb. */
  colour: string;
  /** Localisation key of the preset name, shown in its tooltip and read as its accessible name. */
  labelKey: string;
}
