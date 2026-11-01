import { getSvgExpandedDocument } from './get.svg.expanded.document';
import type { SvgExpandedDocument } from './interfaces/SvgExpandedDocument';
import { SVG_USE_INSPECTION_BUDGET, SVG_USE_MAX_COPIED_ELEMENTS } from './svg.shape.constants';
import { SVG_MIME_TYPE, SVG_NAMESPACE_URI } from '../svg.constants';

const RECT = '<rect width="1" height="1"/>';
const SMALL_SHAPE_NAME = 'circle';
const RECT_ELEMENT_NAME = 'rect';
// jsdom takes several seconds just to parse the deeply nested probe file, and the test parses it twice.
const HOSTILE_FILE_TEST_TIMEOUT_MS = 60_000;
// Expansion work on top of parsing; before the source was counted first, the probe took minutes.
const EXPANSION_TIME_LIMIT_MS = 2000;

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
