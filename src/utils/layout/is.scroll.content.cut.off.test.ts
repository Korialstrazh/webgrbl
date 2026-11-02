import { isScrollContentCutOff } from './is.scroll.content.cut.off';

const CLIENT_HEIGHT = 500;
const SCROLL_HEIGHT = 1500;

describe(isScrollContentCutOff.name, () => {
  it('is cut off while content lies below the visible part', () => {
    expect(isScrollContentCutOff({ scrollTop: 0, clientHeight: CLIENT_HEIGHT, scrollHeight: SCROLL_HEIGHT }))
      .toBe(true);
  });

  it('is not cut off when scrolled to the end, also with a fractional size', () => {
    expect(isScrollContentCutOff({ scrollTop: 999.5, clientHeight: CLIENT_HEIGHT, scrollHeight: SCROLL_HEIGHT }))
      .toBe(false);
  });

  it('is not cut off when everything fits', () => {
    expect(isScrollContentCutOff({ scrollTop: 0, clientHeight: CLIENT_HEIGHT, scrollHeight: CLIENT_HEIGHT }))
      .toBe(false);
  });
});
