/**
 * A looping picture for the handbook's material step: a sheet slides onto the bed, its thickness appears and a swatch
 * picks its colour. It is decoration, so assistive technology skips it; with reduced motion it stands on its last
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

const SHEET_THICKNESS_MM = 3;

export const MaterialAnimation = (): ReactNode => {
  const { t } = useTranslation();

  return (
    <svg viewBox="0 0 320 180" fill="none" aria-hidden="true" focusable="false" className={styles.animation}>
      <rect className={styles.bed} x="40" y="20" width="210" height="140" rx="10" />
      <line className={styles.gantry} x1="40" y1="34" x2="250" y2="34" />
      <rect className={styles.head} x="52" y="28" width="12" height="12" rx="2" />
      <rect className={styles.sheet} x="70" y="52" width="150" height="90" rx="3" />
      <g className={styles.thicknessTag}>
        <rect className={styles.tagChip} x="168" y="60" width="44" height="20" rx="10" />
        <text className={styles.label} x="190" y="70">
          {`${SHEET_THICKNESS_MM} ${t(DEFAULT.FIELD_UNIT_MM)}`}
        </text>
      </g>
      <circle className={[styles.swatch, styles.swatchBlue].join(' ')} cx="286" cy="60" r="10" />
      <circle className={[styles.swatch, styles.swatchOrange].join(' ')} cx="286" cy="90" r="10" />
      <circle className={[styles.swatch, styles.swatchGreen].join(' ')} cx="286" cy="120" r="10" />
      <circle className={styles.swatchRing} cx="286" cy="90" r="15" />
    </svg>
  );
};
