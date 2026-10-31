import { getSanitizedSvg } from './get.sanitized.svg';
import { isSvgImportFailure } from './is.svg.import.failure';
import type { SanitizedSvg } from './interfaces/SanitizedSvg';
import { MAX_SVG_FILE_BYTES, SVG_IMPORT_ERROR_KIND, SVG_REMOVED_CONTENT_KIND } from './svg.constants';

const XMLNS = 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"';
const SIZE = 'width="10mm" height="10mm"';
const PNG_DATA_URL = 'data:image/png;base64,AAAA';

const getSvgText = (body: string): string => `<svg ${XMLNS} ${SIZE}>${body}</svg>`;

const getSanitized = (body: string): SanitizedSvg => {
  const result = getSanitizedSvg(getSvgText(body));

  if (isSvgImportFailure(result)) {
    throw new Error(`unexpected failure ${result.errorKind}`);
  }

  return result;
};

describe(getSanitizedSvg.name, () => {
  it('removes script elements, also nested', () => {
    const { svgText } = getSanitized('<g><script>alert(1)</script></g><script>alert(2)</script>');

    expect(svgText).not.toContain('script');
    expect(svgText).not.toContain('alert');
  });

  it('removes event handler attributes in any case, also on nested elements', () => {
    const { svgText } = getSanitized('<g><rect onClick="x()" ONLOAD="y()" width="1"/></g>');

    expect(svgText).not.toMatch(/onclick|onload/i);
    expect(svgText).toContain('width="1"');
  });

  it('removes remote and file hrefs and keeps same-document and embedded png hrefs', () => {
    const { svgText } = getSanitized(
      '<image href="https://example.com/a.png"/><image xlink:href="file.png"/><use href="#a"/>' +
        `<image href="${PNG_DATA_URL}"/>`,
    );

    expect(svgText).not.toContain('https://');
    expect(svgText).not.toContain('file.png');
    expect(svgText).toContain('href="#a"');
    expect(svgText).toContain(PNG_DATA_URL);
  });

  it('removes javascript urls and padded or mixed-case hrefs', () => {
    const { svgText } = getSanitized(
      '<a href=" JavaScript:alert(1)"><text>t</text></a><a xlink:href="javascript:x()"/>',
    );

    expect(svgText).not.toMatch(/javascript/i);
  });

  it('reports a removed foreignObject', () => {
    const result = getSanitized('<foreignObject><div xmlns="http://www.w3.org/1999/xhtml">x</div></foreignObject>');

    expect(result.svgText).not.toMatch(/foreignobject/i);
    expect(result.removedContentKinds).toEqual([SVG_REMOVED_CONTENT_KIND.FOREIGN_OBJECT]);
  });

  it('reports a removed linked image', () => {
    expect(getSanitized('<image href="https://example.com/a.png"/>').removedContentKinds).toEqual([
      SVG_REMOVED_CONTENT_KIND.LINKED_IMAGE,
    ]);
  });

  it('removes a style with a remote url or @import and reports it', () => {
    const remote = getSanitized('<style>a { fill: url(https://example.com/a.png) }</style>');
    const imported = getSanitized('<style>@import url(x.css);</style>');

    expect(remote.svgText).not.toContain('<style');
    expect(remote.removedContentKinds).toEqual([SVG_REMOVED_CONTENT_KIND.STYLE_URL]);
    expect(imported.removedContentKinds).toEqual([SVG_REMOVED_CONTENT_KIND.STYLE_URL]);
  });

  it('keeps a style with same-document and data urls', () => {
    const result = getSanitized(`<style>a { fill: url(#g) } b { fill: url(${PNG_DATA_URL}) }</style>`);

    expect(result.svgText).toContain('<style');
    expect(result.removedContentKinds).toEqual([]);
  });

  it('reports each kind once in a stable order', () => {
    const result = getSanitized(
      '<style>@import "a";</style><image href="a.png"/><image href="b.png"/><foreignObject/><script/>',
    );

    expect(result.removedContentKinds).toEqual([
      SVG_REMOVED_CONTENT_KIND.FOREIGN_OBJECT,
      SVG_REMOVED_CONTENT_KIND.LINKED_IMAGE,
      SVG_REMOVED_CONTENT_KIND.STYLE_URL,
    ]);
  });

  it('does not report silent hardening and reports nothing for a clean file', () => {
    expect(getSanitized('<script/><rect onclick="x()"/>').removedContentKinds).toEqual([]);
    expect(getSanitized('<rect width="1" height="1"/>').removedContentKinds).toEqual([]);
  });

  it('returns the real size', () => {
    const { widthMm, heightMm } = getSanitized('');

    expect(widthMm).toBe(10);
    expect(heightMm).toBe(10);
  });

  it('fails with not-svg for a different root or a parse error', () => {
    expect(getSanitizedSvg('<html/>')).toEqual({ errorKind: SVG_IMPORT_ERROR_KIND.NOT_SVG });
    expect(getSanitizedSvg('<svg')).toEqual({ errorKind: SVG_IMPORT_ERROR_KIND.NOT_SVG });
    expect(getSanitizedSvg('')).toEqual({ errorKind: SVG_IMPORT_ERROR_KIND.NOT_SVG });
  });

  it('fails with no-size when there is no size', () => {
    expect(getSanitizedSvg('<svg xmlns="http://www.w3.org/2000/svg"/>')).toEqual({
      errorKind: SVG_IMPORT_ERROR_KIND.NO_SIZE,
    });
  });

  it('fails with too-large for text over the limit', () => {
    expect(getSanitizedSvg(' '.repeat(MAX_SVG_FILE_BYTES + 1))).toEqual({
      errorKind: SVG_IMPORT_ERROR_KIND.TOO_LARGE,
    });
  });
});
