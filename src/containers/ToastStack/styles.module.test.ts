import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const TOAST_STYLES_PATH = resolve(__dirname, 'styles.module.scss');
const STACK_RULE_PATTERN = /\.toastStack \{\n([\s\S]*?)\n\}/;

const getStackRule = (): string => readFileSync(TOAST_STYLES_PATH, 'utf8').match(STACK_RULE_PATTERN)?.[1] ?? '';

describe('toast stack styles', () => {
  it('pins the stack top-centre, just below the top bar', () => {
    const stackRule: string = getStackRule();

    expect(stackRule).toMatch(/position:\s*fixed;/);
    expect(stackRule).toMatch(/top:[^;]*layout\.\$top-bar-height/);
    expect(stackRule).toMatch(/left:\s*50%;/);
    expect(stackRule).toMatch(/transform:\s*translateX\(-50%\);/);
  });

  it('keeps the stack below the bed ruler band', () => {
    expect(getStackRule()).toMatch(/top:[^;]*layout\.\$bed-ruler-band-size/);
  });

  it('stacks the toasts above STOP', () => {
    expect(getStackRule()).toMatch(/z-index:\s*layout\.\$toast-above-stop-z-index;/);
  });

  it('stretches every toast to the widest one, so a stack lines up as one column', () => {
    expect(getStackRule()).toMatch(/align-items:\s*stretch;/);
  });

  it('scrolls extra toasts inside the stack', () => {
    expect(getStackRule()).toMatch(/overflow-y:\s*auto;/);
  });
});
