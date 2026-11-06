import { getBedRegionDrawerInset } from './get.bed.region.drawer.inset';

const CSS_SIZE = 'min(23.75rem, 100%)';
const PIXEL_SIZE = 320;

describe(getBedRegionDrawerInset.name, () => {
  it('gives the CSS size of a left drawer as it is', () => {
    expect(getBedRegionDrawerInset('left', CSS_SIZE)).toBe(CSS_SIZE);
  });

  it('gives a number size in pixels', () => {
    expect(getBedRegionDrawerInset('left', PIXEL_SIZE)).toBe('320px');
  });

  it('gives nothing for a drawer on another side, which leaves the bed where it is', () => {
    expect(getBedRegionDrawerInset('right', CSS_SIZE)).toBeUndefined();
  });

  it('gives nothing for a left drawer without a size', () => {
    expect(getBedRegionDrawerInset('left', undefined)).toBeUndefined();
  });
});
