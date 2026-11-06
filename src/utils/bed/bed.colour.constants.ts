/**
 * The bed colour the user can choose: the default, the presets offered in the picker, the two overlay tones the
 * marks on the bed switch between, and how long a colour change waits before it is stored.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../localization/default.locales';
import type { BedColourPreset } from './interfaces/BedColourPreset';

/** The default bed: a dark charcoal that matches the theme. Black artwork gets a light rim on it (BedObjectGraphic). */
export const DEFAULT_BED_COLOUR = '#2a2e34';

export const GREY_BED_COLOUR = '#a7acb1';

export const LIGHT_GREY_BED_COLOUR = '#d4d7da';
export const WHITE_BED_COLOUR = '#ffffff';
export const DARK_GREY_BED_COLOUR = '#3a3e43';
export const WOOD_BED_COLOUR = '#c8a27a';

/** The named presets of the bed colour picker: charcoal (default), grey, light grey, white, dark grey and plywood. */
export const BED_COLOUR_PRESETS: readonly BedColourPreset[] = [
  { colour: DEFAULT_BED_COLOUR, labelKey: DEFAULT.BED_COLOUR_PRESET_CHARCOAL },
  { colour: GREY_BED_COLOUR, labelKey: DEFAULT.BED_COLOUR_PRESET_GREY },
  { colour: LIGHT_GREY_BED_COLOUR, labelKey: DEFAULT.BED_COLOUR_PRESET_LIGHT_GREY },
  { colour: WHITE_BED_COLOUR, labelKey: DEFAULT.BED_COLOUR_PRESET_WHITE },
  { colour: DARK_GREY_BED_COLOUR, labelKey: DEFAULT.BED_COLOUR_PRESET_DARK_GREY },
  { colour: WOOD_BED_COLOUR, labelKey: DEFAULT.BED_COLOUR_PRESET_PLYWOOD },
];

/** Which set of mark colours the bed uses: dark marks on a light bed, light marks on a dark bed. */
export const BED_OVERLAY_TONE = {
  ON_LIGHT: 'on-light',
  ON_DARK: 'on-dark',
} as const;

export type BedOverlayTone = typeof BED_OVERLAY_TONE[keyof typeof BED_OVERLAY_TONE];

/**
 * The relative luminance where black and white marks have the same contrast against the bed (about 4.6:1 each); a
 * brighter bed takes the dark marks, a darker one the light marks.
 */
export const BED_OVERLAY_TONE_LUMINANCE_THRESHOLD = 0.179;

/** A colour change is stored once the user has stopped changing it for this long, not on every step of a drag. */
export const BED_COLOUR_STORE_DEBOUNCE_MS = 300;

/** A stored bed colour is a hex colour with six digits, such as #a7acb1. */
export const BED_COLOUR_PATTERN = /^#[0-9a-f]{6}$/i;
