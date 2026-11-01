/**
 * Finds the dispatch calls of a spied store that carried an action of the given class.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MockInstance } from 'vitest';
import type { AppDispatch } from '../states/new.store';

export const getDispatchedActionCalls = (
  dispatchSpy: MockInstance<AppDispatch>,
  actionClass: new (...constructorArguments: never[]) => unknown,
): unknown[][] =>
  dispatchSpy.mock.calls.filter((callArguments: unknown[]): boolean => callArguments[0] instanceof actionClass);
