import { BED_MAX_TRAVEL_MM, BED_PLACEHOLDER_KIND, DEFAULT_BED_SIZE_MM } from './bed.constants';
import { getBedDimensions } from './get.bed.dimensions';

const CONNECTED = true;
const DISCONNECTED = false;
const WIDTH_SETTING = 130;
const HEIGHT_SETTING = 131;

const UNKNOWN_SIZE = {
  widthMm: DEFAULT_BED_SIZE_MM,
  heightMm: DEFAULT_BED_SIZE_MM,
  placeholderKind: BED_PLACEHOLDER_KIND.SIZE_UNKNOWN,
};

describe(getBedDimensions.name, () => {
  it('reads the size from the travel settings', () => {
    expect(getBedDimensions({ [WIDTH_SETTING]: '400.000', [HEIGHT_SETTING]: '300' }, CONNECTED)).toEqual({
      widthMm: 400,
      heightMm: 300,
      placeholderKind: BED_PLACEHOLDER_KIND.NONE,
    });
  });

  it.each([['0'], ['-5'], [''], ['abc'], ['1e9'], ['6000']])('reports unknown size for "%s"', (value: string) => {
    expect(getBedDimensions({ [WIDTH_SETTING]: value, [HEIGHT_SETTING]: '300' }, CONNECTED)).toEqual(UNKNOWN_SIZE);
  });

  it('accepts the largest plausible travel', () => {
    expect(getBedDimensions({ [WIDTH_SETTING]: '5000', [HEIGHT_SETTING]: '5000' }, CONNECTED)).toEqual({
      widthMm: BED_MAX_TRAVEL_MM,
      heightMm: BED_MAX_TRAVEL_MM,
      placeholderKind: BED_PLACEHOLDER_KIND.NONE,
    });
  });

  it('reports an unknown size when the settings are missing', () => {
    expect(getBedDimensions({}, CONNECTED)).toEqual(UNKNOWN_SIZE);
  });

  it('reports no machine when disconnected', () => {
    expect(getBedDimensions({ [WIDTH_SETTING]: '400', [HEIGHT_SETTING]: '300' }, DISCONNECTED)).toEqual({
      widthMm: DEFAULT_BED_SIZE_MM,
      heightMm: DEFAULT_BED_SIZE_MM,
      placeholderKind: BED_PLACEHOLDER_KIND.NO_MACHINE,
    });
  });
});
