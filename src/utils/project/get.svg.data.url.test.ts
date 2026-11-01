import { getSvgDataUrl } from './get.svg.data.url';

const SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0L1 1"/></svg>';

describe(getSvgDataUrl.name, () => {
  it('encodes the SVG text into an SVG data URL', () => {
    expect(getSvgDataUrl(SVG_TEXT)).toBe(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(SVG_TEXT)}`);
  });
});
