/**
 * A looping picture for the handbook's errors step: the moving head stops when Esc is pressed, an alert badge appears
 * and Unlock returns the laser to idle. It is decoration, so assistive technology skips it; with reduced motion it
 * stands on its last picture.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT } from '../../../utils/localization/default.locales';
import styles from './styles.module.scss';

const ALERT_MARK = '!';

export const ErrorAnimation = (): ReactNode => {
  const { t } = useTranslation();

  return (
    <svg viewBox="0 0 320 180" fill="none" aria-hidden="true" focusable="false" className={styles.animation}>
      <rect className={styles.bed} x="60" y="20" width="200" height="140" rx="10" />
      <line className={styles.gantry} x1="60" y1="80" x2="260" y2="80" />
      <g className={styles.headColumn}>
        <rect className={styles.head} x="84" y="74" width="12" height="12" rx="2" />
        <circle className={styles.laserDot} cx="90" cy="80" r="2.5" />
      </g>
      <g className={styles.alertBadge}>
        <circle className={styles.alertDisc} cx="236" cy="44" r="13" />
        <text className={[styles.label, styles.alertMark].join(' ')} x="236" y="44">
          {ALERT_MARK}
        </text>
      </g>
      <text className={[styles.label, styles.stopCaption].join(' ')} x="30" y="114">
        {t(DEFAULT.MACHINE_CONTROL_STOP)}
      </text>
      <g className={styles.stopKey}>
        <rect className={[styles.keyCap, styles.stopCap].join(' ')} x="10" y="126" width="40" height="30" rx="6" />
        <text className={[styles.keyCapLabel, styles.stopLabel].join(' ')} x="30" y="141">
          {t(DEFAULT.MACHINE_CONTROL_STOP_SHORTCUT)}
        </text>
      </g>
      <g className={styles.unlockKey}>
        <rect className={styles.keyCap} x="266" y="126" width="50" height="30" rx="6" />
        <text className={[styles.keyCapLabel, styles.unlockLabel].join(' ')} x="291" y="141">
          {t(DEFAULT.MACHINE_CONTROL_UNLOCK)}
        </text>
      </g>
    </svg>
  );
};
