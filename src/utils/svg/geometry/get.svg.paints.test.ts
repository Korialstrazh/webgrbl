import { SVG_NAMESPACE_URI, XLINK_NAMESPACE_URI } from '../svg.constants';
import { getSvgPaints } from './get.svg.paints';
import type { SvgGradientStop } from './interfaces/SvgGradientStop';
import type { SvgPaint } from './interfaces/SvgPaint';
import { SVG_GRADIENT_KIND, SVG_INHERIT_KEYWORD, SVG_UNSET_KEYWORD } from './svg.geometry.constants';

const RED = '#ff0000';
const BLUE = '#0000ff';
const BLACK = '#000000';
const WHITE = '#ffffff';
const GREEN = '#00ff00';
const HALF_OPACITY = 0.5;

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

  it.each(['transparent', 'bogus', 'hsl(nonsense)'])('gives no paint for the fill %s', (fillValue: string) => {
    const paints: SvgPaint[] = getSvgPaints(getSvgText(`<g fill="${RED}"><rect fill="${fillValue}"/></g>`));

    expect(paints).toEqual([]);
  });

  it.each(['rgba(255,0,0,0.5)', 'hsla(0,100%,50%,0.5)', '#ff000080'])(
    'folds the alpha of %s into the opacity',
    (fillValue: string) => {
      const paints: SvgPaint[] = getSvgPaints(getSvgText(`<rect fill="${fillValue}" width="1" height="1"/>`));

      expect(paints).toHaveLength(1);
      expect(paints[0]?.colour).toBe(RED);
      expect(paints[0]?.opacity).toBeCloseTo(HALF_OPACITY, 2);
    },
  );

  it.each(['rgb(100%,0%,0%)', 'hsl(0,100%,50%)'])('reads the fill %s as red', (fillValue: string) => {
    expect(getColours(getSvgPaints(getSvgText(`<rect fill="${fillValue}" width="1" height="1"/>`)))).toEqual([RED]);
  });

  it('resolves currentColor from an inherited color property', () => {
    const paints: SvgPaint[] = getSvgPaints(
      getSvgText(`<g color="${RED}" fill="none"><rect stroke="currentColor" width="1" height="1"/></g>`),
    );

    expect(getColours(paints)).toEqual([RED]);
  });

  it('resolves currentColor set on the root svg element, as icon sets do', () => {
    const svgText: string = [
      `<svg xmlns="${SVG_NAMESPACE_URI}" width="10" height="10"`,
      ` color="${BLUE}" fill="none" stroke="currentColor"><path d="M0 0L1 1"/></svg>`,
    ].join('');

    expect(getColours(getSvgPaints(svgText))).toEqual([BLUE]);
  });

  it('uses black for currentColor when no color is set', () => {
    expect(getColours(getSvgPaints(getSvgText('<rect fill="currentColor" width="1" height="1"/>')))).toEqual([BLACK]);
  });

  it('uses the fallback colour of a paint whose reference is missing', () => {
    const paints: SvgPaint[] = getSvgPaints(getSvgText(`<rect fill="url(#missing) ${RED}" width="1" height="1"/>`));

    expect(getColours(paints)).toEqual([RED]);
  });

  it.each([
    ['fill attribute', `fill="${SVG_INHERIT_KEYWORD}"`],
    ['unset fill attribute', `fill="${SVG_UNSET_KEYWORD}"`],
    ['fill style', `style="fill:${SVG_INHERIT_KEYWORD}"`],
    ['fill with a missing reference', `fill="url(#missing) ${SVG_INHERIT_KEYWORD}"`],
  ])('inherits the parent fill for the %s', (_caseName: string, attributes: string) => {
    const paints: SvgPaint[] = getSvgPaints(getSvgText(`<g fill="${RED}"><path ${attributes} d="M0 0L1 1"/></g>`));

    expect(getColours(paints)).toEqual([RED]);
  });

  it.each([
    `stroke="${SVG_INHERIT_KEYWORD}"`,
    `style="stroke:${SVG_INHERIT_KEYWORD}"`,
  ])('inherits the parent stroke for %s', (attributes: string) => {
    const paints: SvgPaint[] = getSvgPaints(
      getSvgText(`<g fill="none" stroke="${BLUE}"><path ${attributes} d="M0 0L1 1"/></g>`),
    );

    expect(getColours(paints)).toEqual([BLUE]);
  });

  it('gives no paints for text that is not an svg', () => {
    expect(getSvgPaints('<not-xml')).toEqual([]);
  });
  it('finds the colour a use gives to the shape it draws', () => {
    const paints: SvgPaint[] = getSvgPaints(
      getSvgText(`<defs><rect id="a" width="1" height="1"/></defs><use href="#a" fill="${BLUE}"/>`),
    );

    expect(getColours(paints)).toEqual([BLUE]);
  });
});
