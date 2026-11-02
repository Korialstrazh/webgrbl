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
import type { JogDirection } from '../../../../utils/machine/machine.command.constants';

export interface JogPadCell {
  /** Localisation key of the accessible name. */
  labelKey: string;
  /** How far the arrow icon turns clockwise from up, in degrees; undefined for the centre cell, which shows a label. */
  arrowRotationDeg: number | undefined;
  /** The direction a press jogs in; undefined for the centre cell, which goes to the work zero. */
  direction: JogDirection | undefined;
}
