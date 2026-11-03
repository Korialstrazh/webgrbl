/**
 * The header of the 3D view: the material of the project as read-only text, since it is chosen in Design, and the test
 * sample of that material.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { Material } from '../../utils/materials/interfaces/Material';
import { selectActiveMaterial } from '../../utils/states/material.selectors';
import { TestSampleDialog } from '../TestSampleDialog';
import styles from './styles.module.scss';

export const BurnPreviewToolbar = (): ReactNode => {
  const { t } = useTranslation();
  const activeMaterial: Material | undefined = useSelector(selectActiveMaterial);
  const [isTestSampleDialogOpen, setIsTestSampleDialogOpen] = useState<boolean>(false);

  return (
    <>
      <span className={styles.materialText}>
        {activeMaterial
          ? t(DEFAULT.BURN_PREVIEW_MATERIAL_CURRENT, { name: activeMaterial.name })
          : t(DEFAULT.BURN_PREVIEW_MATERIAL_NONE)}
      </span>
      <Button disabled={!activeMaterial} onClick={() => setIsTestSampleDialogOpen(true)}>
        {t(DEFAULT.BURN_PREVIEW_BURN_TEST_SAMPLE)}
      </Button>
      {activeMaterial && (
        <TestSampleDialog
          isOpen={isTestSampleDialogOpen}
          material={activeMaterial}
          onClose={() => setIsTestSampleDialogOpen(false)}
        />
      )}
    </>
  );
};
