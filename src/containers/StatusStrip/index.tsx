/**
 * The bottom region: the job size and the estimate of the ready toolpath, the bed point under the pointer, an Offline
 * note while the browser has no network, and the console toggle. The console opens as a panel below the bed, which the
 * workbench lays out.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Layout, Switch, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectIsOnline } from '../../utils/states/browser.environment.state';
import { MISSING_VALUE_TEXT } from '../../utils/missing.value.constants';
import { KEYBOARD_FOCUSABLE_TAB_INDEX } from '../../utils/tab.index.constants';
import type { AppDispatch } from '../../utils/states/new.store';
import { ConsoleOpenChanged, selectIsConsoleOpen } from '../../utils/states/panel.layout.state';
import { selectReadyToolpathBounds, selectReadyToolpathTotalTimeS } from '../../utils/states/toolpath.timeline.selectors';
import type { ToolpathBounds } from '../../utils/toolpath/interfaces/ToolpathBounds';
import { getJobEstimateText } from '../../utils/toolpath/get.job.estimate.text';
import { BedCursorReadout } from './BedCursorReadout';
import { getJobSizeReadoutText } from './get.job.size.readout.text';
import styles from './styles.module.scss';

export const StatusStrip = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isConsoleOpen: boolean = useSelector(selectIsConsoleOpen);
  const totalTimeS: number | undefined = useSelector(selectReadyToolpathTotalTimeS);
  const jobBounds: ToolpathBounds | undefined = useSelector(selectReadyToolpathBounds);
  const isOnline: boolean = useSelector(selectIsOnline);
  const isOffline: boolean = !isOnline;

  return (
    <Layout.Footer
      className={[styles.statusStrip, styles.fixedHeightBar].join(' ')}
      aria-label={t(DEFAULT.STATUS_STRIP_TITLE)}
    >
      <div className={styles.readoutsArea}>
        {/* A description list keeps the term and value pairing; antd Descriptions renders a table instead. */}
        <dl className={styles.readouts}>
          <div className={styles.readout}>
            <dt>{t(DEFAULT.STATUS_STRIP_JOB_SIZE)}</dt>
            <dd className={jobBounds ? undefined : styles.readoutHint}>{getJobSizeReadoutText(t, jobBounds)}</dd>
          </div>
          <div className={styles.readout}>
            <dt>{t(DEFAULT.STATUS_STRIP_ESTIMATE)}</dt>
            {/* eslint-disable-next-line no-restricted-syntax -- 0 s is a real estimate, distinct from no toolpath */}
            <dd>{totalTimeS === undefined ? MISSING_VALUE_TEXT : getJobEstimateText(t, totalTimeS)}</dd>
          </div>
          {/* Last, so the room its changing value keeps never leaves a gap between the other readouts. */}
          <BedCursorReadout />
        </dl>
      </div>
      {isOffline && (
        <Tooltip title={t(DEFAULT.STATUS_STRIP_OFFLINE_HINT)}>
          {/* Focusable, so a keyboard user can read the hint; it is a note, not a control. */}
          <span className={styles.offlineNote} tabIndex={KEYBOARD_FOCUSABLE_TAB_INDEX}>
            {t(DEFAULT.STATUS_STRIP_OFFLINE)}
          </span>
        </Tooltip>
      )}
      <label className={styles.consoleSwitch}>
        <Switch
          checked={isConsoleOpen}
          onChange={(isChecked: boolean) => dispatch(new ConsoleOpenChanged({ isConsoleOpen: isChecked }))}
        />
        {t(DEFAULT.CONSOLE_TOGGLE)}
      </label>
    </Layout.Footer>
  );
};
