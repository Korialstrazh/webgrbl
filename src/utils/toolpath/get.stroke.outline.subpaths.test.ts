import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';
import { getStrokeOutlineSubpaths } from './get.stroke.outline.subpaths';
import { STROKE_JOIN_SEGMENT_COUNT } from './toolpath.constants';

const STROKE_WIDTH_MM = 2;

describe(getStrokeOutlineSubpaths.name, () => {
  it('turns each segment of an open stroke into a box of the stroke width with a round join on the outer side', () => {
    const corner: SvgSubpath = { points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }], isClosed: false };

    const outlines: SvgSubpath[] = getStrokeOutlineSubpaths([corner], STROKE_WIDTH_MM);

    expect(outlines).toHaveLength(3);
    expect(outlines[0]).toEqual({
      points: [{ x: 0, y: 1 }, { x: 10, y: 1 }, { x: 10, y: -1 }, { x: 0, y: -1 }],
      isClosed: true,
    });
    const wedgeArcPoints: GeometryPoint[] = (outlines[2]?.points ?? []).filter(
      ({ x, y }: GeometryPoint): boolean => x !== 10 || y !== 0,
    );

    expect(outlines[2]?.points).toContainEqual({ x: 10, y: 0 });
    expect(wedgeArcPoints).toHaveLength(STROKE_JOIN_SEGMENT_COUNT / 4 + 1);
    expect(
      wedgeArcPoints.every(({ x, y }: GeometryPoint): boolean => Math.abs(Math.hypot(x - 10, y) - 1) < 1e-9),
    ).toBe(true);
    expect(wedgeArcPoints.every(({ x, y }: GeometryPoint): boolean => x >= 10 - 1e-9 && y <= 1e-9)).toBe(true);
  });

  it('adds the closing segment and a join at every corner of a closed stroke', () => {
    const triangle: SvgSubpath = { points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }], isClosed: true };

    expect(getStrokeOutlineSubpaths([triangle], STROKE_WIDTH_MM)).toHaveLength(6);
  });

  it('gives nothing for a single point or a stroke without width', () => {
    const singlePoint: SvgSubpath = { points: [{ x: 1, y: 1 }], isClosed: false };
    const line: SvgSubpath = { points: [{ x: 0, y: 0 }, { x: 1, y: 0 }], isClosed: false };

    expect(getStrokeOutlineSubpaths([singlePoint], STROKE_WIDTH_MM)).toEqual([]);
    expect(getStrokeOutlineSubpaths([line], 0)).toEqual([]);
  });
});
