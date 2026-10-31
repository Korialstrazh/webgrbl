/**
 * Reads an SVG length (a number with an optional unit) as millimetres.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { SVG_LENGTH_UNIT, SVG_LENGTH_UNIT_MM, SVG_LENGTH_PATTERN } from './svg.constants';
import type { SvgLengthUnit } from './svg.constants';

const isSvgLengthUnit = (unit: string): unit is SvgLengthUnit => unit in SVG_LENGTH_UNIT_MM;

export const getSvgLengthMm = (value: string | null): number | undefined => {
  const match: RegExpMatchArray | null = value ? SVG_LENGTH_PATTERN.exec(value) : null;

  if (!match) {
    return undefined;
  }

  const [, amountText, unitText = ''] = match;
  const unit: string = unitText.toLowerCase() || SVG_LENGTH_UNIT.PIXEL;
  const amount: number = Number(amountText);

  if (!isSvgLengthUnit(unit) || !(amount > 0)) {
    return undefined;
  }

  return amount * SVG_LENGTH_UNIT_MM[unit];
};
