import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const TOAST_STYLES_PATH = resolve(__dirname, 'styles.module.scss');
const STOP_BAR_STYLES_PATH = resolve(__dirname, '../StickyStopBar/styles.module.scss');
const PINNED_RULE_PATTERN = /\.pinnedToWindow \{\n([\s\S]*?)\n\}/;

const getPinnedRule = (): string => readFileSync(TOAST_STYLES_PATH, 'utf8').match(PINNED_RULE_PATTERN)?.[1] ?? '';

describe('pinned toast stack styles', () => {
  it('caps the height below the top bar and above the sticky stop bar', () => {
    const maxHeight: string = getPinnedRule().match(/max-height:\s*([^;]+);/)?.[1] ?? '';

    expect(maxHeight).toContain('layout.$top-bar-height');
    expect(maxHeight).toContain('layout.$sticky-stop-bar-height');
  });

  it('scrolls extra toasts inside the stack', () => {
    expect(getPinnedRule()).toMatch(/overflow-y:\s*auto;/);
  });

  it('sizes the sticky stop bar from the same shared height', () => {
    expect(readFileSync(STOP_BAR_STYLES_PATH, 'utf8')).toContain('height: layout.$sticky-stop-bar-height;');
  });
});
