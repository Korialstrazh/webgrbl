/**
 * Reads the colour of the cut square from an object's SVG text; undefined when the text is not a test sample.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSampleSvgText } from './get.sample.svg.text';

const SAMPLE_STROKE_PATTERN = /stroke="(#[0-9a-f]{6})"/;

export const getSampleCutColour = (svgText: string): string | undefined => {
  const cutColour: string | undefined = SAMPLE_STROKE_PATTERN.exec(svgText)?.[1];
  const isSampleText: boolean = !!cutColour && [true, false].some(
    (hasGradient: boolean): boolean => svgText === getSampleSvgText({ cutColour, hasGradient }),
  );

  return isSampleText ? cutColour : undefined;
};
