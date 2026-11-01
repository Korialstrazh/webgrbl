import { getSvgDrawables } from './get.svg.drawables';
import type { SvgDrawable } from './interfaces/SvgDrawable';
import type { SvgDrawableSet } from './interfaces/SvgDrawableSet';
import { SVG_UNSUPPORTED_KIND } from './svg.shape.constants';
import { SVG_NAMESPACE_URI, XLINK_NAMESPACE_URI } from '../svg.constants';

const TOLERANCE = 0.05;
const RED = '#ff0000';
const BLUE = '#0000ff';
const UNIT_SQUARE = 'width="1" height="1"';
// The budget allows 20,000 copied elements, which jsdom styles and walks in a few seconds.
const USE_LIMIT_TEST_TIMEOUT_MS = 20_000;

const getSvgText = (content: string): string =>
  `<svg xmlns="${SVG_NAMESPACE_URI}" xmlns:xlink="${XLINK_NAMESPACE_URI}" width="10mm" height="10mm">${content}</svg>`;

const getDrawableSet = (content: string): SvgDrawableSet => getSvgDrawables(getSvgText(content), TOLERANCE);

const VIEWPORT_SIZE = 100;
const QUICK_RUN_LIMIT_MS = 2000;

/** An SVG whose root viewport is 100 x 100 user units, as in the Inkscape checks. */
const getViewportDrawableSet = (content: string): SvgDrawableSet => getSvgDrawables(
  `<svg xmlns="${SVG_NAMESPACE_URI}" width="100mm" height="100mm" viewBox="0 0 ${VIEWPORT_SIZE} ${VIEWPORT_SIZE}">`
  + `${content}</svg>`,
  TOLERANCE,
);

