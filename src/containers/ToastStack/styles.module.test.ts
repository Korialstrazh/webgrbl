import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const TOAST_STYLES_PATH = resolve(__dirname, 'styles.module.scss');
const STOP_BAR_STYLES_PATH = resolve(__dirname, '../StickyStopBar/styles.module.scss');
const STACK_RULE_PATTERN = /\.toastStack \{\n([\s\S]*?)\n\}/;
const ABOVE_STOP_BAR_RULE_PATTERN = /\.aboveStopBar \{\n([\s\S]*?)\n\}/;

const getRule = (pattern: RegExp): string => readFileSync(TOAST_STYLES_PATH, 'utf8').match(pattern)?.[1] ?? '';

describe('toast stack styles', () => {
  it('docks the stack in the status strip, right of the readouts and left of the console toggle', () => {
    const stackRule: string = getRule(STACK_RULE_PATTERN);

    expect(stackRule).toMatch(/position:\s*fixed;/);
    expect(stackRule).toMatch(/bottom:[^;]*layout\.\$status-strip-height/);
    expect(stackRule).toMatch(/right:[^;]*layout\.\$status-strip-toggle-width/);
    expect(stackRule).toMatch(/max-width:[^;]*layout\.\$status-strip-readouts-width/);
  });

  it('stretches every toast to the widest one, so a stack lines up as one column', () => {
    expect(getRule(STACK_RULE_PATTERN)).toMatch(/align-items:\s*stretch;/);
  });

  it('lifts the narrow stack above both the status strip and the sticky stop bar', () => {
    const bottom: string = getRule(ABOVE_STOP_BAR_RULE_PATTERN).match(/bottom:\s*([^;]+);/)?.[1] ?? '';

    expect(bottom).toContain('layout.$sticky-stop-bar-height');
    expect(bottom).toContain('layout.$status-strip-height');
  });

  it('caps the height below the top bar and above the sticky stop bar', () => {
    const maxHeight: string = getRule(ABOVE_STOP_BAR_RULE_PATTERN).match(/max-height:\s*([^;]+);/)?.[1] ?? '';

    expect(maxHeight).toContain('layout.$top-bar-height');
    expect(maxHeight).toContain('layout.$sticky-stop-bar-height');
  });

  it('scrolls extra toasts inside the stack', () => {
    expect(getRule(STACK_RULE_PATTERN)).toMatch(/overflow-y:\s*auto;/);
  });

  it('sizes the sticky stop bar from the same shared height', () => {
    expect(readFileSync(STOP_BAR_STYLES_PATH, 'utf8')).toContain('height: layout.$sticky-stop-bar-height;');
  });
});
