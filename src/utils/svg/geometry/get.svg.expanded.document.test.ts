import { getSvgExpandedDocument } from './get.svg.expanded.document';
import type { SvgExpandedDocument } from './interfaces/SvgExpandedDocument';
import { SVG_USE_INSPECTION_BUDGET, SVG_USE_MAX_COPIED_ELEMENTS } from './svg.shape.constants';
import { SVG_MIME_TYPE, SVG_NAMESPACE_URI } from '../svg.constants';

const RECT = '<rect width="1" height="1"/>';
const SMALL_SHAPE_NAME = 'circle';
const RECT_ELEMENT_NAME = 'rect';
// jsdom takes several seconds just to parse the deeply nested probe file, and the test parses it twice.
const HOSTILE_FILE_TEST_TIMEOUT_MS = 60_000;
// Expansion work on top of parsing. It is loose so that a loaded CI machine passes; the quadratic work it guards
// against took tens of seconds at k=60 and minutes at k=500.
const EXPANSION_TIME_LIMIT_MS = 10_000;
// Expanding a file with a wide node must cost about what a file of the same size with a narrow node costs. Load slows
// both runs alike, so a ratio stays stable; counting every child of the wide node made it about 6 to 9 times slower.
const WIDE_NODE_TIME_RATIO_LIMIT = 3;
// jsdom parses each of the two deeply nested wide-node files twice, and that is slow in a loaded test run.
const WIDE_NODE_TEST_TIMEOUT_MS = 120_000;

interface TimedSvgExpansion {
  /** The expansion result. */
  expandedDocument: SvgExpandedDocument;
  /** Time spent beyond parsing the same text, in milliseconds. */
  expansionTimeMs: number;
}

const getSvgText = (content: string): string => `<svg xmlns="${SVG_NAMESPACE_URI}">${content}</svg>`;

const getExpandedDocument = (content: string): SvgExpandedDocument => {
  const expandedDocument: SvgExpandedDocument | undefined = getSvgExpandedDocument(getSvgText(content));

  if (!expandedDocument) {
    throw new Error('unreadable svg');
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

/** Parsing the same text on its own measures the fixed cost on this machine, so only the expansion is timed. */
const getTimedExpansion = (content: string): TimedSvgExpansion => {
  const svgText: string = getSvgText(content);
  const parseStartTime: number = performance.now();

  new DOMParser().parseFromString(svgText, SVG_MIME_TYPE);

  const parseTimeMs: number = performance.now() - parseStartTime;
  const expandStartTime: number = performance.now();
  const expandedDocument: SvgExpandedDocument | undefined = getSvgExpandedDocument(svgText);
  const expansionTimeMs: number = performance.now() - expandStartTime - parseTimeMs;

  if (!expandedDocument) {
    throw new Error('unreadable svg');
  }

  return { expandedDocument, expansionTimeMs };
};

describe(getSvgExpandedDocument.name, () => {
  it('rejects many distinct large references quickly instead of cloning each one', () => {
    const wrapperCount = 500;
    const rectCount = 15_000;
    const { expandedDocument, expansionTimeMs }: TimedSvgExpansion =
      getTimedExpansion(getNestedWrapperContent(wrapperCount, RECT.repeat(rectCount)));

    expect(expandedDocument.isUseLimitReached).toBe(true);
    expect(expansionTimeMs).toBeLessThan(EXPANSION_TIME_LIMIT_MS);
  }, HOSTILE_FILE_TEST_TIMEOUT_MS);

  it('keeps a use whose reference grew after it was first seen within the copy budget', () => {
    const groupSize = 9000;
    const useCount = 300;
    const { expandedDocument, expansionTimeMs }: TimedSvgExpansion = getTimedExpansion(`
      <defs><g id="b">${RECT.repeat(groupSize)}</g></defs>
      <use href="#a"/><g id="a"><use href="#b"/></g>${'<use href="#a"/>'.repeat(useCount)}
    `);
    const copiedRectCount: number =
      expandedDocument.svgDocument.querySelectorAll(RECT_ELEMENT_NAME).length - groupSize;

    expect(expandedDocument.isUseLimitReached).toBe(true);
    expect(copiedRectCount).toBeLessThanOrEqual(SVG_USE_MAX_COPIED_ELEMENTS);
    expect(expansionTimeMs).toBeLessThan(EXPANSION_TIME_LIMIT_MS);
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
    const narrowExpansion: TimedSvgExpansion = getTimedExpansion(getWrappedNodeContent(remainingBudget));
    const wideExpansion: TimedSvgExpansion = getTimedExpansion(getWrappedNodeContent(wideNodeWidth));

    expect(wideExpansion.expandedDocument.isUseLimitReached).toBe(true);
    expect(wideExpansion.expansionTimeMs / narrowExpansion.expansionTimeMs).toBeLessThan(WIDE_NODE_TIME_RATIO_LIMIT);
  }, WIDE_NODE_TEST_TIMEOUT_MS);

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
