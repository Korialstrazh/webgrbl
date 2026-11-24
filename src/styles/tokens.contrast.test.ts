import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getScssTokenValue } from '../utils/test.support/get.scss.token.value';

const TOKENS_PATH = resolve(__dirname, 'tokens.scss');
const MIN_TEXT_CONTRAST = 4.5;
// WCAG 1.4.11: a focus indicator needs 3:1 against what it sits on.
const MIN_FOCUS_RING_CONTRAST = 3;
const FOCUS_RING_TOKEN = '--color-focus-ring';
const HEX_RADIX = 16;
const HEX_DIGITS_PER_CHANNEL = 2;
const CHANNEL_MAX = 255;
const LINEAR_THRESHOLD = 0.03928;
const LINEAR_DIVISOR = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_DIVISOR = 1.055;
const GAMMA_EXPONENT = 2.4;
const LUMINANCE_RED = 0.2126;
const LUMINANCE_GREEN = 0.7152;
const LUMINANCE_BLUE = 0.0722;
const LUMINANCE_OFFSET = 0.05;
const SURFACE_TOKENS = [
  '--color-surface-1',
  '--color-surface-2',
  '--color-surface-3',
  '--color-surface-hover',
  '--color-surface-active',
] as const;
const DANGER_BUTTON_TOKENS = [
  '--color-danger-button',
  '--color-danger-button-hover',
  '--color-danger-button-active',
] as const;
const GREEN_START_INDEX = 1;
const BLUE_START_INDEX = 2;
const TEXT_TOKEN = '--color-text';
const MUTED_TOKEN = '--color-text-muted';
const MUTED_STRONG_TOKEN = '--color-text-muted-strong';
const BG_TOKEN = '--color-bg';
const BED_TOKEN = '--color-bed';
const HEX_PREFIX = '#';
const ACCENT_BUTTON_TOKEN = '--color-accent';
const DANGER_TEXT_TOKEN = '--color-danger-text';
const DARK_TEXT_ON_ACCENT = '#121417';
// Black artwork and the marks and text drawn on the light bed need 4.5:1; markers and outlines need 3:1.
const BLACK_ARTWORK = '#000000';
const BED_TONE_PREFIXES = ['--color-bed-on-light-', '--color-bed-on-dark-'] as const;
// The darkest light bed and the lightest dark bed each set is meant for: the grey preset and the dark grey preset.
type BedTonePrefix = (typeof BED_TONE_PREFIXES)[number];
const BED_SURFACE_OF_TONE: Readonly<Record<BedTonePrefix, string>> = {
  '--color-bed-on-light-': '#a7acb1',
  '--color-bed-on-dark-': '#3a3e43',
};
const BED_TEXT_TOKEN_NAMES = ['ink', 'text'] as const;
const BED_MARKER_TOKEN_NAMES = ['accent', 'laser-head', 'danger', 'travel'] as const;
const MIN_GRAPHIC_CONTRAST = 3;
const ICON_DISABLED_TOKEN = '--color-icon-disabled';
const TOP_BAR_SURFACE_TOKEN = '--color-surface-1';
// A disabled toolbar icon sits near 3:1 on the top bar: visible as disabled, clearly weaker than an enabled one.
const MAX_DISABLED_ICON_CONTRAST = 4;
const MIN_ENABLED_ICON_CONTRAST = 7;
const DISABLED_TEXT_TOKEN = '--color-disabled-text';
const DISABLED_BG_TOKEN = '--color-disabled-bg';
const DISABLED_BORDER_TOKEN = '--color-disabled-border';
const ENABLED_BORDER_TOKEN = '--color-border';
const ENABLED_BUTTON_BG_TOKEN = '--color-surface-2';

const getChannelLuminance = (channelHex: string): number => {
  const channel: number = parseInt(channelHex, HEX_RADIX) / CHANNEL_MAX;

  return channel <= LINEAR_THRESHOLD
    ? channel / LINEAR_DIVISOR
    : Math.pow((channel + GAMMA_OFFSET) / GAMMA_DIVISOR, GAMMA_EXPONENT);
};

