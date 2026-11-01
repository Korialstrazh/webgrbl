import type { SvgPathSegment } from './interfaces/SvgPathSegment';
import { getSvgPathSegments } from './parse.svg.path.data';
import { SVG_PATH_SEGMENT_KIND } from './svg.path.constants';

describe(getSvgPathSegments.name, () => {
  it('makes relative lines, horizontal and vertical lines absolute and closes the subpath', () => {
    expect(getSvgPathSegments('M10 20 l5 5 h5 v-5 z')).toEqual([
      { kind: SVG_PATH_SEGMENT_KIND.MOVE, point: { x: 10, y: 20 } },
      { kind: SVG_PATH_SEGMENT_KIND.LINE, point: { x: 15, y: 25 } },
      { kind: SVG_PATH_SEGMENT_KIND.LINE, point: { x: 20, y: 25 } },
      { kind: SVG_PATH_SEGMENT_KIND.LINE, point: { x: 20, y: 20 } },
      { kind: SVG_PATH_SEGMENT_KIND.CLOSE },
    ]);
  });

  it('reflects the last cubic control point for a relative smooth cubic', () => {
    const segments: SvgPathSegment[] = getSvgPathSegments('M0 0 C10 0 20 10 20 20 s10 20 20 20');

    expect(segments[2]).toEqual({
      kind: SVG_PATH_SEGMENT_KIND.CUBIC,
      control1: { x: 20, y: 30 },
      control2: { x: 30, y: 40 },
      point: { x: 40, y: 40 },
    });
  });

  it('uses the current point as the first control point of a smooth cubic after a line', () => {
    const segments: SvgPathSegment[] = getSvgPathSegments('M0 0 L10 0 S20 10 30 0');

    expect(segments[2]).toEqual({
      kind: SVG_PATH_SEGMENT_KIND.CUBIC,
      control1: { x: 10, y: 0 },
      control2: { x: 20, y: 10 },
      point: { x: 30, y: 0 },
    });
  });

  it('reflects the quadratic control point for absolute and relative smooth quadratics', () => {
    const segments: SvgPathSegment[] = getSvgPathSegments('M0 0 Q10 10 20 0 T40 0 t20 0');

    expect(segments.slice(2)).toEqual([
      { kind: SVG_PATH_SEGMENT_KIND.QUADRATIC, control: { x: 30, y: -10 }, point: { x: 40, y: 0 } },
      { kind: SVG_PATH_SEGMENT_KIND.QUADRATIC, control: { x: 50, y: 10 }, point: { x: 60, y: 0 } },
    ]);
  });

  it('reads numbers written together, with a leading point, an exponent or commas', () => {
    expect(getSvgPathSegments('M1.5.5L-.5,1e1')).toEqual([
      { kind: SVG_PATH_SEGMENT_KIND.MOVE, point: { x: 1.5, y: 0.5 } },
      { kind: SVG_PATH_SEGMENT_KIND.LINE, point: { x: -0.5, y: 10 } },
    ]);
  });

  it('treats extra coordinate pairs after a relative move as relative lines', () => {
    expect(getSvgPathSegments('m10 10 5 5 5 0')).toEqual([
      { kind: SVG_PATH_SEGMENT_KIND.MOVE, point: { x: 10, y: 10 } },
      { kind: SVG_PATH_SEGMENT_KIND.LINE, point: { x: 15, y: 15 } },
      { kind: SVG_PATH_SEGMENT_KIND.LINE, point: { x: 20, y: 15 } },
    ]);
  });

  it('reads arc flags written without separators and makes a relative arc absolute', () => {
    expect(getSvgPathSegments('M10 0a5 6 30 0110 0')[1]).toEqual({
      kind: SVG_PATH_SEGMENT_KIND.ARC,
      radiusX: 5,
      radiusY: 6,
      rotationDeg: 30,
      isLargeArc: false,
      isSweep: true,
      point: { x: 20, y: 0 },
    });
  });

  it('starts a relative command after close from the start of the closed subpath', () => {
    expect(getSvgPathSegments('M10 10 l10 0 z l0 10').at(-1)).toEqual({
      kind: SVG_PATH_SEGMENT_KIND.LINE,
      point: { x: 10, y: 20 },
    });
  });

  it('keeps the segments before an error and drops the rest', () => {
    expect(getSvgPathSegments('M0 0 L10 10 X 5 L20 20')).toEqual([
      { kind: SVG_PATH_SEGMENT_KIND.MOVE, point: { x: 0, y: 0 } },
      { kind: SVG_PATH_SEGMENT_KIND.LINE, point: { x: 10, y: 10 } },
    ]);
  });

  it('gives no segments for path data that does not start with a move', () => {
    expect(getSvgPathSegments('L10 10')).toEqual([]);
  });
});
