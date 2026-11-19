/**
 * Finds the dispatch calls of a spied store that carried an action of the given class.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MockInstance } from 'vitest';
import type { AppDispatch } from '../states/new.store';

export const getDispatchedActionCalls = (
  dispatchSpy: MockInstance<AppDispatch>,
  actionClass: new (...constructorArguments: never[]) => unknown,
): unknown[][] =>
  dispatchSpy.mock.calls.filter((callArguments: unknown[]): boolean => callArguments[0] instanceof actionClass);
