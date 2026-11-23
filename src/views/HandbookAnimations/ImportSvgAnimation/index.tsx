/**
 * A looping picture for the handbook's import step: an SVG file drops onto the bed, its outline draws itself and two
 * layer colours tint its parts. It is decoration, so assistive technology skips it; with reduced motion it stands on
 * its last picture.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ReactNode } from 'react';
import styles from './styles.module.scss';

const FILE_TYPE_LABEL = 'SVG';

export const ImportSvgAnimation = (): ReactNode => (
  <svg viewBox="0 0 320 180" fill="none" aria-hidden="true" focusable="false" className={styles.animation}>
    <rect className={styles.bed} x="55" y="20" width="210" height="140" rx="10" />
    <line className={styles.gantry} x1="55" y1="34" x2="265" y2="34" />
    <rect className={styles.head} x="67" y="28" width="12" height="12" rx="2" />
    <path className={[styles.part, styles.layerBlue].join(' ')} d="M122 92 H198 V138 H122 Z" pathLength="100" />
    <path className={[styles.part, styles.layerOrange].join(' ')} d="M110 94 L160 54 L210 94 Z" pathLength="100" />
    <g className={styles.file}>
      <path className={styles.filePage} d="M138 52 H172 L186 66 V108 H138 Z" />
      <path className={styles.fileFold} d="M172 52 V66 H186" />
      <text className={styles.fileLabel} x="162" y="90">
        {FILE_TYPE_LABEL}
      </text>
    </g>
  </svg>
);
