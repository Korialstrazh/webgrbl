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
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { doNothing } from '../../../utils/do.nothing';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { Button } from '../../../views/Button';
import { BUTTON_SIZE, BUTTON_VARIANT } from '../../../views/Button/button.constants';
import { ComingSoon } from '../../../views/ComingSoon';
import { Panel } from '../../../views/Panel';
import { Toggle } from '../../../views/Toggle';
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
          <Button variant={BUTTON_VARIANT.SECONDARY} size={BUTTON_SIZE.LARGE} onClick={doNothing}>
            {t(DEFAULT.MACHINE_LASER_FIRE)}
          </Button>
          <Button variant={BUTTON_VARIANT.SECONDARY} size={BUTTON_SIZE.LARGE} onClick={doNothing}>
            {t(DEFAULT.MACHINE_LASER_FRAME)}
          </Button>
          <Toggle label={t(DEFAULT.MACHINE_LASER_AIR_ASSIST)} isChecked={false} onChange={doNothing} />
        </div>
      </ComingSoon>
    </Panel>
  );
};
