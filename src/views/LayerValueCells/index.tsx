/**
 * The power, speed and passes of a layer as three short cells, each with its icon. The cells wrap before a value is
 * ever cut, and the title and the hidden text give the whole summary with its units.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DashboardOutlined, SyncOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MIDDLE_DOT } from '../../utils/characters.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { getLayerSummaryParts } from '../../utils/layers/get.layer.summary.parts';
import { getLayerValueCells } from '../../utils/layers/get.layer.value.cells';
import type { LayerSummarySettings } from '../../utils/layers/interfaces/LayerSummarySettings';
import styles from './styles.module.scss';

const SUMMARY_PART_SEPARATOR: string = ` ${MIDDLE_DOT} `;
const CELL_HINT_KEYS: readonly string[] = [
  DEFAULT.LAYERS_CELL_POWER_HINT,
  DEFAULT.LAYERS_CELL_SPEED_HINT,
  DEFAULT.LAYERS_CELL_PASSES_HINT,
];
const CELL_ICONS: readonly ReactNode[] = [<ThunderboltOutlined />, <DashboardOutlined />, <SyncOutlined />];
// Each value has its own glyph colour, so power, speed and passes tell apart at a glance.
const CELL_CLASS_NAMES: readonly (string | undefined)[] = [styles.powerCell, styles.speedCell, styles.passesCell];
const SPEED_CELL_INDEX = 1;

interface LayerValueCellsProps {
  settings: LayerSummarySettings;
  className?: string;
}

export const LayerValueCells = ({ settings, className }: LayerValueCellsProps): ReactNode => {
  const { t } = useTranslation();
  const summaryText: string = getLayerSummaryParts(t, settings).join(SUMMARY_PART_SEPARATOR);

  return (
    <span className={[className, styles.cells].join(' ')}>
      <span className={styles.summaryText}>{summaryText}</span>
      {getLayerValueCells(t, settings).map((cellText: string, cellIndex: number) => (
        <Tooltip key={cellIndex} title={t(CELL_HINT_KEYS[cellIndex] ?? '')}>
          <span className={[styles.cell, CELL_CLASS_NAMES[cellIndex]].join(' ')} aria-hidden>
            {CELL_ICONS[cellIndex]}
            {cellText}
            {cellIndex === SPEED_CELL_INDEX && (
              // Only the speed has a unit of its own: mm over min as a small stacked fraction, narrow enough for one
              // line. Power has its % and passes their x in the value text.
              <span className={styles.unit}>
                <span className={styles.unitLength}>{t(DEFAULT.LAYERS_CELL_SPEED_UNIT_LENGTH)}</span>
                <span>{t(DEFAULT.LAYERS_CELL_SPEED_UNIT_PER)}</span>
              </span>
            )}
          </span>
        </Tooltip>
      ))}
    </span>
  );
};