const getRelativeLuminance = (hex: string): number => {
  const digits: string = hex.replace(HEX_PREFIX, '');
  const red: number = getChannelLuminance(digits.slice(0, HEX_DIGITS_PER_CHANNEL));
  const greenStart: number = GREEN_START_INDEX * HEX_DIGITS_PER_CHANNEL;
  const blueStart: number = BLUE_START_INDEX * HEX_DIGITS_PER_CHANNEL;
  const green: number = getChannelLuminance(digits.slice(greenStart, blueStart));
  const blue: number = getChannelLuminance(digits.slice(blueStart));

  return LUMINANCE_RED * red + LUMINANCE_GREEN * green + LUMINANCE_BLUE * blue;
};

const getContrastRatio = (hexA: string, hexB: string): number => {
  const luminanceA: number = getRelativeLuminance(hexA);
  const luminanceB: number = getRelativeLuminance(hexB);
  const lighter: number = Math.max(luminanceA, luminanceB);
  const darker: number = Math.min(luminanceA, luminanceB);

  return (lighter + LUMINANCE_OFFSET) / (darker + LUMINANCE_OFFSET);
};

describe('design token contrast', () => {
  const source: string = readFileSync(TOKENS_PATH, 'utf8');
  const requireToken = (tokenName: string): string => {
    const value: string | undefined = getScssTokenValue(source, tokenName);

    if (!value) {
      throw new Error(`Token ${tokenName} is missing`);
    }

    return value;
  };

  it('keeps the main text readable on the page background', () => {
    const ratio: number = getContrastRatio(requireToken(TEXT_TOKEN), requireToken(BG_TOKEN));

    expect(ratio).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it.each(SURFACE_TOKENS)('keeps the main text readable on %s', (surfaceToken: string) => {
    expect(getContrastRatio(requireToken(TEXT_TOKEN), requireToken(surfaceToken))).toBeGreaterThanOrEqual(
      MIN_TEXT_CONTRAST,
    );
  });

  it.each(SURFACE_TOKENS)('keeps the muted text readable on %s', (surfaceToken: string) => {
    const mutedHex: string = getScssTokenValue(source, MUTED_STRONG_TOKEN) ?? requireToken(MUTED_TOKEN);

    expect(getContrastRatio(mutedHex, requireToken(surfaceToken))).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it.each([BG_TOKEN, BED_TOKEN])('keeps the muted text readable on %s', (surfaceToken: string) => {
    expect(getContrastRatio(requireToken(MUTED_TOKEN), requireToken(surfaceToken))).toBeGreaterThanOrEqual(
      MIN_TEXT_CONTRAST,
    );
  });

  it.each([BG_TOKEN, ...SURFACE_TOKENS])('keeps the focus ring visible on %s', (surfaceToken: string) => {
    expect(getContrastRatio(requireToken(FOCUS_RING_TOKEN), requireToken(surfaceToken))).toBeGreaterThanOrEqual(
      MIN_FOCUS_RING_CONTRAST,
    );
  });

  it.each(DANGER_BUTTON_TOKENS)('keeps the text readable on %s', (buttonToken: string) => {
    const ratio: number = getContrastRatio(requireToken(TEXT_TOKEN), requireToken(buttonToken));

    expect(ratio).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it('keeps the danger text readable on the page background', () => {
    expect(getContrastRatio(requireToken(DANGER_TEXT_TOKEN), requireToken(BG_TOKEN))).toBeGreaterThanOrEqual(
      MIN_TEXT_CONTRAST,
    );
  });

  it.each(SURFACE_TOKENS)('keeps the danger text readable on %s', (surfaceToken: string) => {
    expect(getContrastRatio(requireToken(DANGER_TEXT_TOKEN), requireToken(surfaceToken))).toBeGreaterThanOrEqual(
      MIN_TEXT_CONTRAST,
    );
  });

  it('keeps the dark text readable on the accent button', () => {
    expect(getContrastRatio(DARK_TEXT_ON_ACCENT, requireToken(ACCENT_BUTTON_TOKEN))).toBeGreaterThanOrEqual(
      MIN_TEXT_CONTRAST,
    );
  });

  it.each([BG_TOKEN, ...SURFACE_TOKENS])('keeps an empty checkbox outline visible on %s', (surfaceToken: string) => {
    expect(getContrastRatio(requireToken('--color-control-border'), requireToken(surfaceToken)))
      .toBeGreaterThanOrEqual(MIN_GRAPHIC_CONTRAST);
  });

  it.each([BG_TOKEN, ...SURFACE_TOKENS])('keeps a disabled caption readable on %s', (surfaceToken: string) => {
    expect(getContrastRatio(requireToken(DISABLED_TEXT_TOKEN), requireToken(surfaceToken)))
      .toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it('keeps the text of a disabled control readable on its fill', () => {
    expect(getContrastRatio(requireToken(DISABLED_TEXT_TOKEN), requireToken(DISABLED_BG_TOKEN))).toBeGreaterThanOrEqual(
      MIN_TEXT_CONTRAST,
    );
  });

  it('draws a disabled control fainter than an enabled one, with a quieter border and dimmer text', () => {
    const disabledBorderContrast: number =
      getContrastRatio(requireToken(DISABLED_BORDER_TOKEN), requireToken(DISABLED_BG_TOKEN));
    const enabledBorderContrast: number =
      getContrastRatio(requireToken(ENABLED_BORDER_TOKEN), requireToken(ENABLED_BUTTON_BG_TOKEN));
    const disabledTextContrast: number =
      getContrastRatio(requireToken(DISABLED_TEXT_TOKEN), requireToken(DISABLED_BG_TOKEN));
    const enabledTextContrast: number =
      getContrastRatio(requireToken(TEXT_TOKEN), requireToken(ENABLED_BUTTON_BG_TOKEN));

    expect(disabledBorderContrast).toBeLessThan(enabledBorderContrast);
    expect(disabledTextContrast).toBeLessThan(enabledTextContrast);
  });

  it('keeps black artwork clearly visible on the grey bed preset; dark beds give artwork a light rim instead', () => {
    expect(getContrastRatio(BLACK_ARTWORK, BED_SURFACE_OF_TONE['--color-bed-on-light-']))
      .toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it.each(BED_TONE_PREFIXES)('keeps the marks and text of %s readable on its bed', (tonePrefix: BedTonePrefix) => {
    for (const tokenName of BED_TEXT_TOKEN_NAMES) {
      expect(getContrastRatio(requireToken(tonePrefix + tokenName), BED_SURFACE_OF_TONE[tonePrefix]))
        .toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    }
  });

  it.each(BED_TONE_PREFIXES)('keeps the markers of %s visible on its bed', (tonePrefix: BedTonePrefix) => {
    for (const tokenName of BED_MARKER_TOKEN_NAMES) {
      expect(getContrastRatio(requireToken(tonePrefix + tokenName), BED_SURFACE_OF_TONE[tonePrefix]))
        .toBeGreaterThanOrEqual(MIN_GRAPHIC_CONTRAST);
    }
  });

  it('shows a disabled toolbar icon at about 3:1 on the top bar and an enabled one at 7:1 or more', () => {
    const disabledRatio: number =
      getContrastRatio(requireToken(ICON_DISABLED_TOKEN), requireToken(TOP_BAR_SURFACE_TOKEN));
    const enabledRatio: number = getContrastRatio(requireToken(TEXT_TOKEN), requireToken(TOP_BAR_SURFACE_TOKEN));

    expect(disabledRatio).toBeGreaterThanOrEqual(MIN_GRAPHIC_CONTRAST);
    expect(disabledRatio).toBeLessThan(MAX_DISABLED_ICON_CONTRAST);
    expect(enabledRatio).toBeGreaterThanOrEqual(MIN_ENABLED_ICON_CONTRAST);
  });
});
