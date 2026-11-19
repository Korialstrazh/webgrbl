/**
 * Gets the SVG of the test sample: a 50 mm square outline around an inset black-to-white gradient. Layers are derived
 * from its colours, like an imported SVG, and its exact text tells the sample from other objects in a saved project.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { SVG_NAMESPACE_URI } from '../svg/svg.constants';
import type { SampleSvgParts } from './interfaces/SampleSvgParts';
import {
  SAMPLE_CUT_COLOUR,
  SAMPLE_GRADIENT_END_COLOUR,
  SAMPLE_GRADIENT_ID,
  SAMPLE_GRADIENT_INSET_MM,
  SAMPLE_GRADIENT_START_COLOUR,
  SAMPLE_OUTLINE_WIDTH_MM,
  SAMPLE_SIZE_MM,
} from './sample.job.constants';

const DEFAULT_SAMPLE_SVG_PARTS: SampleSvgParts = { cutColour: SAMPLE_CUT_COLOUR, hasGradient: true };

export const getSampleSvgText = ({ cutColour, hasGradient }: SampleSvgParts = DEFAULT_SAMPLE_SVG_PARTS): string => {
  const gradientSizeMm: number = SAMPLE_SIZE_MM - 2 * SAMPLE_GRADIENT_INSET_MM;

  const gradientText: string = hasGradient
    ? `<defs><linearGradient id="${SAMPLE_GRADIENT_ID}">`
      + `<stop offset="0" stop-color="${SAMPLE_GRADIENT_START_COLOUR}"/>`
      + `<stop offset="1" stop-color="${SAMPLE_GRADIENT_END_COLOUR}"/></linearGradient></defs>`
      + `<rect x="${SAMPLE_GRADIENT_INSET_MM}" y="${SAMPLE_GRADIENT_INSET_MM}" width="${gradientSizeMm}"`
      + ` height="${gradientSizeMm}" fill="url(#${SAMPLE_GRADIENT_ID})"/>`
    : '';

  return `<svg xmlns="${SVG_NAMESPACE_URI}" width="${SAMPLE_SIZE_MM}mm" height="${SAMPLE_SIZE_MM}mm"`
    + ` viewBox="0 0 ${SAMPLE_SIZE_MM} ${SAMPLE_SIZE_MM}">${gradientText}`
    + `<rect x="0" y="0" width="${SAMPLE_SIZE_MM}" height="${SAMPLE_SIZE_MM}" fill="none"`
    + ` stroke="${cutColour}" stroke-width="${SAMPLE_OUTLINE_WIDTH_MM}"/></svg>`;
};