const getOnlyViewportDrawable = (content: string): SvgDrawable => {
  const { drawables }: SvgDrawableSet = getViewportDrawableSet(content);

  expect(drawables).toHaveLength(1);

  if (!drawables[0]) {
    throw new Error('no drawable');
  }

  return drawables[0];
};

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

  it('stops copying nested uses at the element budget and reports the use limit', () => {
    const nestingLevels = 6;
    const usesPerLevel = 10;
    const levelDefinitions: string[] = ['<path id="a0" d="M0 0 L1 1" stroke="#000000"/>'];

    for (let level = 1; level <= nestingLevels; level++) {
      levelDefinitions.push(`<g id="a${level}">${`<use href="#a${level - 1}"/>`.repeat(usesPerLevel)}</g>`);
    }

    const { drawables, unsupported }: SvgDrawableSet = getDrawableSet(
      `<defs>${levelDefinitions.join('')}</defs><use href="#a${nestingLevels}"/>`,
    );

    expect(unsupported).toEqual([SVG_UNSUPPORTED_KIND.USE_LIMIT]);
    expect(drawables.length).toBeGreaterThan(0);
    expect(drawables.length).toBeLessThan(usesPerLevel ** nestingLevels);
  }, USE_LIMIT_TEST_TIMEOUT_MS);

  it('fits a symbol viewBox into the size of the use that draws it', () => {
    const drawable: SvgDrawable = getOnlyDrawable(
      `<symbol id="s" viewBox="-5 -5 10 10"><line x1="-5" x2="5" stroke="${RED}"/></symbol>
       <use href="#s" width="20" height="20"/>`,
    );

    expect(drawable.subpaths[0]?.points).toEqual([{ x: 0, y: 10 }, { x: 20, y: 10 }]);
  });

  it('places a nested svg at its x and y and fits its viewBox into its size', () => {
    const drawable: SvgDrawable = getOnlyDrawable(
      `<svg x="50" y="50" viewBox="0 0 10 10" width="20" height="20"><line x2="10" stroke="${RED}"/></svg>`,
    );

    expect(drawable.subpaths[0]?.points).toEqual([{ x: 50, y: 50 }, { x: 70, y: 50 }]);
  });

  it('gives a nested svg without a height the full height of the parent viewport', () => {
    const drawable: SvgDrawable = getOnlyViewportDrawable(
      `<svg x="50" y="50" viewBox="0 0 10 10" width="20"><line x2="10" stroke="${RED}"/></svg>`,
    );

    expect(drawable.subpaths[0]?.points).toEqual([{ x: 50, y: 90 }, { x: 70, y: 90 }]);
  });

  it('resolves a percentage size of a nested svg against the parent viewport', () => {
    const drawable: SvgDrawable = getOnlyViewportDrawable(
      `<svg x="50" y="50" viewBox="0 0 10 10" width="20" height="100%"><line x2="10" stroke="${RED}"/></svg>`,
    );

    expect(drawable.subpaths[0]?.points).toEqual([{ x: 50, y: 90 }, { x: 70, y: 90 }]);
  });

  it('fills the parent viewport with a symbol drawn by a use without a size', () => {
    const drawable: SvgDrawable = getOnlyViewportDrawable(
      '<symbol id="s" viewBox="0 0 10 10"><rect width="10" height="10"/></symbol><use href="#s"/>',
    );

    expect(drawable.subpaths[0]?.points).toEqual([
      { x: 0, y: 0 },
      { x: VIEWPORT_SIZE, y: 0 },
      { x: VIEWPORT_SIZE, y: VIEWPORT_SIZE },
      { x: 0, y: VIEWPORT_SIZE },
    ]);
  });

  it('draws nothing for a use or a nested svg with a zero width or height', () => {
    expect(getViewportDrawableSet(`
      <defs><rect id="a" ${UNIT_SQUARE}/></defs>
      <use href="#a" width="0"/>
      <svg height="0"><rect ${UNIT_SQUARE}/></svg>
    `).drawables).toEqual([]);
  });

  it('checks the copy budget of a large group once, so many uses of it stay quick', () => {
    const groupSize = 20_001;
    const useCount = 2000;
    const getGroupDrawableSet = (groupUseCount: number): SvgDrawableSet => getDrawableSet(
      `<g id="big">${'<g/>'.repeat(groupSize)}</g>${'<use href="#big"/>'.repeat(groupUseCount)}`,
    );
    // The same document with one use measures the fixed cost (parsing, styles, walk) on this machine, so only the
    // extra cost of the other uses is compared with the limit.
    const oneUseStartTime: number = performance.now();

    getGroupDrawableSet(1);

    const oneUseTime: number = performance.now() - oneUseStartTime;
    const manyUsesStartTime: number = performance.now();
    const { drawables, unsupported }: SvgDrawableSet = getGroupDrawableSet(useCount);

    expect(performance.now() - manyUsesStartTime - oneUseTime).toBeLessThan(QUICK_RUN_LIMIT_MS);
    expect(unsupported).toEqual([SVG_UNSUPPORTED_KIND.USE_LIMIT]);
    expect(drawables).toEqual([]);
  }, USE_LIMIT_TEST_TIMEOUT_MS);

  it('does not expand uses inside copied defs, so undrawn content costs no budget', () => {
    const groupSize = 20_001;
    const useCount = 10;
    const { drawables, unsupported }: SvgDrawableSet = getDrawableSet(`
      <defs>
        <g id="big">${'<g/>'.repeat(groupSize)}</g>
        <g id="a"><defs><use href="#big"/></defs><rect ${UNIT_SQUARE}/></g>
      </defs>
      ${'<use href="#a"/>'.repeat(useCount)}
    `);

    expect(drawables).toHaveLength(useCount);
    expect(unsupported).toEqual([]);
  });

  it('reports clipped content for a clip-path or a mask but still draws it in full', () => {
    const { drawables, unsupported }: SvgDrawableSet = getDrawableSet(`
      <defs><clipPath id="c"><rect ${UNIT_SQUARE}/></clipPath><mask id="m"><rect ${UNIT_SQUARE}/></mask></defs>
      <rect width="5" height="5" clip-path="url(#c)"/>
      <rect width="5" height="5" style="mask:url(#m)"/>
    `);

    expect(unsupported).toEqual([SVG_UNSUPPORTED_KIND.CLIPPED]);
    expect(drawables[0]?.subpaths[0]?.points[2]).toEqual({ x: 5, y: 5 });
    expect(drawables).toHaveLength(2);
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
