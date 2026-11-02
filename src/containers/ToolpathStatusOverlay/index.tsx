/**
 * What the Toolpath view shows over the bed while the toolpath is not ready: the generation progress with Cancel,
 * or an out-of-date (or failed) banner with Regenerate. The bed drawing hides the old toolpath meanwhile, so the
 * banner is the only hint that one exists; it never plays as the current job.
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
import { ANTD_ALERT_TYPE_WARNING, ANTD_BUTTON_SIZE_SMALL } from '../../utils/antd.constants';
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
import styles from './styles.module.scss';

/** A toolpath that exists but must not be shown as current, so the user is offered a new one. */
const REGENERATE_STATUS_MESSAGE_KEYS: Readonly<Partial<Record<ToolpathStatus, string>>> = {
  [TOOLPATH_STATUS.STALE]: DEFAULT.TOOLPATH_OUT_OF_DATE,
  [TOOLPATH_STATUS.FAILED]: DEFAULT.TOOLPATH_FAILED,
};

export const ToolpathStatusOverlay = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const status: ToolpathStatus = useSelector(selectToolpathStatus);
  const percent: number = Math.round(useSelector(selectToolpathProgress) * PERCENT_DIVISOR);
  const regenerateMessageKey: string | undefined = REGENERATE_STATUS_MESSAGE_KEYS[status];

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

  return regenerateMessageKey ? (
    <Alert
      className={styles.banner}
      type={ANTD_ALERT_TYPE_WARNING}
      title={t(regenerateMessageKey)}
      action={(
        <Button size={ANTD_BUTTON_SIZE_SMALL} onClick={() => dispatch(new ToolpathRequested())}>
          {t(DEFAULT.TOOLPATH_REGENERATE)}
        </Button>
      )}
    />
  ) : undefined;
};
