import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { theme } from 'antd';
import { ANTD_THEME } from './antd.theme';
import { getScssTokenValue } from '../test.support/get.scss.token.value';

const TOKENS_PATH = resolve(__dirname, '../../styles/tokens.scss');
const ROOT_FONT_SIZE_PIXELS = 16;
const REM_UNIT = 'rem';
const COLOR_TOKEN_SOURCES = [
  ['colorPrimary', '--color-accent'],
  ['colorBgBase', '--color-bg'],
  ['colorBgContainer', '--color-surface-1'],
  ['colorBgElevated', '--color-surface-2'],
  ['colorBorder', '--color-border'],
  ['colorText', '--color-text'],
  ['colorTextSecondary', '--color-text-muted'],
  ['colorPrimaryHover', '--color-accent-hover'],
  ['colorPrimaryActive', '--color-accent-active'],
  ['colorError', '--color-danger-button'],
  ['colorErrorHover', '--color-danger-button-hover'],
  ['colorErrorActive', '--color-danger-button-active'],
  ['colorErrorText', '--color-danger-text'],
  ['colorTextDisabled', '--color-disabled-text'],
  ['colorBgContainerDisabled', '--color-disabled-bg'],
  ['colorWarning', '--color-warning'],
  ['colorSuccess', '--color-success'],
  ['colorInfo', '--color-info'],
  ['colorPrimaryBorder', '--color-focus-ring'],
] as const;
const LAYOUT_TOKEN_SOURCES = [
  ['bodyBg', '--color-bg'],
  ['headerBg', '--color-surface-1'],
  ['siderBg', '--color-surface-1'],
  ['footerBg', '--color-surface-1'],
] as const;
const BUTTON_TOKEN_SOURCES = [
  ['colorPrimary', '--color-accent'],
  ['colorPrimaryHover', '--color-accent-hover'],
  ['colorPrimaryActive', '--color-accent-active'],
  ['colorError', '--color-danger-button'],
  ['colorErrorHover', '--color-danger-button-hover'],
  ['colorErrorActive', '--color-danger-button-active'],
  ['primaryColor', '--color-bg'],
  ['dangerColor', '--color-text'],
  ['defaultBg', '--color-surface-2'],
  ['defaultHoverBg', '--color-surface-hover'],
  ['defaultActiveBg', '--color-surface-active'],
] as const;
const SWITCH_TOKEN_SOURCES = [
  ['colorPrimary', '--color-accent'],
  ['colorPrimaryHover', '--color-accent-hover'],
] as const;
const SLIDER_TOKEN_SOURCES = [
  ['trackBg', '--color-accent'],
  ['trackHoverBg', '--color-accent-hover'],
  ['handleColor', '--color-accent'],
  ['handleActiveColor', '--color-accent-hover'],
  ['railBg', '--color-surface-3'],
] as const;
const SELECT_TOKEN_SOURCES = [
  ['hoverBorderColor', '--color-accent-hover'],
  ['activeBorderColor', '--color-accent'],
  ['optionSelectedBg', '--color-surface-3'],
] as const;
const SEGMENTED_TOKEN_SOURCES = [
  ['trackBg', '--color-surface-1'],
  ['itemColor', '--color-text-muted'],
  ['itemHoverBg', '--color-surface-hover'],
  ['itemSelectedBg', '--color-surface-3'],
  ['itemSelectedColor', '--color-text'],
] as const;
const SPLITTER_TOKEN_SOURCES = [
  ['controlItemBgHover', '--color-border'],
  ['controlItemBgActive', '--color-accent'],
  ['controlItemBgActiveHover', '--color-accent-active'],
  ['colorFill', '--color-text-muted'],
] as const;
const REM_TOKEN_SOURCES = [
  ['borderRadius', '--radius-md'],
  ['controlHeight', '--control-height'],
  ['lineWidthFocus', '--focus-outline-width'],
] as const;

