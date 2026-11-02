/**
 * The Cursor readout of the status strip: the bed point under the pointer in machine millimetres while the pointer is
 * over the bed, a dash otherwise. It is its own component, so the frame-by-frame updates re-render it alone.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { BedCursorPoint } from '../../../utils/bed/interfaces/BedCursorPoint';
import { useBedCursorPoint } from '../../../utils/hooks/use.bed.cursor.point';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { MISSING_VALUE_TEXT } from '../../../utils/missing.value.constants';
import { STATUS_STRIP_MM_DECIMALS } from '../status.strip.constants';
import styles from './styles.module.scss';

export const BedCursorReadout = (): ReactNode => {
  const { t } = useTranslation();
  const cursorPoint: BedCursorPoint | undefined = useBedCursorPoint();

  return (
    <div className={styles.bedCursorReadout}>
      <dt>{t(DEFAULT.STATUS_STRIP_CURSOR)}</dt>
      <dd className={styles.cursorValue}>
        {cursorPoint
          ? t(DEFAULT.STATUS_STRIP_CURSOR_VALUE, {
            x: cursorPoint.xMm.toFixed(STATUS_STRIP_MM_DECIMALS),
            y: cursorPoint.yMm.toFixed(STATUS_STRIP_MM_DECIMALS),
          })
          : MISSING_VALUE_TEXT}
      </dd>
    </div>
  );
};
