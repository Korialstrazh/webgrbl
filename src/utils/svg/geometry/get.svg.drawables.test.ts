import { getSvgDrawables } from './get.svg.drawables';
import type { SvgDrawable } from './interfaces/SvgDrawable';
import type { SvgDrawableSet } from './interfaces/SvgDrawableSet';
import { SVG_UNSUPPORTED_KIND } from './svg.shape.constants';
import { SVG_NAMESPACE_URI, XLINK_NAMESPACE_URI } from '../svg.constants';

const TOLERANCE = 0.05;
const RED = '#ff0000';
const BLUE = '#0000ff';
const UNIT_SQUARE = 'width="1" height="1"';

const getSvgText = (content: string): string =>
  `<svg xmlns="${SVG_NAMESPACE_URI}" xmlns:xlink="${XLINK_NAMESPACE_URI}" width="10mm" height="10mm">${content}</svg>`;

const getDrawableSet = (content: string): SvgDrawableSet => getSvgDrawables(getSvgText(content), TOLERANCE);

const getOnlyDrawable = (content: string): SvgDrawable => {
  const { drawables }: SvgDrawableSet = getDrawableSet(content);

  expect(drawables).toHaveLength(1);

  if (!drawables[0]) {
    throw new Error('no drawable');
  }

  return drawables[0];
};

describe(getSvgDrawables.name, () => {
  it('reports text and image as unsupported once per kind and draws nothing for them', () => {
    expect(getDrawableSet(`
      <text>Hello<tspan>world</tspan></text>
      <text><textPath>again</textPath></text>
      <image ${UNIT_SQUARE}/>
    `)).toEqual({ drawables: [], unsupported: [SVG_UNSUPPORTED_KIND.TEXT, SVG_UNSUPPORTED_KIND.IMAGE] });
  });

  it('does not report hidden text', () => {
    expect(getDrawableSet('<text display="none">Hello</text><defs><text>x</text></defs>').unsupported).toEqual([]);
  });

  it('draws the element a use points to, moved by the use x and y', () => {
    const drawable: SvgDrawable = getOnlyDrawable(
      `<defs><rect id="a" ${UNIT_SQUARE} fill="${RED}"/></defs><use href="#a" x="5" y="6"/>`,
    );

    expect(drawable.subpaths).toEqual([
      { points: [{ x: 5, y: 6 }, { x: 6, y: 6 }, { x: 6, y: 7 }, { x: 5, y: 7 }], isClosed: true },
    ]);
    expect(drawable.paint.fill?.colour).toBe(RED);
  });

  it('follows xlink:href and gives the referenced shape the paint inherited from the use', () => {
    const drawable: SvgDrawable = getOnlyDrawable(
      `<defs><rect id="a" ${UNIT_SQUARE}/></defs><use xlink:href="#a" fill="${BLUE}"/>`,
    );

    expect(drawable.paint.fill?.colour).toBe(BLUE);
  });

  it('stops at a use that refers to itself through its ancestor', () => {
    const drawable: SvgDrawable = getOnlyDrawable(`<g id="loop"><rect ${UNIT_SQUARE}/><use href="#loop"/></g>`);

    expect(drawable.subpaths).toHaveLength(1);
  });

  it('ends a loop of uses that point to each other and still draws the shapes on the way', () => {
    const { drawables }: SvgDrawableSet = getDrawableSet(`
      <defs>
        <g id="first"><rect ${UNIT_SQUARE}/><use href="#second"/></g>
        <g id="second"><circle r="1"/><use href="#first"/></g>
      </defs>
      <use href="#first"/>
    `);

    expect(drawables).toHaveLength(2);
  });

  it('draws the content of a symbol through a use', () => {
    const drawable: SvgDrawable = getOnlyDrawable(
      `<symbol id="s" viewBox="0 0 1 1"><rect ${UNIT_SQUARE}/></symbol><use href="#s" x="3"/>`,
    );

    expect(drawable.subpaths[0]?.points[0]).toEqual({ x: 3, y: 0 });
  });

  it('skips undisplayed, hidden, fully transparent and unpainted shapes', () => {
    expect(getDrawableSet(`
      <rect ${UNIT_SQUARE} display="none"/>
      <g visibility="hidden"><rect ${UNIT_SQUARE}/></g>
      <rect ${UNIT_SQUARE} opacity="0"/>
      <rect ${UNIT_SQUARE} fill="none"/>
      <defs><rect ${UNIT_SQUARE}/></defs>
    `).drawables).toEqual([]);
  });

  it('numbers the drawables in document order', () => {
    const { drawables }: SvgDrawableSet = getDrawableSet(
      `<rect ${UNIT_SQUARE}/><g><circle r="1"/></g><line x2="1" stroke="${RED}"/>`,
    );

    expect(drawables.map((drawable: SvgDrawable): number => drawable.paintOrder)).toEqual([0, 1, 2]);
  });

  it('composes the transforms down the ancestor chain', () => {
    const drawable: SvgDrawable = getOnlyDrawable(
      `<g transform="translate(10 0)"><rect transform="scale(2)" ${UNIT_SQUARE}/></g>`,
    );

    expect(drawable.subpaths[0]?.points).toEqual([{ x: 10, y: 0 }, { x: 12, y: 0 }, { x: 12, y: 2 }, { x: 10, y: 2 }]);
  });

  it('gives a line no fill, and its stroke width scaled by the transforms', () => {
    const drawable: SvgDrawable = getOnlyDrawable(
      `<g transform="scale(2)"><line x2="1" stroke="${RED}" stroke-width="3"/></g>`,
    );

    expect(drawable.paint).toEqual({
      fill: undefined,
      stroke: { colour: RED, opacity: 1, gradient: undefined },
      strokeWidth: 6,
    });
  });

  it('gives nothing for text that is not an SVG', () => {
    expect(getSvgDrawables('not svg', TOLERANCE)).toEqual({ drawables: [], unsupported: [] });
  });
});
