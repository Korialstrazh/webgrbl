import { getColourNameKey } from './get.colour.name.key';
import { DEFAULT } from '../localization/default.locales';

describe(getColourNameKey.name, () => {
  it.each([
    ['#00ff00', DEFAULT.COLOUR_NAME_GREEN],
    ['#ff0000', DEFAULT.COLOUR_NAME_RED],
    ['#0000ff', DEFAULT.COLOUR_NAME_BLUE],
    ['#000000', DEFAULT.COLOUR_NAME_BLACK],
    ['#FFFFFF', DEFAULT.COLOUR_NAME_WHITE],
  ])('names %s by its nearest plain colour', (hexColour: string, nameKey: string) => {
    expect(getColourNameKey(hexColour)).toBe(nameKey);
  });

  it('gives no name for a colour that is not #rrggbb', () => {
    expect(getColourNameKey('green')).toBeUndefined();
  });
});
