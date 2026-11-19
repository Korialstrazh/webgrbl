/**
 * The bed rulers, each in a band of its own: bed X in a band along the top of the bed drawing and machine Y in a band
 * along its left, with a corner square that names the unit. Each band has its own background, long ticks at the
 * labelled steps and short ticks between them, so no label ever sits on the grid or the artwork. The text keeps one
 * size in rem at any zoom and panel size. It takes no pointer presses.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { BedRulerLabel } from '../../utils/bed/interfaces/BedRulerLabel';
import type { BedRulerLayout } from '../../utils/bed/interfaces/BedRulerLayout';
import type { BedRulerTick } from '../../utils/bed/interfaces/BedRulerTick';
import { DEFAULT } from '../../utils/localization/default.locales';
import styles from './styles.module.scss';

interface BedRulersProps {
  rulers: BedRulerLayout;
}

const TICK_KEY_PREFIX = 'tick-';
const LABEL_KEY_PREFIX = 'label-';

const getTickClassName = (bandTickClassName: string | undefined, isMajor: boolean): string =>
  [styles.tick, bandTickClassName, isMajor ? styles.majorTick : styles.minorTick].join(' ');

export const BedRulers = ({ rulers }: BedRulersProps): ReactNode => {
  const { t } = useTranslation();

  return (
    // Plain elements: the bands are positioned marks and text beside a drawing, which no antd component draws. The
    // positions follow the zoom and pan at run time, so they are the only inline styles.
    <div className={styles.bedRulers} aria-hidden="true">
      <span className={styles.corner}>{t(DEFAULT.BED_RULER_UNIT)}</span>
      <div className={[styles.band, styles.topBand].join(' ')}>
        {rulers.topTicks.map(({ offsetPx, isMajor }: BedRulerTick) => (
          <span
            key={TICK_KEY_PREFIX + offsetPx}
            className={getTickClassName(styles.topTick, isMajor)}
            // eslint-disable-next-line no-restricted-syntax -- runtime-only position
            style={{ left: offsetPx }}
          />
        ))}
        {rulers.topLabels.map(({ valueMm, offsetPx }: BedRulerLabel) => (
          <span
            key={LABEL_KEY_PREFIX + valueMm}
            className={[styles.label, styles.topLabel].join(' ')}
            // eslint-disable-next-line no-restricted-syntax -- runtime-only position
            style={{ left: offsetPx }}
          >
            {valueMm}
          </span>
        ))}
      </div>
      <div className={[styles.band, styles.leftBand].join(' ')}>
        {rulers.leftTicks.map(({ offsetPx, isMajor }: BedRulerTick) => (
          <span
            key={TICK_KEY_PREFIX + offsetPx}
            className={getTickClassName(styles.leftTick, isMajor)}
            // eslint-disable-next-line no-restricted-syntax -- runtime-only position
            style={{ top: offsetPx }}
          />
        ))}
        {rulers.leftLabels.map(({ valueMm, offsetPx }: BedRulerLabel) => (
          <span
            key={LABEL_KEY_PREFIX + valueMm}
            className={[styles.label, styles.leftLabel].join(' ')}
            // eslint-disable-next-line no-restricted-syntax -- runtime-only position
            style={{ top: offsetPx }}
          >
            {valueMm}
          </span>
        ))}
      </div>
    </div>
  );
};
