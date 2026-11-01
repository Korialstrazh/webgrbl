import { getResolvedSvgStyles } from './resolve.svg.styles';
import type { SvgResolvedStyle } from './interfaces/SvgResolvedStyle';
import { SVG_MIME_TYPE, SVG_NAMESPACE_URI } from '../svg.constants';

const RED = '#ff0000';
const BLUE = '#0000ff';
const BLACK = '#000000';
const NONE = 'none';
const CHILD_ID = 'child';
const WIDE_STROKE_WIDTH = 4;

const getStyleOfChild = (content: string): SvgResolvedStyle | undefined => {
  const svgDocument: Document = new DOMParser().parseFromString(
    `<svg xmlns="${SVG_NAMESPACE_URI}">${content}</svg>`,
    SVG_MIME_TYPE,
  );
  const styles: Map<Element, SvgResolvedStyle> = getResolvedSvgStyles(svgDocument);

  const childElement: Element | null = svgDocument.querySelector(`[id="${CHILD_ID}"]`);

  return childElement ? styles.get(childElement) : undefined;
};

describe(getResolvedSvgStyles.name, () => {
  it('uses the defaults when nothing is set', () => {
    const style: SvgResolvedStyle | undefined = getStyleOfChild(`<rect id="${CHILD_ID}"/>`);

    expect(style?.fill).toBe(BLACK);
    expect(style?.stroke).toBe(NONE);
    expect(style?.strokeWidth).toBe(1);
    expect(style?.opacity).toBe(1);
    expect(style?.isDisplayed).toBe(true);
    expect(style?.isVisible).toBe(true);
  });

  it('inherits fill and stroke width from the parent group', () => {
    const style: SvgResolvedStyle | undefined = getStyleOfChild(
      `<g fill="${RED}" stroke="${BLUE}" stroke-width="${WIDE_STROKE_WIDTH}"><rect id="${CHILD_ID}"/></g>`,
    );

    expect(style?.fill).toBe(RED);
    expect(style?.stroke).toBe(BLUE);
    expect(style?.strokeWidth).toBe(WIDE_STROKE_WIDTH);
  });

  it('hides the children of a display none group and lets a child of a hidden group show again', () => {
    expect(getStyleOfChild(`<g display="none"><rect id="${CHILD_ID}"/></g>`)?.isDisplayed).toBe(false);
    expect(getStyleOfChild(`<g visibility="hidden"><rect id="${CHILD_ID}"/></g>`)?.isVisible).toBe(false);
    expect(
      getStyleOfChild(`<g visibility="hidden"><rect id="${CHILD_ID}" visibility="visible"/></g>`)?.isVisible,
    ).toBe(true);
  });

  it('ignores selectors that are not simple', () => {
    const style: SvgResolvedStyle | undefined = getStyleOfChild(
      `<style>g rect{fill:${RED}} rect:first-child{fill:${RED}}</style><g><rect id="${CHILD_ID}"/></g>`,
    );

    expect(style?.fill).toBe(BLACK);
  });

  it('applies a comma list and lets the more specific selector win', () => {
    const style: SvgResolvedStyle | undefined = getStyleOfChild(
      `<style>.a, .b{fill:${RED}} rect.a{fill:${BLUE}} .a{fill:${BLACK}}</style><rect id="${CHILD_ID}" class="a"/>`,
    );

    expect(style?.fill).toBe(BLUE);
  });
});