const source: string = readFileSync(TOKENS_PATH, 'utf8');
const themeTokens: Record<string, unknown> = { ...ANTD_THEME.token };
const layoutTokens: Record<string, unknown> = { ...ANTD_THEME.components?.Layout };
const buttonTokens: Record<string, unknown> = { ...ANTD_THEME.components?.Button };
const segmentedTokens: Record<string, unknown> = { ...ANTD_THEME.components?.Segmented };
const switchTokens: Record<string, unknown> = { ...ANTD_THEME.components?.Switch };
const sliderTokens: Record<string, unknown> = { ...ANTD_THEME.components?.Slider };
const selectTokens: Record<string, unknown> = { ...ANTD_THEME.components?.Select };
const splitterTokens: Record<string, unknown> = { ...ANTD_THEME.components?.Splitter };

const requireScssToken = (name: string): string => {
  const value: string | undefined = getScssTokenValue(source, name);

  if (!value) {
    throw new Error(`Token ${name} is missing`);
  }

  return value;
};

const getRemTokenPixels = (name: string): number => {
  const value: string = requireScssToken(name);

  if (!value.endsWith(REM_UNIT)) {
    throw new Error(`Token ${name} is not in rem`);
  }

  return parseFloat(value) * ROOT_FONT_SIZE_PIXELS;
};

describe('ANTD_THEME', () => {
  it('uses the dark algorithm', () => {
    expect(ANTD_THEME.algorithm).toBe(theme.darkAlgorithm);
  });

  it.each(COLOR_TOKEN_SOURCES)('takes %s from %s', (antdToken: string, scssToken: string) => {
    expect(themeTokens[antdToken]).toBe(requireScssToken(scssToken));
  });

  it.each(REM_TOKEN_SOURCES)('takes %s from %s in pixels', (antdToken: string, scssToken: string) => {
    expect(themeTokens[antdToken]).toBe(getRemTokenPixels(scssToken));
  });

  it('takes the font family from --font-ui', () => {
    expect(themeTokens.fontFamily).toBe(requireScssToken('--font-ui'));
  });

  it('takes the code font family from --font-mono', () => {
    expect(themeTokens.fontFamilyCode).toBe(requireScssToken('--font-mono'));
  });

  it.each(LAYOUT_TOKEN_SOURCES)('paints the layout %s from %s', (layoutToken: string, scssToken: string) => {
    expect(layoutTokens[layoutToken]).toBe(requireScssToken(scssToken));
  });

  it.each(BUTTON_TOKEN_SOURCES)('paints the button %s from %s', (buttonToken: string, scssToken: string) => {
    expect(buttonTokens[buttonToken]).toBe(requireScssToken(scssToken));
  });

  it('makes large buttons exactly as tall as --target-min', () => {
    expect(buttonTokens.controlHeightLG).toBe(getRemTokenPixels('--target-min'));
  });

  it.each(SEGMENTED_TOKEN_SOURCES)('paints the segmented %s from %s', (segmentedToken: string, scssToken: string) => {
    expect(segmentedTokens[segmentedToken]).toBe(requireScssToken(scssToken));
  });

  it.each(SWITCH_TOKEN_SOURCES)('paints the switch %s from %s', (switchToken: string, scssToken: string) => {
    expect(switchTokens[switchToken]).toBe(requireScssToken(scssToken));
  });

  it.each(SLIDER_TOKEN_SOURCES)('paints the slider %s from %s', (sliderToken: string, scssToken: string) => {
    expect(sliderTokens[sliderToken]).toBe(requireScssToken(scssToken));
  });

  it.each(SELECT_TOKEN_SOURCES)('paints the select %s from %s', (selectToken: string, scssToken: string) => {
    expect(selectTokens[selectToken]).toBe(requireScssToken(scssToken));
  });

  it.each(SPLITTER_TOKEN_SOURCES)('paints the splitter %s from %s', (splitterToken: string, scssToken: string) => {
    expect(splitterTokens[splitterToken]).toBe(requireScssToken(scssToken));
  });
});
