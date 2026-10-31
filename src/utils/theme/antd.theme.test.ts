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
  ['colorError', '--color-danger-button'],
  ['colorWarning', '--color-warning'],
  ['colorSuccess', '--color-success'],
  ['colorInfo', '--color-info'],
] as const;
const LAYOUT_TOKEN_SOURCES = [
  ['bodyBg', '--color-bg'],
  ['headerBg', '--color-surface-1'],
  ['siderBg', '--color-surface-1'],
  ['footerBg', '--color-surface-1'],
] as const;
const REM_TOKEN_SOURCES = [
  ['borderRadius', '--radius-md'],
  ['controlHeight', '--control-height'],
] as const;

const source: string = readFileSync(TOKENS_PATH, 'utf8');
const themeTokens: Record<string, unknown> = { ...ANTD_THEME.token };
const layoutTokens: Record<string, unknown> = { ...ANTD_THEME.components?.Layout };

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

  it.each(LAYOUT_TOKEN_SOURCES)('paints the layout %s from %s', (layoutToken: string, scssToken: string) => {
    expect(layoutTokens[layoutToken]).toBe(requireScssToken(scssToken));
  });
});
