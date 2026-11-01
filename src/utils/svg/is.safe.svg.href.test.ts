import { isSafeSvgHref } from './is.safe.svg.href';

describe(isSafeSvgHref.name, () => {
  it('allows same-document references and embedded raster images', () => {
    expect(isSafeSvgHref('#a')).toBe(true);
    expect(isSafeSvgHref('data:image/png;base64,AAAA')).toBe(true);
    expect(isSafeSvgHref('  DATA:image/JPEG;base64,AAAA ')).toBe(true);
  });

  it('rejects remote, file, script and svg data references', () => {
    expect(isSafeSvgHref('https://example.com/a.png')).toBe(false);
    expect(isSafeSvgHref('file.png')).toBe(false);
    expect(isSafeSvgHref('javascript:alert(1)')).toBe(false);
    expect(isSafeSvgHref('data:image/svg+xml;base64,AAAA')).toBe(false);
    expect(isSafeSvgHref('data:text/html,<script>')).toBe(false);
  });
});
