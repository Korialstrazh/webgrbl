/**
 * Gets the job size as text: millimetres and centimetres, plus the closest DIN A size and how far the job is off it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { TFunction } from 'i18next';
import { MIDDLE_DOT } from '../characters.constants';
import { DEFAULT } from '../localization/default.locales';
import { getDinAMatch } from './get.din.a.match';
import type { DinAMatch } from './interfaces/DinAMatch';
import type { JobSizeMm } from './interfaces/JobSizeMm';

const PART_SEPARATOR = ` ${MIDDLE_DOT} `;
const DIFFERENCE_SEPARATOR = ', ';
const MM_PER_CM = 10;
const DECIMAL_STEP = 10;

/** Rounds to 1 decimal; String() drops a trailing .0. */
const getRoundedNumberText = (value: number): string => String(Math.round(value * DECIMAL_STEP) / DECIMAL_STEP);

const getDifferenceText = (t: TFunction, deltaMm: number, negativeKey: string, positiveKey: string): string => {
  const amount: string = getRoundedNumberText(Math.abs(deltaMm));

  return t(deltaMm < 0 ? negativeKey : positiveKey, { amount });
};

const getDinAText = (t: TFunction, match: DinAMatch): string => {
  if (match.isExact) {
    return t(DEFAULT.JOB_SIZE_DIN_EXACT, { name: match.name });
  }

  const differenceTexts: string[] = [
    t(DEFAULT.JOB_SIZE_DIN_CLOSE, {
      name: match.name,
      width: getRoundedNumberText(match.widthMm),
      height: getRoundedNumberText(match.heightMm),
    }),
  ];

  if (getRoundedNumberText(match.widthDeltaMm) !== '0') {
    differenceTexts.push(
      getDifferenceText(t, match.widthDeltaMm, DEFAULT.JOB_SIZE_NARROWER, DEFAULT.JOB_SIZE_WIDER),
    );
  }

  if (getRoundedNumberText(match.heightDeltaMm) !== '0') {
    differenceTexts.push(
      getDifferenceText(t, match.heightDeltaMm, DEFAULT.JOB_SIZE_SHORTER, DEFAULT.JOB_SIZE_TALLER),
    );
  }

  return differenceTexts.join(DIFFERENCE_SEPARATOR);
};

export const getJobSizeText = (size: JobSizeMm, t: TFunction): string => {
  const sizeText: string = t(DEFAULT.JOB_SIZE_MM, {
    width: getRoundedNumberText(size.widthMm),
    height: getRoundedNumberText(size.heightMm),
    widthCm: getRoundedNumberText(size.widthMm / MM_PER_CM),
    heightCm: getRoundedNumberText(size.heightMm / MM_PER_CM),
  });
  const match: DinAMatch | undefined = getDinAMatch(size.widthMm, size.heightMm);

  return match ? [sizeText, getDinAText(t, match)].join(PART_SEPARATOR) : sizeText;
};
