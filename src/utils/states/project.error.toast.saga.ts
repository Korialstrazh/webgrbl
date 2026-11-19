/**
 * Shows a fixed error toast about projects; the toast never carries storage or parser error text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { put } from 'redux-saga/effects';
import { NO_TOAST_PARAMETERS, TOAST_SEVERITY } from './toast.constants';
import { ToastShown } from './toast.state';

export function* showProjectErrorToast(messageKey: string): Generator {
  yield put(new ToastShown({ severity: TOAST_SEVERITY.ERROR, messageKey, messageParameters: NO_TOAST_PARAMETERS }));
}
