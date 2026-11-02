import type { CountedDomWalk } from '../../test.support/interfaces/CountedDomWalk';
import { countDomWalkSteps } from '../../test.support/count.dom.walk.steps';
import { SVG_NAMESPACE_URI } from '../svg.constants';
import { getSvgExpandedDocument } from './get.svg.expanded.document';
import type { SvgExpandedDocument } from './interfaces/SvgExpandedDocument';
import { SVG_USE_INSPECTION_BUDGET, SVG_USE_MAX_COPIED_ELEMENTS } from './svg.shape.constants';

const RECT = '<rect width="1" height="1"/>';
const SMALL_SHAPE_NAME = 'circle';
const RECT_ELEMENT_NAME = 'rect';
const UNREADABLE_SVG_MESSAGE = 'The test SVG is not readable';
// jsdom takes several seconds just to parse the deeply nested probe file, and the test parses it twice.
const HOSTILE_FILE_TEST_TIMEOUT_MS = 60_000;
// Every counted node takes at most a child step and a sibling step, and all counts together stay within the
// inspection budget, plus the steps that pass over one counted subtree and the per-use checks. The quadratic work it
// guards against walked millions of nodes.
const INSPECTION_WALK_STEP_LIMIT: number = 3 * (SVG_USE_INSPECTION_BUDGET + SVG_USE_MAX_COPIED_ELEMENTS);
// A wide node under the wrappers may cost only a few extra steps per wrapper over a narrow one, never its width.
const WIDE_NODE_EXTRA_STEP_LIMIT = 4 * 450;
// jsdom parses each of the two deeply nested wide-node files twice, and that is slow in a loaded test run.
const WIDE_NODE_TEST_TIMEOUT_MS = 120_000;

const getSvgText = (content: string): string => `<svg xmlns="${SVG_NAMESPACE_URI}">${content}</svg>`;

const getExpandedDocument = (content: string): SvgExpandedDocument => {
  const expandedDocument: SvgExpandedDocument | undefined = getSvgExpandedDocument(getSvgText(content));

  if (!expandedDocument) {
    throw new Error(UNREADABLE_SVG_MESSAGE);
  }

  return expandedDocument;
};

/** Nested groups w1 > w2 > ... > wN in defs around the given content, then one use per group id. */
const getNestedWrapperContent = (wrapperCount: number, innerContent: string): string => {
  let wrappedContent: string = innerContent;

  for (let wrapperIndex = wrapperCount; wrapperIndex >= 1; wrapperIndex--) {
    wrappedContent = `<g id="w${wrapperIndex}">${wrappedContent}</g>`;
  }

  let useContent = '';

  for (let wrapperIndex = 1; wrapperIndex <= wrapperCount; wrapperIndex++) {
    useContent += `<use href="#w${wrapperIndex}"/>`;
  }

  return `<defs>${wrappedContent}</defs>${useContent}`;
};

/** The expansion of the content with the DOM walk steps it took, so the work is measured without a clock. */
const getCountedExpansion = (content: string): CountedDomWalk<SvgExpandedDocument> => {
  const svgText: string = getSvgText(content);
  const countedExpansion: CountedDomWalk<SvgExpandedDocument | undefined> =
    countDomWalkSteps(() => getSvgExpandedDocument(svgText));
  const { result: expandedDocument, walkStepCount } = countedExpansion;

  if (!expandedDocument) {
    throw new Error(UNREADABLE_SVG_MESSAGE);
  }

  return { result: expandedDocument, walkStepCount };
};

