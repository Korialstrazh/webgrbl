import { getValidBedColour } from './get.valid.bed.colour';

const UPPER_CASE_COLOUR = '#A7ACB1';
const LOWER_CASE_COLOUR = '#a7acb1';

describe(getValidBedColour.name, () => {
  it('keeps a six-digit hex colour, in lower case', () => {
    expect(getValidBedColour(UPPER_CASE_COLOUR)).toBe(LOWER_CASE_COLOUR);
  });

  it.each([undefined, 42, '#abc', 'grey', '#a7acb1ff', ['#a7acb1']])('rejects %j', (value: unknown) => {
    expect(getValidBedColour(value)).toBeUndefined();
  });
});
