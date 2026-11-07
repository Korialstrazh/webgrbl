import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { theme } from 'antd';
import { describe, expect, it } from 'vitest';
import { getScssTokenValue } from '../utils/test.support/get.scss.token.value';

const LAYOUT_PATH = resolve(__dirname, 'layout.scss');
const STOP_Z_INDEX_NAME = '\\$stop-above-dialog-z-index';
// antd adds 100 for each container a dialog opens from (a dialog from a drawer), up to ten: 1000 above the base.
const ANTD_NESTED_CONTAINER_MAX_OFFSET = 1000;

describe('layout stacking', () => {
  it('stacks STOP above the scrim and the body of every antd dialog, nested ones too', () => {
    const stopZIndex: number = Number(getScssTokenValue(readFileSync(LAYOUT_PATH, 'utf8'), STOP_Z_INDEX_NAME));
    const { zIndexPopupBase } = theme.getDesignToken();

    expect(stopZIndex).toBeGreaterThan(zIndexPopupBase + ANTD_NESTED_CONTAINER_MAX_OFFSET);
  });
});
