/**
 * The laser pointer card: pointer power, hold to fire, frame the job and air assist. Shown but inert for now.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Switch } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_SIZE_LARGE } from '../../../utils/antd.constants';
import { doNothing } from '../../../utils/do.nothing';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { ComingSoon } from '../../../views/ComingSoon';
import { Panel } from '../../../views/Panel';
import styles from './styles.module.scss';

const POINTER_POWER_MIN_PERCENT = 0;
const POINTER_POWER_MAX_PERCENT = 100;
const POINTER_POWER_DEFAULT_PERCENT = 1;

export const LaserCard = (): ReactNode => {
  const { t } = useTranslation();

  return (
    <Panel title={t(DEFAULT.MACHINE_LASER_TITLE)}>
      <ComingSoon description={t(DEFAULT.MACHINE_LASER_DESCRIPTION)}>
        <div className={styles.laserCard}>
          <label className={styles.powerField}>
            {t(DEFAULT.MACHINE_LASER_POWER)}
            <input
              type="range"
              className={styles.powerSlider}
              min={POINTER_POWER_MIN_PERCENT}
              max={POINTER_POWER_MAX_PERCENT}
              defaultValue={POINTER_POWER_DEFAULT_PERCENT}
            />
          </label>
          <Button size={ANTD_BUTTON_SIZE_LARGE} onClick={doNothing}>
            {t(DEFAULT.MACHINE_LASER_FIRE)}
          </Button>
          <Button size={ANTD_BUTTON_SIZE_LARGE} onClick={doNothing}>
            {t(DEFAULT.MACHINE_LASER_FRAME)}
          </Button>
          <label className={styles.switchField}>
            <Switch checked={false} onChange={doNothing} />
            {t(DEFAULT.MACHINE_LASER_AIR_ASSIST)}
          </label>
        </div>
      </ComingSoon>
    </Panel>
  );
};
