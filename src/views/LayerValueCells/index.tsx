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
          <span className={styles.cell} aria-hidden>
            {CELL_ICONS[cellIndex]}
            {cellText}
          </span>
        </Tooltip>
      ))}
    </span>
  );
};
