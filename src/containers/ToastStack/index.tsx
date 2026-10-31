/**
 * The toasts on screen, newest last. Each one can be dismissed; warnings and errors are announced as alerts. In a
 * narrow window the stack is pinned to the window, so it stays visible while the stacked regions scroll.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button } from 'antd';
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL } from '../../utils/antd.constants';
import { MULTIPLICATION_SIGN } from '../../utils/characters.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { AppToast } from '../../utils/states/interfaces/AppToast';
import type { AppDispatch } from '../../utils/states/new.store';
import { TOAST_SEVERITY } from '../../utils/states/toast.constants';
import { ToastDismissed, selectToasts } from '../../utils/states/toast.state';
import type { ToastStackProps } from './interfaces/ToastStackProps';
import styles from './styles.module.scss';
import { TOAST_STACK_TEST_ID } from './toast.stack.constants';

const DESCRIPTION_PARAMETER_NAME = 'description';
const ROLE_ALERT = 'alert';
const ROLE_STATUS = 'status';
const FIRST_REPEAT_COUNT = 1;

const getToastRole = (toast: AppToast): string =>
  toast.severity === TOAST_SEVERITY.INFO ? ROLE_STATUS : ROLE_ALERT;

const getToastStackClassName = (isWide: boolean): string =>
  (isWide ? [styles.toastStack] : [styles.toastStack, styles.pinnedToWindow]).join(' ');

const getToastClassName = (toast: AppToast): string => [styles.toast, styles[toast.severity]].join(' ');

/** The description parameter holds a localisation key, so it is translated before it goes into the message. */
const getToastMessage = (toast: AppToast, t: TFunction): string => {
  const parameters: Record<string, string | number> = Object.hasOwn(toast.messageParameters, DESCRIPTION_PARAMETER_NAME)
    ? {
      ...toast.messageParameters,
      [DESCRIPTION_PARAMETER_NAME]: t(String(toast.messageParameters[DESCRIPTION_PARAMETER_NAME])),
    }
    : toast.messageParameters;

  return t(toast.messageKey, parameters);
};

export const ToastStack = ({ isWide }: ToastStackProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const toasts: AppToast[] = useSelector(selectToasts);

  return (
    <div className={getToastStackClassName(isWide)} data-testid={TOAST_STACK_TEST_ID}>
      {toasts.map((toast: AppToast) => (
        <div key={toast.toastId} className={getToastClassName(toast)} role={getToastRole(toast)}>
          <span className={styles.message}>{getToastMessage(toast, t)}</span>
          {toast.repeatCount > FIRST_REPEAT_COUNT && (
            <span className={styles.repeatCount}>{`${MULTIPLICATION_SIGN}${toast.repeatCount}`}</span>
          )}
          <Button
            size={ANTD_BUTTON_SIZE_SMALL}
            aria-label={t(DEFAULT.TOAST_DISMISS)}
            onClick={() => dispatch(new ToastDismissed({ toastId: toast.toastId }))}
          >
            {t(DEFAULT.TOAST_DISMISS)}
          </Button>
        </div>
      ))}
    </div>
  );
};
