/**
 * What the Toolpath view shows over the bed while the toolpath is not ready: the generation progress with Cancel,
 * an out-of-date (or failed) banner with Regenerate, or, when there is no toolpath and none is coming (the first
 * generation was cancelled), a banner with Generate, so the empty bed is never a dead end. The bed drawing hides an
 * old toolpath meanwhile, so the banner is the only hint that one exists; it never plays as the current job.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Alert, Button, Progress } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_ALERT_TYPE_INFO, ANTD_ALERT_TYPE_WARNING, ANTD_BUTTON_SIZE_SMALL } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { PERCENT_DIVISOR } from '../../utils/percent.constants';
import type { AppDispatch } from '../../utils/states/new.store';
import {
  ToolpathCancelled,
  ToolpathRequested,
  selectToolpathProgress,
  selectToolpathStatus,
} from '../../utils/states/toolpath.state';
import { TOOLPATH_STATUS } from '../../utils/states/toolpath.status.constants';
import type { ToolpathStatus } from '../../utils/states/toolpath.status.constants';
import type { ToolpathRequestBanner } from './interfaces/ToolpathRequestBanner';
import styles from './styles.module.scss';

/**
 * The statuses that offer a new toolpath: one that exists but must not be shown as current, or none at all after the
 * first generation was cancelled.
 */
const TOOLPATH_REQUEST_BANNERS: Readonly<Partial<Record<ToolpathStatus, ToolpathRequestBanner>>> = {
  [TOOLPATH_STATUS.STALE]: {
    messageKey: DEFAULT.TOOLPATH_OUT_OF_DATE,
    alertType: ANTD_ALERT_TYPE_WARNING,
    actionLabelKey: DEFAULT.TOOLPATH_REGENERATE,
  },
  [TOOLPATH_STATUS.FAILED]: {
    messageKey: DEFAULT.TOOLPATH_FAILED,
    alertType: ANTD_ALERT_TYPE_WARNING,
    actionLabelKey: DEFAULT.TOOLPATH_REGENERATE,
  },
  [TOOLPATH_STATUS.IDLE]: {
    messageKey: DEFAULT.TOOLPATH_NOT_GENERATED,
    alertType: ANTD_ALERT_TYPE_INFO,
    actionLabelKey: DEFAULT.TOOLPATH_GENERATE,
  },
};

export const ToolpathStatusOverlay = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const status: ToolpathStatus = useSelector(selectToolpathStatus);
  const percent: number = Math.round(useSelector(selectToolpathProgress) * PERCENT_DIVISOR);
  const requestBanner: ToolpathRequestBanner | undefined = TOOLPATH_REQUEST_BANNERS[status];

  if (status === TOOLPATH_STATUS.GENERATING) {
    return (
      <div className={styles.generating} role="status">
        <span>{t(DEFAULT.TOOLPATH_GENERATING, { percent })}</span>
        <Progress className={styles.progress} percent={percent} showInfo={false} />
        <Button size={ANTD_BUTTON_SIZE_SMALL} onClick={() => dispatch(new ToolpathCancelled())}>
          {t(DEFAULT.TOOLPATH_CANCEL)}
        </Button>
      </div>
    );
  }

  return requestBanner ? (
    <Alert
      className={styles.banner}
      type={requestBanner.alertType}
      title={t(requestBanner.messageKey)}
      action={(
        <Button size={ANTD_BUTTON_SIZE_SMALL} onClick={() => dispatch(new ToolpathRequested())}>
          {t(requestBanner.actionLabelKey)}
        </Button>
      )}
    />
  ) : undefined;
};
