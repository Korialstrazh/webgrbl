import { BED_OVERLAY_TONE, DARK_GREY_BED_COLOUR, DEFAULT_BED_COLOUR, WHITE_BED_COLOUR, WOOD_BED_COLOUR } from './bed.colour.constants';
import { getBedOverlayTone } from './get.bed.overlay.tone';

// Just above and just below the 0.179 luminance threshold.
const GREY_JUST_ABOVE_THRESHOLD = '#767676';
const GREY_JUST_BELOW_THRESHOLD = '#737373';
const NOT_A_COLOUR = 'wood';

describe(getBedOverlayTone.name, () => {
  it.each([DEFAULT_BED_COLOUR, WHITE_BED_COLOUR, WOOD_BED_COLOUR, GREY_JUST_ABOVE_THRESHOLD])(
    'takes the dark marks on the light bed %s',
    (bedColour: string) => {
      expect(getBedOverlayTone(bedColour)).toBe(BED_OVERLAY_TONE.ON_LIGHT);
    },
  );

  it.each([DARK_GREY_BED_COLOUR, GREY_JUST_BELOW_THRESHOLD])(
    'takes the light marks on the dark bed %s',
    (bedColour: string) => {
      expect(getBedOverlayTone(bedColour)).toBe(BED_OVERLAY_TONE.ON_DARK);
    },
  );

  it('takes the marks of the default bed for a value that is not a colour', () => {
    expect(getBedOverlayTone(NOT_A_COLOUR)).toBe(getBedOverlayTone(DEFAULT_BED_COLOUR));
  });
});
