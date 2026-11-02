/**
 * The bed rulers, drawn over the bed view in screen space: bed X along the top edge of the bed and machine Y along its
 * left edge, or along the view edges once the bed edges are scrolled out of view. The text keeps one size in rem at any
 * zoom and panel size. It takes no pointer presses.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import type { BedRulerLabel } from '../../utils/bed/interfaces/BedRulerLabel';
import type { BedRulerLayout } from '../../utils/bed/interfaces/BedRulerLayout';
import styles from './styles.module.scss';

interface BedRulersProps {
  rulers: BedRulerLayout;
}

const TOP_LABEL_KEY_PREFIX = 'top-';
const LEFT_LABEL_KEY_PREFIX = 'left-';

export const BedRulers = ({ rulers }: BedRulersProps): ReactNode => (
  // Plain elements: the labels are positioned text over a drawing, which no antd component draws.
  <div className={styles.bedRulers} aria-hidden="true">
    {rulers.topLabels.map(({ valueMm, offsetPx }: BedRulerLabel) => (
      <span
        key={TOP_LABEL_KEY_PREFIX + valueMm}
        className={[styles.label, styles.topLabel].join(' ')}
        // The positions follow the zoom and pan at run time.
        // eslint-disable-next-line no-restricted-syntax -- runtime-only position
        style={{ left: offsetPx, top: rulers.topRulerYPx }}
      >
        {valueMm}
      </span>
    ))}
    {rulers.leftLabels.map(({ valueMm, offsetPx }: BedRulerLabel) => (
      <span
        key={LEFT_LABEL_KEY_PREFIX + valueMm}
        className={[styles.label, styles.leftLabel].join(' ')}
        // eslint-disable-next-line no-restricted-syntax -- runtime-only position
        style={{ left: rulers.leftRulerXPx, top: offsetPx }}
      >
        {valueMm}
      </span>
    ))}
  </div>
);
