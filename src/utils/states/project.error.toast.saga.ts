/**
 * Shows a fixed error toast about projects; the toast never carries storage or parser error text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { put } from 'redux-saga/effects';
import { NO_TOAST_PARAMETERS, TOAST_SEVERITY } from './toast.constants';
import { ToastShown } from './toast.state';

export function* showProjectErrorToast(messageKey: string): Generator {
  yield put(new ToastShown({ severity: TOAST_SEVERITY.ERROR, messageKey, messageParameters: NO_TOAST_PARAMETERS }));
}
