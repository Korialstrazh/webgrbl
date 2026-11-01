import { isSvgFile } from './is.svg.file';
import { SVG_MIME_TYPE } from './svg.constants';

const SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

describe(isSvgFile.name, () => {
  it('accepts a file whose name ends in .svg, in any letter case, whatever its type', () => {
    expect(isSvgFile(new File([SVG_TEXT], 'logo.svg'))).toBe(true);
    expect(isSvgFile(new File([SVG_TEXT], 'LOGO.SVG'))).toBe(true);
  });

  it('accepts a file of the SVG type whatever its name', () => {
    expect(isSvgFile(new File([SVG_TEXT], 'logo', { type: SVG_MIME_TYPE }))).toBe(true);
  });

  it('rejects other files', () => {
    expect(isSvgFile(new File(['png'], 'photo.png', { type: 'image/png' }))).toBe(false);
    expect(isSvgFile(new File([SVG_TEXT], 'logo.svg.txt'))).toBe(false);
  });
});
