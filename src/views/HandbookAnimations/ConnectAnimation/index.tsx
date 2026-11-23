/**
 * A looping picture for the handbook's connect step: a USB plug goes into the laser, the link lights up and the power
 * slider fills to full. It is decoration, so assistive technology skips it; with reduced motion it stands on its last
 * picture.
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

const FULL_POWER_PERCENT = 100;

export const ConnectAnimation = (): ReactNode => {
  const { t } = useTranslation();

  return (
    <svg viewBox="0 0 320 180" fill="none" aria-hidden="true" focusable="false" className={styles.animation}>
      <path className={styles.cable} d="M0 70 H80" />
      <g className={styles.plug}>
        <path className={styles.cable} d="M80 70 H120" />
        <rect className={styles.plugBody} x="120" y="58" width="44" height="24" rx="4" />
        <rect className={styles.plugTip} x="164" y="62" width="22" height="16" rx="1.5" />
      </g>
      <rect className={styles.device} x="186" y="30" width="114" height="80" rx="10" />
      <rect className={styles.port} x="186" y="60" width="8" height="20" rx="1" />
      <circle className={[styles.linkDot, styles.linkDotFirst].join(' ')} cx="226" cy="70" r="5" />
      <circle className={[styles.linkDot, styles.linkDotSecond].join(' ')} cx="246" cy="70" r="5" />
      <circle className={[styles.linkDot, styles.linkDotThird].join(' ')} cx="266" cy="70" r="5" />
      <rect className={styles.sliderTrack} x="40" y="140" width="180" height="8" rx="4" />
      <rect className={styles.sliderFill} x="40" y="140" width="180" height="8" rx="4" />
      <circle className={styles.sliderKnob} cx="220" cy="144" r="9" />
      <text className={[styles.label, styles.powerPercent].join(' ')} x="220" y="122">
        {`${FULL_POWER_PERCENT} ${t(DEFAULT.FIELD_UNIT_PERCENT)}`}
      </text>
      <g className={styles.wattsTag}>
        <rect className={styles.tagChip} x="244" y="132" width="32" height="24" rx="6" />
        <text className={styles.label} x="260" y="144">
          {t(DEFAULT.FIELD_UNIT_WATTS)}
        </text>
      </g>
    </svg>
  );
};
