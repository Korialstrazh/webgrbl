/**
 * A screen matrix for SVG elements in tests: jsdom has no getScreenCTM. Installed once for every test it reports no
 * matrix, like an SVG that is not on screen; a test that needs a drawn bed sets one with mockSvgScreenMatrix.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgScreenMatrixMock } from './interfaces/SvgScreenMatrixMock';

const GET_SCREEN_CTM_PROPERTY = 'getScreenCTM';

/** The matrix of an SVG drawn at one screen pixel per user unit, at the top left of the page. */
export const IDENTITY_SVG_MATRIX: SvgScreenMatrixMock = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

const defineGetScreenCtm = (getScreenCtm: () => unknown): void => {
  Object.defineProperty(SVGSVGElement.prototype, GET_SCREEN_CTM_PROPERTY, { configurable: true, value: getScreenCtm });
};

/** Makes every SVG report no screen matrix. */
export const installSvgScreenMatrixMock = (): void => {
  defineGetScreenCtm(() => null);
};

/**
 * Makes every SVG report the given matrices: `svgToScreen` maps user units to screen pixels, and `screenToSvg` is what
 * its inverse() gives. They are passed apart so a test can give a matrix that cannot be inverted.
 */
export const mockSvgScreenMatrix = (svgToScreen: SvgScreenMatrixMock, screenToSvg: SvgScreenMatrixMock): void => {
  defineGetScreenCtm(() => ({ ...svgToScreen, inverse: () => screenToSvg }));
};
