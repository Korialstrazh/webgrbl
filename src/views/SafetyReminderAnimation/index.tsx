/**
 * A small looping picture that shows one safety reminder in motion: goggles put on, a fan blowing the fumes out,
 * a flame put out and a person watching the moving head. It is decoration, so assistive technology skips it; with
 * reduced motion it stands still on its last picture.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ReactNode } from 'react';
import type { SafetyReminderAnimationProps } from './interfaces/SafetyReminderAnimationProps';
import { SAFETY_REMINDER_KIND } from './safety.reminder.constants';
import type { SafetyReminderKind } from './safety.reminder.constants';
import styles from './styles.module.scss';

const TILE_SIZE = 64;
const TILE_VIEW_BOX = '0 0 64 64';

const GogglesPicture = (): ReactNode => (
  <>
    <line className={styles.beam} x1="64" y1="10" x2="40" y2="28" strokeWidth="2.5" />
    <circle className={styles.skin} cx="32" cy="36" r="17" />
    <path className={styles.hair} d="M15 32c2-12 32-12 34 0" />
    <circle className={styles.ink} cx="26" cy="36" r="1.8" />
    <circle className={styles.ink} cx="38" cy="36" r="1.8" />
    <path className={styles.mouth} d="M27 45c3 2 7 2 10 0" strokeWidth="1.6" />
    <g className={styles.goggles}>
      <line className={styles.strap} x1="14" y1="34" x2="50" y2="34" strokeWidth="2.5" />
      <rect className={styles.lens} x="18" y="29" width="13" height="10" rx="4" strokeWidth="2" />
      <rect className={styles.lens} x="33" y="29" width="13" height="10" rx="4" strokeWidth="2" />
      <rect className={styles.shine} x="22" y="30" width="3" height="8" rx="1.5" />
    </g>
  </>
);

const VentilationPicture = (): ReactNode => (
  <>
    <circle className={styles.frameLine} cx="24" cy="32" r="15" strokeWidth="2" />
    <g className={styles.blades}>
      <ellipse className={styles.blade} cx="24" cy="23" rx="4" ry="8" />
      <ellipse className={styles.blade} cx="24" cy="23" rx="4" ry="8" transform="rotate(120 24 32)" />
      <ellipse className={styles.blade} cx="24" cy="23" rx="4" ry="8" transform="rotate(240 24 32)" />
    </g>
    <circle className={styles.hub} cx="24" cy="32" r="2.5" />
    <path className={[styles.air, styles.airFirst].join(' ')} d="M42 24h12" strokeWidth="2" />
    <path className={[styles.air, styles.airSecond].join(' ')} d="M42 32h14" strokeWidth="2" />
    <path className={[styles.air, styles.airThird].join(' ')} d="M42 40h12" strokeWidth="2" />
    <circle className={styles.smoke} cx="14" cy="52" r="3" />
    <rect className={styles.switchBase} x="6" y="56" width="22" height="5" rx="2" />
    <rect className={styles.switchOn} x="8" y="57.5" width="10" height="2" rx="1" />
    <circle className={styles.switchKnob} cx="12" cy="58.5" r="1.6" />
  </>
);

const FirePicture = (): ReactNode => (
  <>
    <rect className={styles.table} x="4" y="46" width="40" height="6" rx="1.5" />
    <g className={styles.paper}>
      <rect className={styles.sheet} x="8" y="38" width="10" height="8" transform="rotate(-8 13 42)" />
    </g>
    <g className={styles.flameWrap}>
      <g className={styles.flame}>
        <path
          className={styles.flameOuter}
          d="M22 46c-7 0-9-6-6-11 1 3 3 3 3 3-1-6 3-10 6-12-1 5 5 7 5 13 0 4-3 7-8 7z"
        />
        <path className={styles.flameInner} d="M22 46c-3 0-4-3-2-6 1 2 2 2 2 2 0-3 2-5 3-6 0 3 3 4 3 7 0 2-2 3-6 3z" />
      </g>
    </g>
    <rect className={styles.extinguisher} x="46" y="22" width="11" height="30" rx="4" />
    <rect className={styles.nozzle} x="48" y="16" width="7" height="7" rx="1.5" />
    <path className={styles.hose} d="M51 16c-3-4-8-4-10-1" strokeWidth="2.5" />
    <g className={styles.spray}>
      <circle cx="36" cy="18" r="2.2" />
      <circle cx="31" cy="24" r="2.6" />
      <circle cx="27" cy="31" r="3" />
      <circle cx="33" cy="29" r="2" />
    </g>
  </>
);

const StayPicture = (): ReactNode => (
  <>
    <circle className={styles.frameLine} cx="50" cy="16" r="9" strokeWidth="2" />
    <line className={styles.clockHand} x1="50" y1="16" x2="50" y2="10" strokeWidth="2" />
    <rect className={styles.frameLine} x="30" y="38" width="30" height="20" rx="2" strokeWidth="2" />
    <g className={styles.laserHead}>
      <rect className={styles.head} x="34" y="40" width="6" height="6" rx="1" />
      <line className={styles.headBeam} x1="37" y1="46" x2="37" y2="54" strokeWidth="2" />
    </g>
    <g className={styles.watcher}>
      <circle className={styles.skin} cx="14" cy="30" r="8" />
      <rect className={styles.lens} x="10" y="27" width="11" height="5" rx="2.5" />
      <ellipse className={[styles.ink, styles.eye].join(' ')} cx="18" cy="29.5" rx="1.3" ry="1.3" />
      <path className={styles.body} d="M4 58c0-10 4-17 10-17s10 7 10 17" />
    </g>
  </>
);

const PICTURE_COMPONENTS: Record<SafetyReminderKind, () => ReactNode> = {
  [SAFETY_REMINDER_KIND.GOGGLES]: GogglesPicture,
  [SAFETY_REMINDER_KIND.VENTILATION]: VentilationPicture,
  [SAFETY_REMINDER_KIND.FIRE]: FirePicture,
  [SAFETY_REMINDER_KIND.STAY]: StayPicture,
};

export const SafetyReminderAnimation = ({ kind }: SafetyReminderAnimationProps): ReactNode => {
  const PictureComponent: () => ReactNode = PICTURE_COMPONENTS[kind];

  return (
    <span className={styles.tile} data-reminder-kind={kind}>
      <svg
        width={TILE_SIZE}
        height={TILE_SIZE}
        viewBox={TILE_VIEW_BOX}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <PictureComponent />
      </svg>
    </span>
  );
};
