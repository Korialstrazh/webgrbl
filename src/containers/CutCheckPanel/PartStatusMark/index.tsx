/**
 * The status of a Cut check part as one coloured icon, with a count in the summary. The full words are the tooltip
 * and stay in the text for screen readers, so the list needs no repeated badge.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CheckCircleFilled, ExclamationCircleFilled, WarningFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { BURN_PART_STATUS } from '../../../utils/burn.model/burn.model.constants';
import type { BurnPartStatus } from '../../../utils/burn.model/burn.model.constants';
import { isFiniteNumber } from '../../../utils/type.guards/is.finite.number';
import styles from './styles.module.scss';

const STATUS_ICONS: Record<BurnPartStatus, ReactNode> = {
  [BURN_PART_STATUS.FREE]: <CheckCircleFilled />,
  [BURN_PART_STATUS.BORDERLINE]: <ExclamationCircleFilled />,
  [BURN_PART_STATUS.NOT_THROUGH]: <WarningFilled />,
};

const STATUS_CLASS_NAMES: Record<BurnPartStatus, string | undefined> = {
  [BURN_PART_STATUS.FREE]: styles.free,
  [BURN_PART_STATUS.BORDERLINE]: styles.borderline,
  [BURN_PART_STATUS.NOT_THROUGH]: styles.notThrough,
};

interface PartStatusMarkProps {
  status: BurnPartStatus;
  /** The status in words: the tooltip and the text a screen reader reads. */
  labelText: string;
  /** Shown next to the icon in the summary; a part row has none. */
  count?: number;
  /** True for a count of 0: the icon goes grey, so it asks for no attention. */
  isMuted?: boolean;
}

export const PartStatusMark = ({ status, labelText, count, isMuted = false }: PartStatusMarkProps): ReactNode => (
  <Tooltip title={labelText}>
    <span className={[styles.mark, isMuted ? styles.muted : STATUS_CLASS_NAMES[status]].join(' ')}>
      <span className={styles.icon} aria-hidden>{STATUS_ICONS[status]}</span>
      {isFiniteNumber(count) && <span aria-hidden>{count}</span>}
      <span className={styles.label}>{labelText}</span>
    </span>
  </Tooltip>
);
