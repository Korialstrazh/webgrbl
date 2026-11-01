/**
 * Reads a length such as a stroke width into user units: absolute units convert at 96 px per inch, a plain number
 * is already in user units. Gives the fallback for a percentage or anything unreadable.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgNumber } from './get.svg.number';
import { SVG_LENGTH_PATTERN, SVG_LENGTH_UNIT, SVG_LENGTH_UNIT_MM } from '../svg.constants';
import type { SvgLengthUnit } from '../svg.constants';

const isSvgLengthUnit = (unit: string): unit is SvgLengthUnit => unit in SVG_LENGTH_UNIT_MM;

export const getSvgLengthUserUnits = (value: string | undefined, fallback: number): number => {
  const match: RegExpMatchArray | null = value ? SVG_LENGTH_PATTERN.exec(value) : null;

  if (!match) {
    return getSvgNumber(value, fallback);
  }

  const unit: string = (match[2] ?? '').toLowerCase() || SVG_LENGTH_UNIT.PIXEL;

  if (!isSvgLengthUnit(unit)) {
    return fallback;
  }

  return (Number(match[1]) * SVG_LENGTH_UNIT_MM[unit]) / SVG_LENGTH_UNIT_MM[SVG_LENGTH_UNIT.PIXEL];
};
