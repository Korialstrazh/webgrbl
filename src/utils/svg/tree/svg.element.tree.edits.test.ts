import { getObjectsDerivedLayers } from '../../layers/get.objects.derived.layers';
import { getObjectPaints } from '../../layers/get.object.paints';
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import { DEFAULT_PALETTE } from '../../palette/palette.constants';
import type { ProjectObject } from '../../project/interfaces/ProjectObject';
import { isObjectArtworkOutsideBed } from '../../project/is.object.artwork.outside.bed';
import { newProjectObject } from '../../project/new.project.object';
import { getBedDrawables } from '../../toolpath/get.bed.drawables';
import { getObjectArtworkFrame } from '../../toolpath/get.object.artwork.frame';
import type { SvgPaint } from '../geometry/interfaces/SvgPaint';
import { SVG_NAMESPACE_URI } from '../svg.constants';
import { getSvgElementTree } from './get.svg.element.tree';
import { getSvgTextWithElementColour } from './get.svg.text.with.element.colour';
import { getSvgTextWithElementDisabled } from './get.svg.text.with.element.disabled';
import { getSvgTextWithoutElement } from './get.svg.text.without.element';
import { newSquareBedDimensions } from './test.support/new.square.bed.dimensions';

const RED = '#ff0000';
const BLUE = '#0000ff';
const BED_SIZE_MM = 100;
const PAGE_SIZE_MM = 200;
const NEAR_SQUARE_PATH = '0';
const FAR_SQUARE_PATH = '1';

/** A 200 mm page: a red square at the bed origin (bottom left) and a blue square far out, past a 100 mm bed. */
const SVG_TEXT: string = `<svg xmlns="${SVG_NAMESPACE_URI}" width="${PAGE_SIZE_MM}mm" height="${PAGE_SIZE_MM}mm" `
  + `viewBox="0 0 ${PAGE_SIZE_MM} ${PAGE_SIZE_MM}">`
  + `<rect x="0" y="190" width="10" height="10" fill="none" stroke="${RED}"/>`
  + `<rect x="180" y="0" width="10" height="10" fill="none" stroke="${BLUE}"/>`
  + '</svg>';

const getTestObject = (svgText: string): ProjectObject => newProjectObject({
  svgText,
  intrinsicWidthMm: PAGE_SIZE_MM,
  intrinsicHeightMm: PAGE_SIZE_MM,
  widthMm: PAGE_SIZE_MM,
  heightMm: PAGE_SIZE_MM,
});

const getPaintColours = (svgText: string): string[] =>
  getObjectPaints(svgText).map((paint: SvgPaint): string => paint.colour);

describe('element tree edits', () => {
  it('leaves a turned-off node out of the toolpath, the bounds and the off-bed check', () => {
    const fullObject: ProjectObject = getTestObject(SVG_TEXT);
    const trimmedObject: ProjectObject = getTestObject(getSvgTextWithElementDisabled(SVG_TEXT, FAR_SQUARE_PATH, true));

    expect(getBedDrawables({ objects: [fullObject], layers: [] }).drawables).toHaveLength(2);
    expect(getBedDrawables({ objects: [trimmedObject], layers: [] }).drawables).toHaveLength(1);
    expect(getObjectArtworkFrame(trimmedObject).widthFraction)
      .toBeLessThan(getObjectArtworkFrame(fullObject).widthFraction);
    expect(isObjectArtworkOutsideBed(fullObject, newSquareBedDimensions(BED_SIZE_MM))).toBe(true);
    expect(isObjectArtworkOutsideBed(trimmedObject, newSquareBedDimensions(BED_SIZE_MM))).toBe(false);
    expect(getPaintColours(trimmedObject.svgText)).toEqual([RED]);
  });

  it('deletes a node from the SVG', () => {
    const svgText: string = getSvgTextWithoutElement(SVG_TEXT, NEAR_SQUARE_PATH);

    expect(getSvgElementTree(svgText)).toHaveLength(1);
    expect(getPaintColours(svgText)).toEqual([BLUE]);
  });

  it('recolours a node so it joins the layer of the new colour', () => {
    const svgText: string = getSvgTextWithElementColour(SVG_TEXT, FAR_SQUARE_PATH, RED);
    const layers: ProjectLayer[] = getObjectsDerivedLayers([getTestObject(svgText)], DEFAULT_PALETTE, []);

    expect(new Set(getPaintColours(svgText))).toEqual(new Set([RED]));
    expect(layers.map((layer: ProjectLayer): string => layer.colour)).toEqual([RED]);
  });

  it('keeps an unpainted fill unpainted when recolouring', () => {
    const svgText: string = getSvgTextWithElementColour(SVG_TEXT, NEAR_SQUARE_PATH, BLUE);

    expect(getObjectPaints(svgText).every((paint: SvgPaint): boolean => paint.colour === BLUE)).toBe(true);
    expect(svgText).not.toContain(`fill:${BLUE}`);
  });

  it('leaves the text unchanged for a stale node path', () => {
    expect(getSvgTextWithoutElement(SVG_TEXT, '9')).toBe(SVG_TEXT);
  });
});
