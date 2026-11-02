/**
 * The bottom region: the bed point under the pointer, the job size and the estimate of the ready toolpath, and the
 * console toggle. The console opens as a panel below the bed, which the workbench lays out.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Layout, Switch } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT } from '../../utils/localization/default.locales';
import { MISSING_VALUE_TEXT } from '../../utils/missing.value.constants';
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

  return (
    <Layout.Footer
      className={[styles.statusStrip, styles.fixedHeightBar].join(' ')}
      aria-label={t(DEFAULT.STATUS_STRIP_TITLE)}
    >
      <div className={styles.readoutsArea}>
        {/* A description list keeps the term and value pairing; antd Descriptions renders a table instead. */}
        <dl className={styles.readouts}>
          <BedCursorReadout />
          <div className={styles.readout}>
            <dt>{t(DEFAULT.STATUS_STRIP_JOB_SIZE)}</dt>
            <dd>{getJobSizeReadoutText(t, jobBounds)}</dd>
          </div>
          <div className={styles.readout}>
            <dt>{t(DEFAULT.STATUS_STRIP_ESTIMATE)}</dt>
            {/* eslint-disable-next-line no-restricted-syntax -- 0 s is a real estimate, distinct from no toolpath */}
            <dd>{totalTimeS === undefined ? MISSING_VALUE_TEXT : getJobEstimateText(t, totalTimeS)}</dd>
          </div>
        </dl>
      </div>
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
