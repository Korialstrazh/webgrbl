/**
 * The bottom region: the coming-soon readouts for cursor, job size and estimate, and the console toggle. The console
 * opens as an overlay above the strip, over the bed, without resizing it.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Layout, Switch } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT } from '../../utils/localization/default.locales';
import { MISSING_VALUE_TEXT } from '../../utils/missing.value.constants';
import { ComingSoon } from '../../views/ComingSoon';
import { ConsolePanel } from '../ConsolePanel';
import styles from './styles.module.scss';

export const StatusStrip = (): ReactNode => {
  const { t } = useTranslation();
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);

  return (
    <Layout.Footer
      className={[styles.statusStrip, styles.fixedHeightBar].join(' ')}
      aria-label={t(DEFAULT.STATUS_STRIP_TITLE)}
    >
      {isConsoleOpen && (
        <div className={styles.consoleOverlay}>
          <ConsolePanel />
        </div>
      )}
      <div className={styles.readoutsArea}>
        <ComingSoon description={t(DEFAULT.STATUS_STRIP_READOUTS_DESCRIPTION)}>
          {/* A description list keeps the term and value pairing; antd Descriptions renders a table instead. */}
          <dl className={styles.readouts}>
            <div className={styles.readout}>
              <dt>{t(DEFAULT.STATUS_STRIP_CURSOR)}</dt>
              <dd>{MISSING_VALUE_TEXT}</dd>
            </div>
            <div className={styles.readout}>
              <dt>{t(DEFAULT.STATUS_STRIP_JOB_SIZE)}</dt>
              <dd>{MISSING_VALUE_TEXT}</dd>
            </div>
            <div className={styles.readout}>
              <dt>{t(DEFAULT.STATUS_STRIP_ESTIMATE)}</dt>
              <dd>{MISSING_VALUE_TEXT}</dd>
            </div>
          </dl>
        </ComingSoon>
      </div>
      <label className={styles.consoleSwitch}>
        <Switch checked={isConsoleOpen} onChange={setIsConsoleOpen} />
        {t(DEFAULT.CONSOLE_TOGGLE)}
      </label>
    </Layout.Footer>
  );
};
