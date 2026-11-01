import { getGradientLightness } from './get.gradient.lightness';
import { newSvgPaint } from './test.support/new.svg.paint';
import type { SvgGreyGradient } from '../svg/geometry/interfaces/SvgGreyGradient';
import type { SvgMatrix } from '../svg/geometry/interfaces/SvgMatrix';
import type { SvgPaint } from '../svg/geometry/interfaces/SvgPaint';
import { SVG_GRADIENT_KIND, SVG_GRADIENT_UNITS } from '../svg/geometry/svg.geometry.constants';
import { SVG_IDENTITY_MATRIX } from '../svg/geometry/svg.transform.constants';

const BLACK = '#000000';
const WHITE = '#ffffff';
/** From the bed box x 10..20, y 0..10 (y up) to object-box fractions (y down). */
const BED_TO_BOX_MATRIX: SvgMatrix = { a: 0.1, b: 0, c: 0, d: -0.1, e: -1, f: 1 };
const BLACK_TO_WHITE_STOPS: SvgGreyGradient['stops'] = [
  { offset: 0, colour: BLACK, opacity: 1 },
  { offset: 1, colour: WHITE, opacity: 1 },
];

const getGradientPaint = (gradient: SvgGreyGradient, opacity: number = 1): SvgPaint =>
  newSvgPaint({ colour: BLACK, opacity, gradient });

const LINEAR_ACROSS: SvgGreyGradient = {
  kind: SVG_GRADIENT_KIND.LINEAR,
  stops: BLACK_TO_WHITE_STOPS,
  x1: 0.2,
  y1: 0,
  x2: 0.8,
  y2: 0,
  units: SVG_GRADIENT_UNITS.OBJECT_BOUNDING_BOX,
};

describe(getGradientLightness.name, () => {
  it('follows a linear gradient in gradient space and pads beyond its ends', () => {
    const paint: SvgPaint = getGradientPaint(LINEAR_ACROSS);

    expect(getGradientLightness(paint, BED_TO_BOX_MATRIX, { x: 10, y: 5 })).toBe(0);
    expect(getGradientLightness(paint, BED_TO_BOX_MATRIX, { x: 15, y: 5 })).toBeCloseTo(0.5, 9);
    expect(getGradientLightness(paint, BED_TO_BOX_MATRIX, { x: 20, y: 5 })).toBe(1);
  });

  it('measures the vertical fraction from the top, as the matrix turns bed Y over', () => {
    const paint: SvgPaint = getGradientPaint({ ...LINEAR_ACROSS, x1: 0, y1: 0, x2: 0, y2: 1 });

    expect(getGradientLightness(paint, BED_TO_BOX_MATRIX, { x: 15, y: 10 })).toBe(0);
    expect(getGradientLightness(paint, BED_TO_BOX_MATRIX, { x: 15, y: 0 })).toBe(1);
  });

  it('follows a radial gradient from the centre outwards', () => {
    const paint: SvgPaint = getGradientPaint({
      kind: SVG_GRADIENT_KIND.RADIAL,
      stops: BLACK_TO_WHITE_STOPS,
      cx: 0.5,
      cy: 0.5,
      r: 0.5,
      units: SVG_GRADIENT_UNITS.OBJECT_BOUNDING_BOX,
    });

    expect(getGradientLightness(paint, BED_TO_BOX_MATRIX, { x: 15, y: 5 })).toBe(0);
    expect(getGradientLightness(paint, BED_TO_BOX_MATRIX, { x: 17.5, y: 5 })).toBeCloseTo(0.5, 9);
  });

  it('composites the paint and stop opacity over white', () => {
    const paint: SvgPaint = getGradientPaint(LINEAR_ACROSS, 0.5);

    expect(getGradientLightness(paint, BED_TO_BOX_MATRIX, { x: 10, y: 5 })).toBeCloseTo(0.5, 9);
  });

  it('evaluates a user space gradient at the exact coordinates the matrix gives', () => {
    const paint: SvgPaint = getGradientPaint({
      ...LINEAR_ACROSS,
      x1: 12,
      x2: 18,
      units: SVG_GRADIENT_UNITS.USER_SPACE_ON_USE,
    });

    expect(getGradientLightness(paint, SVG_IDENTITY_MATRIX, { x: 12, y: 5 })).toBe(0);
    expect(getGradientLightness(paint, SVG_IDENTITY_MATRIX, { x: 15, y: 5 })).toBeCloseTo(0.5, 9);
    expect(getGradientLightness(paint, SVG_IDENTITY_MATRIX, { x: 18, y: 5 })).toBe(1);
  });

  it('falls back to the first stop colour when the gradient cannot be placed', () => {
    expect(getGradientLightness(getGradientPaint(LINEAR_ACROSS), undefined, { x: 15, y: 5 })).toBe(0);
  });
});
