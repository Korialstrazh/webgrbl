/**
 * The icon of a toast's severity: a tick for info, a warning sign, a cross for an error. Toasts and the message
 * history show the same one, so a message reads the same in both.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { CheckCircleFilled, CloseCircleFilled, WarningFilled } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { TOAST_SEVERITY } from '../../utils/states/toast.constants';
import type { ToastSeverity } from '../../utils/states/toast.constants';

interface ToastSeverityIconProps {
  severity: ToastSeverity;
}

export const ToastSeverityIcon = ({ severity }: ToastSeverityIconProps): ReactNode => {
  switch (severity) {
  case TOAST_SEVERITY.WARNING:
    return <WarningFilled aria-hidden />;
  case TOAST_SEVERITY.ERROR:
    return <CloseCircleFilled aria-hidden />;
  default:
    return <CheckCircleFilled aria-hidden />;
  }
};
