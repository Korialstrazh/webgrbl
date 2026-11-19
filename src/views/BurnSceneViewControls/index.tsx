/**
 * The small view cluster at the top right of the 3D scene, in the look of the zoom group of the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { ExpandOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_TOOLTIP_PLACEMENT_LEFT } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { CubeTopIcon } from '../CubeTopIcon';
import { DismissibleTooltip } from '../DismissibleTooltip';
import type { BurnSceneViewControlsProps } from './interfaces/BurnSceneViewControlsProps';
import styles from './styles.module.scss';

export const BurnSceneViewControls = ({ onFit, onTop }: BurnSceneViewControlsProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <Space.Compact className={styles.burnSceneViewControls} role="group" aria-label={t(DEFAULT.BURN_SCENE_VIEW_LABEL)}>
      <DismissibleTooltip title={t(DEFAULT.BURN_SCENE_VIEW_FIT_HINT)} placement={ANTD_TOOLTIP_PLACEMENT_LEFT}>
        <Button
          className={styles.viewButton}
          aria-label={t(DEFAULT.BURN_SCENE_VIEW_FIT_HINT)}
          onClick={onFit}
          icon={<ExpandOutlined />}
        />
      </DismissibleTooltip>
      <DismissibleTooltip title={t(DEFAULT.BURN_SCENE_VIEW_TOP_HINT)} placement={ANTD_TOOLTIP_PLACEMENT_LEFT}>
        <Button
          className={styles.viewButton}
          aria-label={t(DEFAULT.BURN_SCENE_VIEW_TOP_HINT)}
          onClick={onTop}
          icon={<CubeTopIcon />}
        />
      </DismissibleTooltip>
    </Space.Compact>
  );
};
