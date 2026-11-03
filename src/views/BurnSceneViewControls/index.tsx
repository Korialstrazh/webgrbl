/**
 * The small view cluster at the top right of the 3D scene, in the look of the zoom group of the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ExpandOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { Button, Space, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { BurnSceneViewControlsProps } from './interfaces/BurnSceneViewControlsProps';
import styles from './styles.module.scss';

export const BurnSceneViewControls = ({ onFit, onTop }: BurnSceneViewControlsProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <Space.Compact className={styles.burnSceneViewControls} role="group" aria-label={t(DEFAULT.BURN_SCENE_VIEW_LABEL)}>
      <Tooltip title={t(DEFAULT.BURN_SCENE_VIEW_FIT_HINT)}>
        <Button
          className={styles.viewButton}
          aria-label={t(DEFAULT.BURN_SCENE_VIEW_FIT_HINT)}
          onClick={onFit}
          icon={<ExpandOutlined />}
        />
      </Tooltip>
      <Tooltip title={t(DEFAULT.BURN_SCENE_VIEW_TOP_HINT)}>
        <Button
          className={styles.viewButton}
          aria-label={t(DEFAULT.BURN_SCENE_VIEW_TOP_HINT)}
          onClick={onTop}
          icon={<VerticalAlignTopOutlined />}
        />
      </Tooltip>
    </Space.Compact>
  );
};
