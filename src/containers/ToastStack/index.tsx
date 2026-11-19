/**
 * The toasts on screen, newest last. Each one can be dismissed and every one dismisses itself after a few seconds;
 * warnings and errors are announced as alerts. The stack is pinned top-centre above STOP, and extra toasts scroll
 * inside it.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { CloseOutlined, CompressOutlined, ImportOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../utils/antd.constants';
import { MULTIPLICATION_SIGN } from '../../utils/characters.constants';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { AppToast } from '../../utils/states/interfaces/AppToast';
import { useBedDimensions } from '../../utils/hooks/use.bed.dimensions';
import { getObjectFittedToBedTransform } from '../../utils/project/get.object.fitted.to.bed.transform';
import { getObjectMovedOntoBedTransform } from '../../utils/project/get.object.moved.onto.bed.transform';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import type { ProjectObjectTransform } from '../../utils/project/interfaces/ProjectObjectTransform';
import type { AppDispatch } from '../../utils/states/new.store';
import { getToastMessageText } from '../../utils/states/get.toast.message.text';
import {
  ProjectObjectsTransformed,
  ProjectUndoRequested,
  selectProjectObjects,
} from '../../utils/states/project.document.state';
import { TOAST_SEVERITY } from '../../utils/states/toast.constants';
import { ToastDismissed, selectToasts } from '../../utils/states/toast.state';
import type { ToastStackProps } from './interfaces/ToastStackProps';
import { ToastSeverityIcon } from '../../views/ToastSeverityIcon';
import { UndoArrowIcon } from '../../views/UndoArrowIcon';
import styles from './styles.module.scss';
import { TOAST_STACK_TEST_ID } from './toast.stack.constants';

const ROLE_ALERT = 'alert';
const ROLE_STATUS = 'status';
const FIRST_REPEAT_COUNT = 1;

const getToastRole = (toast: AppToast): string =>
  toast.severity === TOAST_SEVERITY.INFO ? ROLE_STATUS : ROLE_ALERT;

const getToastStackClassName = (isWide: boolean): string =>
  (isWide ? [styles.toastStack] : [styles.toastStack, styles.narrow]).join(' ');

const getToastClassName = (toast: AppToast): string => [styles.toast, styles[toast.severity]].join(' ');

export const ToastStack = ({ isWide }: ToastStackProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const toasts: AppToast[] = useSelector(selectToasts);
  const projectObjects: ProjectObject[] = useSelector(selectProjectObjects);
  const bed: BedDimensions = useBedDimensions();

  const fitObjectToBed = (toast: AppToast, fitObject: ProjectObject): void => {
    dispatch(new ProjectObjectsTransformed({
      transforms: { [fitObject.id]: getObjectFittedToBedTransform(fitObject, bed) },
    }));
    dispatch(new ToastDismissed({ toastId: toast.toastId }));
  };

  const getFitObject = (toast: AppToast): ProjectObject | undefined =>
    projectObjects.find((projectObject: ProjectObject): boolean => projectObject.id === toast.fitToBedObjectId);

  const getMoveOntoBedTransforms = (toast: AppToast): Record<string, ProjectObjectTransform> | undefined => {
    const moveObject: ProjectObject | undefined = projectObjects.find(
      (projectObject: ProjectObject): boolean => projectObject.id === toast.moveOntoBedObjectId,
    );
    const movedTransform: ProjectObjectTransform | undefined =
      moveObject && getObjectMovedOntoBedTransform(moveObject, bed);

    return moveObject && movedTransform ? { [moveObject.id]: movedTransform } : undefined;
  };

  const moveObjectOntoBed = (toast: AppToast): void => {
    const transforms: Record<string, ProjectObjectTransform> | undefined = getMoveOntoBedTransforms(toast);

    if (transforms) {
      dispatch(new ProjectObjectsTransformed({ transforms }));
    }

    dispatch(new ToastDismissed({ toastId: toast.toastId }));
  };

  return (
    <div className={getToastStackClassName(isWide)} data-testid={TOAST_STACK_TEST_ID}>
      {toasts.map((toast: AppToast) => (
        <div key={toast.toastId} className={getToastClassName(toast)} role={getToastRole(toast)}>
          <span className={styles.icon}><ToastSeverityIcon severity={toast.severity} /></span>
          <span className={styles.message}>{getToastMessageText(toast, t)}</span>
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
          {getFitObject(toast) && (
            <Button
              size={ANTD_BUTTON_SIZE_SMALL}
              icon={<CompressOutlined aria-hidden />}
              onClick={() => {
                const fitObject: ProjectObject | undefined = getFitObject(toast);

                if (fitObject) {
                  fitObjectToBed(toast, fitObject);
                }
              }}
            >
              {t(DEFAULT.OBJECTS_FIT_TO_BED)}
            </Button>
          )}
          {getMoveOntoBedTransforms(toast) && (
            <Button
              size={ANTD_BUTTON_SIZE_SMALL}
              icon={<ImportOutlined aria-hidden />}
              onClick={() => moveObjectOntoBed(toast)}
            >
              {t(DEFAULT.OBJECTS_MOVE_ONTO_BED)}
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
