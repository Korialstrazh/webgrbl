import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const TOKENS_PATH = resolve(__dirname, 'tokens.scss');
const MIN_TEXT_CONTRAST = 4.5;
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
const ACCENT_BUTTON_TOKEN = '--color-accent';
const DARK_TEXT_ON_ACCENT = '#121417';

const getTokenValue = (source: string, name: string): string | undefined => {
  const match: RegExpMatchArray | null = source.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`));

  return match?.[1];
};

const getChannelLuminance = (channelHex: string): number => {
  const channel: number = parseInt(channelHex, HEX_RADIX) / CHANNEL_MAX;

  return channel <= LINEAR_THRESHOLD
    ? channel / LINEAR_DIVISOR
    : Math.pow((channel + GAMMA_OFFSET) / GAMMA_DIVISOR, GAMMA_EXPONENT);
};

const getRelativeLuminance = (hex: string): number => {
  const digits: string = hex.replace('#', '');
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
  const requireToken = (name: string): string => {
    const value: string | undefined = getTokenValue(source, name);

    if (!value) {
      throw new Error(`Token ${name} is missing`);
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
    const mutedHex: string = getTokenValue(source, MUTED_STRONG_TOKEN) ?? requireToken(MUTED_TOKEN);

    expect(getContrastRatio(mutedHex, requireToken(surfaceToken))).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it.each(DANGER_BUTTON_TOKENS)('keeps the text readable on %s', (buttonToken: string) => {
    const ratio: number = getContrastRatio(requireToken(TEXT_TOKEN), requireToken(buttonToken));

    expect(ratio).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it('keeps the dark text readable on the accent button', () => {
    expect(getContrastRatio(DARK_TEXT_ON_ACCENT, requireToken(ACCENT_BUTTON_TOKEN))).toBeGreaterThanOrEqual(
      MIN_TEXT_CONTRAST,
    );
  });
});
