import type { CountedDomWalk } from '../../test.support/interfaces/CountedDomWalk';
import { countDomWalkSteps } from '../../test.support/count.dom.walk.steps';
import { SVG_NAMESPACE_URI } from '../svg.constants';
import { getSvgNodeCountUpTo } from './get.svg.node.count.up.to';

const GROUP_ELEMENT_NAME = 'g';
const RECT_ELEMENT_NAME = 'rect';
const SMALL_LIMIT = 10;
// A count up to the limit visits limit + 1 nodes and reads a few links of each (child, sibling, and the check that
// ends the walk), whatever the width of the node.
const WIDE_COUNT_STEP_LIMIT: number = 3 * (SMALL_LIMIT + 1);
const COMMENT_AND_TEXT_COUNT = 3;

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

describe(getSvgNodeCountUpTo.name, () => {
  const nestedElementCount = 7;

  it('counts a node and all the nodes below it when they fit the limit', () => {
    expect(getSvgNodeCountUpTo(getNestedGroup(), nestedElementCount)).toBe(nestedElementCount);
  });

  it('gives limit + 1 as soon as the count passes the limit', () => {
    expect(getSvgNodeCountUpTo(getNestedGroup(), nestedElementCount - 2)).toBe(nestedElementCount - 1);
  });

  it('does not count the siblings or the parent of the counted element', () => {
    const rootElement: Element = getNestedGroup();
    const lastGroup: Element | null = rootElement.lastElementChild;

    expect(lastGroup && getSvgNodeCountUpTo(lastGroup, nestedElementCount)).toBe(2);
  });

  it('counts a node with 150,000 children up to the limit without overflowing the stack', () => {
    const wideGroup: Element = getWideGroup(150_000);

    expect(getSvgNodeCountUpTo(wideGroup, SMALL_LIMIT)).toBe(SMALL_LIMIT + 1);
  });

  it('spends work bounded by the limit, not by the width of a node', () => {
    const wideGroup: Element = getWideGroup(100_000);

    const { walkStepCount }: CountedDomWalk<number> = countDomWalkSteps(
      () => getSvgNodeCountUpTo(wideGroup, SMALL_LIMIT),
    );

    expect(walkStepCount).toBeLessThanOrEqual(WIDE_COUNT_STEP_LIMIT);
  });

  it('charges comments and text, which a copy clones too', () => {
    const groupElement: Element = getSvgElement(GROUP_ELEMENT_NAME);

    groupElement.append(document.createComment('padding'), 'text', getSvgElement(RECT_ELEMENT_NAME));
    groupElement.lastElementChild?.append(document.createComment('more padding'));

    expect(getSvgNodeCountUpTo(groupElement, SMALL_LIMIT)).toBe(COMMENT_AND_TEXT_COUNT + 2);
  });
});
