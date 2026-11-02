import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { newProjectObject } from '../project/new.project.object';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { SVG_UNSUPPORTED_KIND } from '../svg/geometry/svg.shape.constants';
import { SVG_NAMESPACE_URI } from '../svg/svg.constants';
import { getBedDrawables } from './get.bed.drawables';
import type { BedDrawable } from './interfaces/BedDrawable';
import type { BedDrawableSet } from './interfaces/BedDrawableSet';
import { TOOLPATH_TOLERANCE_MM } from './toolpath.constants';

const FIRST_OBJECT_ID = 'first';
const SECOND_OBJECT_ID = 'second';
const OBJECT_SIZE_MM = 10;

const getSvgText = (sizeMm: number, viewBoxSize: number, content: string): string =>
  `<svg xmlns="${SVG_NAMESPACE_URI}" width="${sizeMm}mm" height="${sizeMm}mm" `
  + `viewBox="0 0 ${viewBoxSize} ${viewBoxSize}">${content}</svg>`;

const getSquareObject = (overrides: Partial<ProjectObject>): ProjectObject => newProjectObject({
  intrinsicWidthMm: OBJECT_SIZE_MM,
  intrinsicHeightMm: OBJECT_SIZE_MM,
  widthMm: OBJECT_SIZE_MM,
  heightMm: OBJECT_SIZE_MM,
  ...overrides,
});

const getDocument = (objects: ProjectObject[]): ProjectDocument => ({ objects, layers: [] });

describe(getBedDrawables.name, () => {
  it('maps the shapes into bed millimetres with Y up', () => {
    const { drawables }: BedDrawableSet = getBedDrawables(getDocument([getSquareObject({
      id: FIRST_OBJECT_ID,
      svgText: getSvgText(OBJECT_SIZE_MM, OBJECT_SIZE_MM, '<rect width="10" height="10"/>'),
      xMm: 5,
      yMm: 7,
    })]));

    expect(drawables).toHaveLength(1);
    expect(drawables[0]?.objectId).toBe(FIRST_OBJECT_ID);
    expect(drawables[0]?.subpaths).toEqual([{
      points: [{ x: 5, y: 17 }, { x: 15, y: 17 }, { x: 15, y: 7 }, { x: 5, y: 7 }],
      isClosed: true,
    }]);
  });

  it('numbers the paint order across objects in object order, then in document order', () => {
    const { drawables }: BedDrawableSet = getBedDrawables(getDocument([
      getSquareObject({
        id: FIRST_OBJECT_ID,
        svgText: getSvgText(OBJECT_SIZE_MM, OBJECT_SIZE_MM, '<rect width="1" height="1"/><circle r="1"/>'),
      }),
      getSquareObject({
        id: SECOND_OBJECT_ID,
        svgText: getSvgText(OBJECT_SIZE_MM, OBJECT_SIZE_MM, '<rect width="1" height="1"/>'),
      }),
    ]));

    expect(drawables.map(({ objectId, paintOrder }: BedDrawable) => [objectId, paintOrder])).toEqual([
      [FIRST_OBJECT_ID, 0],
      [FIRST_OBJECT_ID, 1],
      [SECOND_OBJECT_ID, 2],
    ]);
  });

  it('flattens curves to 0.05 mm in bed space even when the artwork is scaled up', () => {
    const scaledSizeMm = 100;
    const radiusMm = scaledSizeMm / 2;
    const centre: GeometryPoint = { x: radiusMm, y: radiusMm };
    const { drawables }: BedDrawableSet = getBedDrawables(getDocument([getSquareObject({
      svgText: getSvgText(OBJECT_SIZE_MM, 2, '<circle cx="1" cy="1" r="1"/>'),
      widthMm: scaledSizeMm,
      heightMm: scaledSizeMm,
    })]));
    const points: GeometryPoint[] = drawables[0]?.subpaths[0]?.points ?? [];
    const radiusErrors: number[] = points.map(
      (point: GeometryPoint): number => Math.abs(Math.hypot(point.x - centre.x, point.y - centre.y) - radiusMm),
    );

    expect(points.length).toBeGreaterThan(0);
    expect(Math.max(...radiusErrors)).toBeLessThanOrEqual(TOOLPATH_TOLERANCE_MM);
  });

  it('gives the stroke width in millimetres', () => {
    const { drawables }: BedDrawableSet = getBedDrawables(getDocument([getSquareObject({
      svgText: getSvgText(OBJECT_SIZE_MM, 2 * OBJECT_SIZE_MM, '<line x2="5" stroke="#000000" stroke-width="2"/>'),
    })]));

    expect(drawables[0]?.paint.strokeWidth).toBeCloseTo(1, 9);
  });

  it('warns about geometry outside the root viewport but still keeps it', () => {
    const { drawables, warnings }: BedDrawableSet = getBedDrawables(getDocument([
      getSquareObject({
        id: FIRST_OBJECT_ID,
        svgText: getSvgText(OBJECT_SIZE_MM, OBJECT_SIZE_MM, '<rect x="8" width="5" height="5"/>'),
      }),
      getSquareObject({
        id: SECOND_OBJECT_ID,
        svgText: getSvgText(OBJECT_SIZE_MM, 2, '<circle cx="1" cy="1" r="1"/>'),
      }),
    ]));

    expect(warnings).toEqual([{ objectId: FIRST_OBJECT_ID, kind: SVG_UNSUPPORTED_KIND.OFF_PAGE }]);
    expect(drawables).toHaveLength(2);
  });

  it('warns about unsupported content per object and skips objects whose SVG cannot be read', () => {
    expect(getBedDrawables(getDocument([
      getSquareObject({ id: FIRST_OBJECT_ID, svgText: 'not svg' }),
      getSquareObject({ id: SECOND_OBJECT_ID, svgText: getSvgText(OBJECT_SIZE_MM, OBJECT_SIZE_MM, '<text>x</text>') }),
    ]))).toEqual({
      drawables: [],
      warnings: [{ objectId: SECOND_OBJECT_ID, kind: SVG_UNSUPPORTED_KIND.TEXT }],
    });
  });
});