describe(getSvgExpandedDocument.name, () => {
  it('rejects many distinct large references quickly instead of cloning each one', () => {
    const wrapperCount = 500;
    const rectCount = 15_000;
    const { result: expandedDocument, walkStepCount }: CountedDomWalk<SvgExpandedDocument> =
      getCountedExpansion(getNestedWrapperContent(wrapperCount, RECT.repeat(rectCount)));

    expect(expandedDocument.isUseLimitReached).toBe(true);
    expect(walkStepCount).toBeLessThanOrEqual(INSPECTION_WALK_STEP_LIMIT);
  }, HOSTILE_FILE_TEST_TIMEOUT_MS);

  it('keeps a use whose reference grew after it was first seen within the copy budget', () => {
    const groupSize = 9000;
    const useCount = 300;
    const { result: expandedDocument, walkStepCount }: CountedDomWalk<SvgExpandedDocument> = getCountedExpansion(`
      <defs><g id="b">${RECT.repeat(groupSize)}</g></defs>
      <use href="#a"/><g id="a"><use href="#b"/></g>${'<use href="#a"/>'.repeat(useCount)}
    `);
    const copiedRectCount: number =
      expandedDocument.svgDocument.querySelectorAll(RECT_ELEMENT_NAME).length - groupSize;

    expect(expandedDocument.isUseLimitReached).toBe(true);
    expect(copiedRectCount).toBeLessThanOrEqual(SVG_USE_MAX_COPIED_ELEMENTS);
    expect(walkStepCount).toBeLessThanOrEqual(INSPECTION_WALK_STEP_LIMIT);
  }, HOSTILE_FILE_TEST_TIMEOUT_MS);

  it('counts a wide node no further than the budget left, so many uses of wrappers around it stay quick', () => {
    const remainingBudget = 450;
    const wrapperCount = 450;
    const wideNodeWidth = 40_000;
    // Both files hold the same rects, so work that grows with the file size is the same in both; only the node under
    // the wrappers changes width.
    const getWrappedNodeContent = (wrappedRectCount: number): string =>
      `<defs><g id="filler">${RECT.repeat(SVG_USE_MAX_COPIED_ELEMENTS - remainingBudget - 1)}</g>`
      + `<g>${RECT.repeat(wideNodeWidth - wrappedRectCount)}</g></defs><use href="#filler"/>`
      + getNestedWrapperContent(wrapperCount, `<g>${RECT.repeat(wrappedRectCount)}</g>`);
    const narrowExpansion: CountedDomWalk<SvgExpandedDocument> =
      getCountedExpansion(getWrappedNodeContent(remainingBudget));
    const wideExpansion: CountedDomWalk<SvgExpandedDocument> =
      getCountedExpansion(getWrappedNodeContent(wideNodeWidth));

    expect(wideExpansion.result.isUseLimitReached).toBe(true);
    expect(wideExpansion.walkStepCount).toBeLessThanOrEqual(narrowExpansion.walkStepCount + WIDE_NODE_EXTRA_STEP_LIMIT);
  }, WIDE_NODE_TEST_TIMEOUT_MS);

  it('charges the comments inside a referenced group to the copy budget', () => {
    const commentCount: number = SVG_USE_MAX_COPIED_ELEMENTS;
    const expandedDocument: SvgExpandedDocument = getExpandedDocument(
      `<defs><g id="padded">${'<!--x-->'.repeat(commentCount)}${RECT}</g></defs><use href="#padded"/>`,
    );

    expect(expandedDocument.isUseLimitReached).toBe(true);
  });

  it('rejects every later use once the inspection budget is spent, even one that fits the copy budget', () => {
    const wrappedRectCount: number = SVG_USE_MAX_COPIED_ELEMENTS;
    const wrapperCount: number = Math.ceil(SVG_USE_INSPECTION_BUDGET / wrappedRectCount) + 1;
    const getSmallExpansion = (spentContent: string): SvgExpandedDocument => getExpandedDocument(
      `<defs><${SMALL_SHAPE_NAME} id="small" r="1"/></defs>${spentContent}<use href="#small"/>`,
    );
    const getSmallCopyCount = ({ svgDocument }: SvgExpandedDocument): number =>
      svgDocument.querySelectorAll(SMALL_SHAPE_NAME).length - 1;
    const spentExpansion: SvgExpandedDocument =
      getSmallExpansion(getNestedWrapperContent(wrapperCount, RECT.repeat(wrappedRectCount)));

    expect(getSmallCopyCount(getSmallExpansion(''))).toBe(1);
    expect(getSmallCopyCount(spentExpansion)).toBe(0);
    expect(spentExpansion.isUseLimitReached).toBe(true);
  });
});
