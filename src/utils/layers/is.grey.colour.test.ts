import { isGreyColour } from './is.grey.colour';

describe(isGreyColour.name, () => {
  it('accepts colours whose channels differ by at most 10', () => {
    expect(isGreyColour('#7f7f80')).toBe(true);
    expect(isGreyColour('#000000')).toBe(true);
    expect(isGreyColour('#ffffff')).toBe(true);
  });

  it('rejects colours whose channels differ by more than 10', () => {
    expect(isGreyColour('#7f6f7f')).toBe(false);
    expect(isGreyColour('#ff0000')).toBe(false);
  });
});
