import { isSvgImportFailure } from './is.svg.import.failure';
import { SVG_IMPORT_ERROR_KIND } from './svg.constants';

describe(isSvgImportFailure.name, () => {
  it('tells a failure from a sanitised svg', () => {
    expect(isSvgImportFailure({ errorKind: SVG_IMPORT_ERROR_KIND.NOT_SVG })).toBe(true);
    expect(isSvgImportFailure({ svgText: '<svg/>', widthMm: 1, heightMm: 1, removedContentKinds: [] })).toBe(false);
  });
});
