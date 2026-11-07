import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { theme } from 'antd';
import { describe, expect, it } from 'vitest';
import { getScssTokenValue } from '../utils/test.support/get.scss.token.value';

const LAYOUT_PATH = resolve(__dirname, 'layout.scss');
const STOP_Z_INDEX_NAME = '\\$stop-above-dialog-z-index';

describe('layout stacking', () => {
  it('stacks STOP above the scrim and the body of every antd dialog', () => {
    const stopZIndex: number = Number(getScssTokenValue(readFileSync(LAYOUT_PATH, 'utf8'), STOP_Z_INDEX_NAME));
    const { zIndexPopupBase } = theme.getDesignToken();

    expect(stopZIndex).toBeGreaterThan(zIndexPopupBase);
  });
});
