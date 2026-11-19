/**
 * Reads an SVG transform attribute (a list of matrix, translate, scale, rotate, skewX and skewY) into one matrix. The
 * list combines from left to right, so the last function applies first. Like a browser, an attribute with any invalid
 * part is ignored as a whole and gives the identity.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getRadiansFromDegrees } from './get.radians.from.degrees';
import { getSvgMatrixProduct } from './get.svg.matrix.product';
import type { SvgMatrix } from './interfaces/SvgMatrix';
import { SVG_POINTS_NUMBER_PATTERN } from './svg.shape.constants';
import {
  SVG_IDENTITY_MATRIX,
  SVG_TRANSFORM_ARGUMENT_COUNTS,
  SVG_TRANSFORM_FUNCTION,
  SVG_TRANSFORM_FUNCTION_NAMES,
  SVG_TRANSFORM_FUNCTION_PATTERN,
  SVG_TRANSFORM_LIST_PATTERN,
} from './svg.transform.constants';
import type { SvgTransformFunction } from './svg.transform.constants';

const ARGUMENT_SEPARATOR_PATTERN = /^[\s,]*$/;

const isSvgTransformFunction = (functionName: string): functionName is SvgTransformFunction =>
  SVG_TRANSFORM_FUNCTION_NAMES.includes(functionName);

const getTranslateMatrix = (moveX: number, moveY: number): SvgMatrix =>
  ({ ...SVG_IDENTITY_MATRIX, e: moveX, f: moveY });

const getRotateMatrix = (angleDeg: number, centreX: number, centreY: number): SvgMatrix => {
  const cosine: number = Math.cos(getRadiansFromDegrees(angleDeg));
  const sine: number = Math.sin(getRadiansFromDegrees(angleDeg));
  const rotation: SvgMatrix = { a: cosine, b: sine, c: -sine, d: cosine, e: 0, f: 0 };

  return getSvgMatrixProduct(
    getTranslateMatrix(centreX, centreY),
    getSvgMatrixProduct(rotation, getTranslateMatrix(-centreX, -centreY)),
  );
};

const getFunctionMatrix = (functionName: SvgTransformFunction, values: number[]): SvgMatrix => {
  const [first = 0, second, third = 0, fourth = 0, fifth = 0, sixth = 0] = values;

  switch (functionName) {
  case SVG_TRANSFORM_FUNCTION.MATRIX:
    return { a: first, b: second ?? 0, c: third, d: fourth, e: fifth, f: sixth };
  case SVG_TRANSFORM_FUNCTION.TRANSLATE:
    return getTranslateMatrix(first, second ?? 0);
  case SVG_TRANSFORM_FUNCTION.SCALE:
    return { ...SVG_IDENTITY_MATRIX, a: first, d: second ?? first };
  case SVG_TRANSFORM_FUNCTION.ROTATE:
    return getRotateMatrix(first, second ?? 0, third);
  case SVG_TRANSFORM_FUNCTION.SKEW_X:
    return { ...SVG_IDENTITY_MATRIX, c: Math.tan(getRadiansFromDegrees(first)) };
  case SVG_TRANSFORM_FUNCTION.SKEW_Y:
    return { ...SVG_IDENTITY_MATRIX, b: Math.tan(getRadiansFromDegrees(first)) };
  default: {
    const unknownFunction: never = functionName;

    throw new Error(`Unknown transform function ${String(unknownFunction)}`);
  }
  }
};

/** The numbers of one function's arguments, or undefined when the text holds anything else. */
const getArgumentValues = (argumentText: string): number[] | undefined => {
  const numberTexts: string[] = argumentText.match(SVG_POINTS_NUMBER_PATTERN) ?? [];
  const isOnlyNumbers: boolean = ARGUMENT_SEPARATOR_PATTERN.test(argumentText.replace(SVG_POINTS_NUMBER_PATTERN, ''));

  return isOnlyNumbers ? numberTexts.map(Number) : undefined;
};

/** True for a known transform function with an argument count it accepts. */
const isValidTransformCall = (functionName: string, values: number[]): functionName is SvgTransformFunction =>
  isSvgTransformFunction(functionName) && SVG_TRANSFORM_ARGUMENT_COUNTS[functionName].includes(values.length);

const isTransformListText = (transformText: string | null | undefined): transformText is string =>
  Boolean(transformText && SVG_TRANSFORM_LIST_PATTERN.test(transformText));

const getListMatrix = (transformText: string): SvgMatrix | undefined => {
  let listMatrix: SvgMatrix = SVG_IDENTITY_MATRIX;

  for (const [, functionName = '', argumentText = ''] of transformText.matchAll(SVG_TRANSFORM_FUNCTION_PATTERN)) {
    const values: number[] = getArgumentValues(argumentText) ?? [];

    if (!isValidTransformCall(functionName, values)) {
      return undefined;
    }

    listMatrix = getSvgMatrixProduct(listMatrix, getFunctionMatrix(functionName, values));
  }

  return listMatrix;
};

export const getSvgTransformMatrix = (transformText: string | null | undefined): SvgMatrix => {
  if (!isTransformListText(transformText)) {
    return SVG_IDENTITY_MATRIX;
  }

  return getListMatrix(transformText) ?? SVG_IDENTITY_MATRIX;
};
