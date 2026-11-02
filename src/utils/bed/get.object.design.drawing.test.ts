import { describe, expect, it } from 'vitest';
import { DESIGN_PAINT_ROLE } from './bed.design.constants';
import { getObjectDesignDrawing } from './get.object.design.drawing';
import type { ObjectDesignDrawing } from './interfaces/ObjectDesignDrawing';
import type { ObjectDesignPaint } from './interfaces/ObjectDesignPaint';
import { SHADING_LAYER_COLOUR } from '../layers/layer.constants';
import { SVG_FILL_RULE } from '../svg/geometry/svg.geometry.constants';

const RED = '#ff0000';
const BLUE = '#0000ff';
const ARTWORK_SIZE_MM = 10;
// A 10 x 10 user-unit view box drawn at 10 mm: one user unit is one millimetre.
const SVG_OPEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width="10mm" height="10mm">';
const SVG_CLOSE = '</svg>';

const getDrawing = (body: string): ObjectDesignDrawing => getObjectDesignDrawing({
  svgText: SVG_OPEN + body + SVG_CLOSE,
  intrinsicWidthMm: ARTWORK_SIZE_MM,
  intrinsicHeightMm: ARTWORK_SIZE_MM,
});

const getPaints = (drawing: ObjectDesignDrawing): ObjectDesignPaint[] => drawing.runs.flatMap((run) => run.paints);

describe(getObjectDesignDrawing.name, () => {
  it('gives a filled rectangle one closed fill path on its colour layer, in artwork millimetres', () => {
    const [paint] = getPaints(getDrawing(`<rect x="1" y="2" width="3" height="4" fill="${RED}"/>`));

    expect(paint).toEqual({
      role: DESIGN_PAINT_ROLE.FILL,
      layerKey: RED,
      pathData: 'M1 2L4 2L4 6L1 6Z',
      colour: RED,
      opacity: 1,
      strokeWidthMm: 0,
      fillRule: SVG_FILL_RULE.NONZERO,
    });
  });

  it('gives a shape with fill and stroke a fill path first and then a stroke path with its width', () => {
    const paints: ObjectDesignPaint[] = getPaints(
      getDrawing(`<rect width="4" height="4" fill="${RED}" stroke="${BLUE}" stroke-width="0.5"/>`),
    );

    expect(paints.map((paint: ObjectDesignPaint) => [paint.role, paint.layerKey, paint.strokeWidthMm])).toEqual([
      [DESIGN_PAINT_ROLE.FILL, RED, 0],
      [DESIGN_PAINT_ROLE.STROKE, BLUE, 0.5],
    ]);
  });

  it('puts grey paints on the shading layer', () => {
    const [paint] = getPaints(getDrawing('<rect width="4" height="4" fill="#808080"/>'));

    expect(paint?.layerKey).toBe(SHADING_LAYER_COLOUR);
  });

  it('keeps following paths of one role and layer in one run and starts a new run on a change', () => {
    const drawing: ObjectDesignDrawing = getDrawing(
      `<rect width="1" height="1" fill="${RED}"/><rect x="2" width="1" height="1" fill="${RED}"/>`
      + `<rect x="4" width="1" height="1" fill="${BLUE}"/>`,
    );

    expect(drawing.runs.map((run) => [run.layerKey, run.paints.length])).toEqual([[RED, 2], [BLUE, 1]]);
  });

  it('gives no runs for text that is not an SVG', () => {
    const drawing: ObjectDesignDrawing = getObjectDesignDrawing({
      svgText: 'not an svg',
      intrinsicWidthMm: ARTWORK_SIZE_MM,
      intrinsicHeightMm: ARTWORK_SIZE_MM,
    });

    expect(drawing.runs).toEqual([]);
  });

  it('gives the same drawing object for the same artwork, so the view does not redraw it', () => {
    const body = `<circle cx="5" cy="5" r="2" fill="${RED}"/>`;

    expect(getDrawing(body)).toBe(getDrawing(body));
  });
});
