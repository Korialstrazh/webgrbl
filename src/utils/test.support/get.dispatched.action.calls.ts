import type { MockInstance } from 'vitest';
import type { AppDispatch } from '../states/new.store';

/** The dispatch calls of a spied store that carried an action of the given class. */
export const getDispatchedActionCalls = (
  dispatchSpy: MockInstance<AppDispatch>,
  actionClass: new (...constructorArguments: never[]) => unknown,
): unknown[][] =>
  dispatchSpy.mock.calls.filter((callArguments: unknown[]): boolean => callArguments[0] instanceof actionClass);
