/**
 * A looping picture for the handbook's run step: Start is pressed, the safety checklist ticks its three boxes, the head
 * burns the outline and the progress bar fills. It is decoration, so assistive technology skips it; with reduced motion
 * it stands on its last picture.
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

export const RunJobAnimation = (): ReactNode => {
  const { t } = useTranslation();

  return (
    <svg viewBox="0 0 320 180" fill="none" aria-hidden="true" focusable="false" className={styles.animation}>
      <g className={styles.startButton}>
        <rect className={styles.startFace} x="12" y="22" width="80" height="28" rx="6" />
        <text className={[styles.label, styles.startLabel].join(' ')} x="52" y="36">
          {t(DEFAULT.MACHINE_START_JOB_CAPTION)}
        </text>
      </g>
      <rect className={styles.checkBox} x="14" y="66" width="14" height="14" rx="3" />
      <rect className={styles.checkBox} x="14" y="92" width="14" height="14" rx="3" />
      <rect className={styles.checkBox} x="14" y="118" width="14" height="14" rx="3" />
      <rect className={styles.checkText} x="36" y="70" width="52" height="6" rx="3" />
      <rect className={styles.checkText} x="36" y="96" width="44" height="6" rx="3" />
      <rect className={styles.checkText} x="36" y="122" width="56" height="6" rx="3" />
      <path className={[styles.tick, styles.tickFirst].join(' ')} d="M17 73 L20 77 L26 69" pathLength="100" />
      <path className={[styles.tick, styles.tickSecond].join(' ')} d="M17 99 L20 103 L26 95" pathLength="100" />
      <path className={[styles.tick, styles.tickThird].join(' ')} d="M17 125 L20 129 L26 121" pathLength="100" />
      <rect className={styles.bed} x="108" y="20" width="200" height="140" rx="10" />
      <path className={styles.burn} d="M150 50 H260 V115 H150 Z" pathLength="100" />
      <rect className={styles.progressTrack} x="124" y="140" width="168" height="6" rx="3" />
      <rect className={styles.progressFill} x="124" y="140" width="168" height="6" rx="3" />
      <g className={styles.gantryRow}>
        <line className={styles.gantry} x1="108" y1="50" x2="308" y2="50" />
        <g className={styles.headColumn}>
          <rect className={styles.head} x="144" y="44" width="12" height="12" rx="2" />
          <circle className={styles.laserDot} cx="150" cy="50" r="2.5" />
        </g>
      </g>
    </svg>
  );
};
