/**
 * Says why the 3D scene is empty: no material, out of date, a build running or a failed build. With no material it also
 * offers to add one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Alert, Skeleton, Spin } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_ALERT_TYPE_WARNING, ANTD_SPIN_SIZE_SMALL } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import {
  BURN_PREVIEW_EMPTY_STATE,
  BURN_PREVIEW_EMPTY_STATE_TEXT_KEYS,
} from '../../../utils/states/burn.preview.empty.state.constants';
import type { BurnPreviewEmptyState } from '../../../utils/states/burn.preview.empty.state.constants';
import { selectBurnPreviewEmptyState } from '../../../utils/states/burn.preview.selectors';
import { selectActiveMaterial } from '../../../utils/states/material.selectors';
import { CubeIcon } from '../../../views/CubeIcon';
import { MaterialSheetIcon } from '../../../views/MaterialSheetIcon';
import { ProjectMaterialSelect } from '../../ProjectMaterialSelect';
import type { BurnPreviewStateMessageProps } from './interfaces/BurnPreviewStateMessageProps';
import styles from './styles.module.scss';

export const BurnPreviewStateMessage = ({ isSceneUnavailable }: BurnPreviewStateMessageProps): ReactNode => {
  const { t } = useTranslation();
  const emptyState: BurnPreviewEmptyState | undefined = useSelector(selectBurnPreviewEmptyState);
  const hasActiveMaterial: boolean = Boolean(useSelector(selectActiveMaterial));
  const isMessageShown: boolean = !!emptyState && !isSceneUnavailable;

  const messageComponent: ReactNode = getMessageComponent();

  function getMessageComponent(): ReactNode {
    if (!emptyState || !isMessageShown) {
      return null;
    }

    if (emptyState === BURN_PREVIEW_EMPTY_STATE.BUILDING) {
      return (
        <div className={styles.building} role="status">
          <Skeleton.Node active className={styles.buildingPlate}>
            <CubeIcon className={styles.buildingIcon} aria-hidden />
          </Skeleton.Node>
          <span className={styles.buildingLabel}>
            <Spin size={ANTD_SPIN_SIZE_SMALL} aria-hidden="true" />
            {t(DEFAULT.BURN_PREVIEW_BUILDING)}
          </span>
        </div>
      );
    }

    return (
      <Alert
        className={styles.message}
        type={ANTD_ALERT_TYPE_WARNING}
        title={t(BURN_PREVIEW_EMPTY_STATE_TEXT_KEYS[emptyState])}
      />
    );
  }

  // Without a material the model is built with a neutral one; this small chip offers the real pick without covering it.
  return (
    <>
      {messageComponent}
      {!hasActiveMaterial && (
        <div className={styles.materialChip} title={t(DEFAULT.BURN_PREVIEW_NO_MATERIAL)}>
          <MaterialSheetIcon className={styles.materialChipIcon} aria-hidden />
          <span className={styles.materialSelect}><ProjectMaterialSelect /></span>
        </div>
      )}
    </>
  );
};
