/**
 * Redux only accepts plain-object actions, so this middleware runs first and turns every dispatched action
 * class into one before the serializability check, the saga middleware or the logger see it.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Middleware } from '@reduxjs/toolkit';
import { Action } from './action';

type NextDispatch = (action: unknown) => unknown;

// Lets store.dispatch accept an action class instance; redux itself only types plain-object actions.
type ClassActionDispatch = <TPayload>(action: Action<TPayload>) => ReturnType<Action<TPayload>['toPlainObject']>;

type PlainAction = ReturnType<Action<unknown>['toPlainObject']>;

// redux-saga's put marks the action with a hidden (non-enumerable) property so its channel hands it to waiting
// takers before the putting saga continues; a fresh plain object would lose that marker and change the order.
// Copying the instance's non-enumerable own properties with their descriptors keeps the marker and leaves the
// enumerable keys at exactly { type, payload }.
const getPlainActionWithHiddenProperties = (classAction: Action<unknown>): PlainAction => {
  const plainAction: PlainAction = classAction.toPlainObject();

  for (const propertyKey of Reflect.ownKeys(classAction)) {
    const propertyDescriptor: PropertyDescriptor | undefined =
      Object.getOwnPropertyDescriptor(classAction, propertyKey);

    if (propertyDescriptor && !propertyDescriptor.enumerable) {
      Object.defineProperty(plainAction, propertyKey, propertyDescriptor);
    }
  }

  return plainAction;
};

export const classActionToPlainObjectMiddleware: Middleware<ClassActionDispatch> =
  () => (next: NextDispatch) => (action: unknown): unknown =>
    next(action instanceof Action ? getPlainActionWithHiddenProperties(action) : action);
