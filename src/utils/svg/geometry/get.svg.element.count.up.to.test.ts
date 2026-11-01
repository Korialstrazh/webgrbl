import { getSvgElementCountUpTo } from './get.svg.element.count.up.to';
import { SVG_NAMESPACE_URI } from '../svg.constants';

const GROUP_ELEMENT_NAME = 'g';
const RECT_ELEMENT_NAME = 'rect';
const SMALL_LIMIT = 10;
// Repeated small counts of a wide node; with the old eager walk each count pushed every child first.
const WIDE_COUNT_REPEATS = 1000;
const WIDE_COUNT_TIME_LIMIT_MS = 1000;

const getSvgElement = (elementName: string): Element => document.createElementNS(SVG_NAMESPACE_URI, elementName);

const getWideGroup = (childCount: number): Element => {
  const groupElement: Element = getSvgElement(GROUP_ELEMENT_NAME);
  const childFragment: DocumentFragment = document.createDocumentFragment();

  for (let childIndex = 0; childIndex < childCount; childIndex++) {
    childFragment.append(getSvgElement(RECT_ELEMENT_NAME));
  }

  groupElement.append(childFragment);

  return groupElement;
};

/** g > (g > rect, rect), g > rect: 6 elements, nested on several levels. */
const getNestedGroup = (): Element => {
  const rootElement: Element = getSvgElement(GROUP_ELEMENT_NAME);
  const firstGroup: Element = getSvgElement(GROUP_ELEMENT_NAME);
  const innerGroup: Element = getSvgElement(GROUP_ELEMENT_NAME);
  const lastGroup: Element = getSvgElement(GROUP_ELEMENT_NAME);

  innerGroup.append(getSvgElement(RECT_ELEMENT_NAME));
  firstGroup.append(innerGroup, getSvgElement(RECT_ELEMENT_NAME));
  lastGroup.append(getSvgElement(RECT_ELEMENT_NAME));
  rootElement.append(firstGroup, lastGroup);

  return rootElement;
};

describe(getSvgElementCountUpTo.name, () => {
  const nestedElementCount = 7;

  it('counts an element and all its descendants when they fit the limit', () => {
    expect(getSvgElementCountUpTo(getNestedGroup(), nestedElementCount)).toBe(nestedElementCount);
  });

  it('gives limit + 1 as soon as the count passes the limit', () => {
    expect(getSvgElementCountUpTo(getNestedGroup(), nestedElementCount - 2)).toBe(nestedElementCount - 1);
  });

  it('does not count the siblings or the parent of the counted element', () => {
    const rootElement: Element = getNestedGroup();
    const lastGroup: Element | null = rootElement.lastElementChild;

    expect(lastGroup && getSvgElementCountUpTo(lastGroup, nestedElementCount)).toBe(2);
  });

  it('counts a node with 150,000 children up to the limit without overflowing the stack', () => {
    const wideGroup: Element = getWideGroup(150_000);

    expect(getSvgElementCountUpTo(wideGroup, SMALL_LIMIT)).toBe(SMALL_LIMIT + 1);
  });

  it('spends work bounded by the limit, not by the width of a node', () => {
    const wideGroup: Element = getWideGroup(100_000);
    const startTime: number = performance.now();

    for (let repeatIndex = 0; repeatIndex < WIDE_COUNT_REPEATS; repeatIndex++) {
      getSvgElementCountUpTo(wideGroup, SMALL_LIMIT);
    }

    expect(performance.now() - startTime).toBeLessThan(WIDE_COUNT_TIME_LIMIT_MS);
  });
});
