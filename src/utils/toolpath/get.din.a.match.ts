/**
 * Gets the DIN A size closest to a job size, in either orientation. A size matches when both the width and the
 * height differ by at most the tolerance; the closest has the smallest summed difference. Differences are rounded
 * to 0.1 mm.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DIN_A_COMPARE_STEP_MM, DIN_A_SIZES_MM, DIN_A_TOLERANCE_MM } from './din.a.constants';
import type { DinAMatch } from './interfaces/DinAMatch';
import type { DinASizeMm } from './interfaces/DinASizeMm';

const getRoundedDeltaMm = (valueMm: number): number => {
  const rounded: number = Math.round(valueMm / DIN_A_COMPARE_STEP_MM) * DIN_A_COMPARE_STEP_MM;

  return Math.round(rounded / DIN_A_COMPARE_STEP_MM) === 0 ? 0 : rounded;
};

const getDinAOrientationMatch = (
  size: DinASizeMm,
  widthMm: number,
  heightMm: number,
  paperWidthMm: number,
  paperHeightMm: number,
): DinAMatch | undefined => {
  const widthDeltaMm: number = getRoundedDeltaMm(widthMm - paperWidthMm);
  const heightDeltaMm: number = getRoundedDeltaMm(heightMm - paperHeightMm);
  const isInsideTolerance: boolean =
    Math.abs(widthDeltaMm) <= DIN_A_TOLERANCE_MM && Math.abs(heightDeltaMm) <= DIN_A_TOLERANCE_MM;

  if (!isInsideTolerance) {
    return undefined;
  }

  return {
    name: size.name,
    widthMm: paperWidthMm,
    heightMm: paperHeightMm,
    widthDeltaMm,
    heightDeltaMm,
    isExact: !widthDeltaMm && !heightDeltaMm,
  };
};

const getDinADistanceMm = (match: DinAMatch): number =>
  Math.abs(match.widthDeltaMm) + Math.abs(match.heightDeltaMm);

export const getDinAMatch = (widthMm: number, heightMm: number): DinAMatch | undefined => {
  let closestMatch: DinAMatch | undefined;

  for (const size of DIN_A_SIZES_MM) {
    const orientationMatches: (DinAMatch | undefined)[] = [
      getDinAOrientationMatch(size, widthMm, heightMm, size.shortMm, size.longMm),
      getDinAOrientationMatch(size, widthMm, heightMm, size.longMm, size.shortMm),
    ];

    for (const match of orientationMatches) {
      if (match && (!closestMatch || getDinADistanceMm(match) < getDinADistanceMm(closestMatch))) {
        closestMatch = match;
      }
    }
  }

  return closestMatch;
};
