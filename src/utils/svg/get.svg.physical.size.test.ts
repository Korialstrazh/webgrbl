import { getSvgPhysicalSize } from './get.svg.physical.size';

const getRootElement = (attributes: string): Element =>
  new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" ${attributes}/>`, 'image/svg+xml')
    .documentElement;

describe(getSvgPhysicalSize.name, () => {
  it('uses width and height when both are lengths', () => {
    expect(getSvgPhysicalSize(getRootElement('width="100mm" height="50mm"'))).toEqual({ widthMm: 100, heightMm: 50 });
  });

  it('derives the missing length from the viewBox ratio', () => {
    const viewBox = 'viewBox="0 0 200 100"';

    expect(getSvgPhysicalSize(getRootElement(`width="100mm" ${viewBox}`))).toEqual({ widthMm: 100, heightMm: 50 });
    expect(getSvgPhysicalSize(getRootElement(`height="50mm" ${viewBox}`))).toEqual({ widthMm: 100, heightMm: 50 });
  });

  it('reads a viewBox at 96 per inch when the width is a percent', () => {
    const size = getSvgPhysicalSize(getRootElement('width="100%" viewBox="0 0 960 480"'));

    expect(size?.widthMm).toBeCloseTo(254);
    expect(size?.heightMm).toBeCloseTo(127);
  });

  it('gives undefined with no size and no usable viewBox', () => {
    expect(getSvgPhysicalSize(getRootElement(''))).toBeUndefined();
    expect(getSvgPhysicalSize(getRootElement('viewBox="0 0 0 10"'))).toBeUndefined();
    expect(getSvgPhysicalSize(getRootElement('viewBox="0 0 10"'))).toBeUndefined();
  });
});
