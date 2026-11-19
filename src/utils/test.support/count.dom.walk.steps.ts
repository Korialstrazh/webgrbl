/**
 * Test helper that runs a function and counts how many child and sibling steps its DOM tree walks take, by spying on
 * the firstChild and nextSibling getters of Node. It measures work without a clock, so a loaded machine never makes a
 * test fail.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { vi } from 'vitest';
import type { CountedDomWalk } from './interfaces/CountedDomWalk';

const FIRST_CHILD_PROPERTY = 'firstChild';
const NEXT_SIBLING_PROPERTY = 'nextSibling';
const GETTER_ACCESS_TYPE = 'get';

export const countDomWalkSteps = <TResult>(run: () => TResult): CountedDomWalk<TResult> => {
  const firstChildSpy = vi.spyOn(Node.prototype, FIRST_CHILD_PROPERTY, GETTER_ACCESS_TYPE);
  const nextSiblingSpy = vi.spyOn(Node.prototype, NEXT_SIBLING_PROPERTY, GETTER_ACCESS_TYPE);

  try {
    const result: TResult = run();

    return { result, walkStepCount: firstChildSpy.mock.calls.length + nextSiblingSpy.mock.calls.length };
  } finally {
    firstChildSpy.mockRestore();
    nextSiblingSpy.mockRestore();
  }
};
