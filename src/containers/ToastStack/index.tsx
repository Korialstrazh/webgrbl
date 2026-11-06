/**
 * The toasts on screen, newest last. Each one can be dismissed; warnings and errors are announced as alerts. The
 * stack is pinned bottom-centre over the status strip, clear of the bed drawing and the region switcher; in a narrow
 * window it is lifted above the sticky STOP bar, and extra toasts scroll inside it.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CheckCircleFilled, CloseCircleFilled, CloseOutlined, WarningFilled } from '@ant-design/icons';
import { Button } from 'antd';
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../utils/antd.constants';
import { MULTIPLICATION_SIGN } from '../../utils/characters.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { AppToast } from '../../utils/states/interfaces/AppToast';
import type { AppDispatch } from '../../utils/states/new.store';
import { ProjectUndoRequested } from '../../utils/states/project.document.state';
import { TOAST_SEVERITY } from '../../utils/states/toast.constants';
import type { ToastSeverity } from '../../utils/states/toast.constants';
import { ToastDismissed, selectToasts } from '../../utils/states/toast.state';
import type { ToastStackProps } from './interfaces/ToastStackProps';
import { UndoArrowIcon } from '../../views/UndoArrowIcon';
import styles from './styles.module.scss';
import { TOAST_STACK_TEST_ID } from './toast.stack.constants';

const DESCRIPTION_PARAMETER_NAME = 'description';
const ROLE_ALERT = 'alert';
const ROLE_STATUS = 'status';
const FIRST_REPEAT_COUNT = 1;

const TOAST_ICON: Record<ToastSeverity, ReactNode> = {
  [TOAST_SEVERITY.INFO]: <CheckCircleFilled aria-hidden />,
  [TOAST_SEVERITY.WARNING]: <WarningFilled aria-hidden />,
  [TOAST_SEVERITY.ERROR]: <CloseCircleFilled aria-hidden />,
};

const getToastRole = (toast: AppToast): string =>
  toast.severity === TOAST_SEVERITY.INFO ? ROLE_STATUS : ROLE_ALERT;

const getToastStackClassName = (isWide: boolean): string =>
  (isWide ? [styles.toastStack] : [styles.toastStack, styles.aboveStopBar]).join(' ');

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
          <span className={styles.icon}>{TOAST_ICON[toast.severity]}</span>
          <span className={styles.message}>{getToastMessage(toast, t)}</span>
          {toast.repeatCount > FIRST_REPEAT_COUNT && (
            <span className={styles.repeatCount}>{`${MULTIPLICATION_SIGN}${toast.repeatCount}`}</span>
          )}
          {toast.isUndoOffered && (
            <Button
              size={ANTD_BUTTON_SIZE_SMALL}
              icon={<UndoArrowIcon aria-hidden />}
              onClick={() => {
                dispatch(new ProjectUndoRequested());
                dispatch(new ToastDismissed({ toastId: toast.toastId }));
              }}
            >
              {t(DEFAULT.TOP_BAR_UNDO)}
            </Button>
          )}
          <Button
            type={ANTD_BUTTON_TYPE_TEXT}
            size={ANTD_BUTTON_SIZE_SMALL}
            icon={<CloseOutlined />}
            aria-label={t(DEFAULT.TOAST_DISMISS)}
            onClick={() => dispatch(new ToastDismissed({ toastId: toast.toastId }))}
          />
        </div>
      ))}
    </div>
  );
};
