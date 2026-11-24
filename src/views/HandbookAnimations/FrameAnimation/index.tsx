/**
 * A looping picture for the handbook's frame step: the head traces the job's bounding box with a faint dot, then the
 * pointer dot blinks as the P key is pressed. It is decoration, so assistive technology skips it; with reduced motion
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
import { POINTER_TOGGLE_KEY } from '../../../utils/browser/browser.events.constants';
import styles from './styles.module.scss';

export const FrameAnimation = (): ReactNode => (
  <svg viewBox="0 0 320 180" fill="none" aria-hidden="true" focusable="false" className={styles.animation}>
    <rect className={styles.bed} x="40" y="20" width="210" height="140" rx="10" />
    <rect className={styles.jobBox} x="90" y="55" width="110" height="70" rx="2" />
    <path className={styles.trace} d="M90 55 H200 V125 H90 Z" pathLength="100" />
    <g className={styles.gantryRow}>
      <line className={styles.gantry} x1="40" y1="55" x2="250" y2="55" />
      <g className={styles.headColumn}>
        <rect className={styles.head} x="84" y="49" width="12" height="12" rx="2" />
        <circle className={styles.faintDot} cx="90" cy="55" r="2.5" />
        <circle className={styles.pointerDot} cx="90" cy="55" r="4" />
      </g>
    </g>
    <g className={styles.pointerKey}>
      <rect className={styles.keyCap} x="268" y="124" width="32" height="30" rx="6" />
      <text className={styles.keyCapLabel} x="284" y="139">
        {POINTER_TOGGLE_KEY.toUpperCase()}
      </text>
    </g>
  </svg>
);
