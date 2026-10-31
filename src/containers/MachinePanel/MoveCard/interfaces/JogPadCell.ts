/**
 * One cell of the jog pad: what it shows and which text names it.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface JogPadCell {
  /** Localisation key of the accessible name. */
  labelKey: string;
  /** The arrow the button shows; undefined for the centre cell, which shows its label. */
  arrowGlyph: string | undefined;
}
