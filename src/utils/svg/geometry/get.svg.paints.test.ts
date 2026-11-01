import type { SvgPaint } from './interfaces/SvgPaint';
import { getSvgPaints } from './get.svg.paints';
import type { SvgGradientStop } from './interfaces/SvgGradientStop';
import { SVG_GRADIENT_KIND } from './svg.geometry.constants';
import { SVG_NAMESPACE_URI, XLINK_NAMESPACE_URI } from '../svg.constants';

const RED = '#ff0000';
const BLUE = '#0000ff';
const BLACK = '#000000';
const WHITE = '#ffffff';
const GREEN = '#00ff00';

const getSvgText = (content: string): string =>
  `<svg xmlns="${SVG_NAMESPACE_URI}" xmlns:xlink="${XLINK_NAMESPACE_URI}" width="10mm" height="10mm">${content}</svg>`;

const getColours = (paints: SvgPaint[]): string[] => paints.map((paint: SvgPaint): string => paint.colour).sort();

describe(getSvgPaints.name, () => {
  it('finds the visible fill and stroke colours and skips none and opacity 0', () => {
    const paints: SvgPaint[] = getSvgPaints(
      getSvgText(`
        <rect fill="${RED}" width="1" height="1"/>
        <rect fill="none" style="stroke:${BLUE}" width="1" height="1"/>
        <g fill="${RED}"><circle r="1"/></g>
        <rect fill="none" width="1" height="1"/>
        <rect fill="${GREEN}" opacity="0" width="1" height="1"/>
      `),
    );

    expect(getColours(paints)).toEqual([BLUE, RED]);
  });

  it('resolves a style element rule by class', () => {
    const paints: SvgPaint[] = getSvgPaints(
      getSvgText(`<style>.st0{fill:${RED}}</style><rect class="st0" width="1" height="1"/>`),
    );

    expect(getColours(paints)).toEqual([RED]);
  });

  it('lets an inline style win over a rule and a rule win over an attribute', () => {
    const paints: SvgPaint[] = getSvgPaints(
      getSvgText(
        `<style>#a{fill:${BLUE}} rect{fill:${GREEN}}</style>
         <rect id="a" fill="${RED}" width="1" height="1"/>
         <rect fill="${RED}" style="fill:${BLACK}" width="1" height="1"/>`,
      ),
    );

    expect(getColours(paints)).toEqual([BLACK, BLUE]);
  });

  it('multiplies the opacity down the tree and rounds it', () => {
    const paints: SvgPaint[] = getSvgPaints(
      getSvgText(`<g opacity="0.5"><rect fill="${RED}" fill-opacity="0.5" width="1" height="1"/></g>`),
    );

    expect(paints).toHaveLength(1);
    expect(paints[0]?.opacity).toBe(0.25);
  });

  it('skips drawn elements inside defs, and hidden ones', () => {
    const paints: SvgPaint[] = getSvgPaints(
      getSvgText(`
        <defs><rect fill="${RED}" width="1" height="1"/></defs>
        <rect fill="${BLUE}" display="none" width="1" height="1"/>
        <rect fill="${GREEN}" style="visibility:hidden" width="1" height="1"/>
        <rect fill="${BLACK}" width="1" height="1"/>
      `),
    );

    expect(getColours(paints)).toEqual([BLACK]);
  });

  it('uses a black fill by default and no stroke', () => {
    expect(getColours(getSvgPaints(getSvgText('<rect width="1" height="1"/>')))).toEqual([BLACK]);
  });

  it('ignores the stroke when the stroke width is 0', () => {
    const paints: SvgPaint[] = getSvgPaints(
      getSvgText(`<rect fill="none" stroke="${RED}" stroke-width="0" width="1" height="1"/>`),
    );

    expect(paints).toEqual([]);
  });

  it('returns one paint for a grey gradient with its stops', () => {
    const paints: SvgPaint[] = getSvgPaints(
      getSvgText(`
        <defs>
          <linearGradient id="g">
            <stop offset="0" stop-color="${BLACK}"/>
            <stop offset="1" stop-color="${WHITE}"/>
          </linearGradient>
        </defs>
        <rect fill="url(#g)" width="1" height="1"/>
        <rect fill="url(#g)" width="2" height="2"/>
      `),
    );

    expect(paints).toHaveLength(1);
    expect(paints[0]?.colour).toBe(BLACK);
    expect(paints[0]?.gradient?.kind).toBe(SVG_GRADIENT_KIND.LINEAR);
    expect(paints[0]?.gradient?.stops.map((stop: SvgGradientStop): string => stop.colour)).toEqual([BLACK, WHITE]);
  });

  it('follows href inheritance for gradient stops', () => {
    const paints: SvgPaint[] = getSvgPaints(
      getSvgText(`
        <defs>
          <linearGradient id="base">
            <stop offset="0" style="stop-color:${RED}"/>
            <stop offset="1" stop-color="${BLUE}"/>
          </linearGradient>
          <radialGradient id="g" xlink:href="#base"/>
        </defs>
        <rect fill="url(#g)" width="1" height="1"/>
      `),
    );

    expect(paints).toHaveLength(1);
    expect(paints[0]?.colour).toBe(RED);
    expect(paints[0]?.gradient?.kind).toBe(SVG_GRADIENT_KIND.RADIAL);
    expect(paints[0]?.gradient?.stops).toHaveLength(2);
  });

  it('gives no paint for a missing gradient', () => {
    expect(getSvgPaints(getSvgText('<rect fill="url(#missing)" width="1" height="1"/>'))).toEqual([]);
  });

  it('gives no paints for text that is not an svg', () => {
    expect(getSvgPaints('<not-xml')).toEqual([]);
  });
});
