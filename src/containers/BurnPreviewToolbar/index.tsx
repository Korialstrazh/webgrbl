/**
 * The header of the 3D view: the material of the project as read-only text, since it is chosen in Design, and the entry
 * of the test result of that material. While materials exist but none is chosen, the centre card of the view asks for
 * one, so the header does not ask again.
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
import { selectMaterials } from '../../utils/states/material.state';
import { TestSampleDialog } from '../TestSampleDialog';
import styles from './styles.module.scss';
import { TestSampleIcon } from '../../views/TestSampleIcon';

export const BurnPreviewToolbar = (): ReactNode => {
  const { t } = useTranslation();
  const activeMaterial: Material | undefined = useSelector(selectActiveMaterial);
  const hasMaterials: boolean = Boolean(useSelector(selectMaterials).length);
  const [isTestSampleDialogOpen, setIsTestSampleDialogOpen] = useState<boolean>(false);

  return (
    <>
      {activeMaterial && (
        <span className={styles.materialText}>
          {t(DEFAULT.BURN_PREVIEW_MATERIAL_CURRENT, { name: activeMaterial.name })}
        </span>
      )}
      {!activeMaterial && !hasMaterials && (
        <span className={styles.materialText}>{t(DEFAULT.BURN_PREVIEW_MATERIAL_NONE)}</span>
      )}
      <Button
        icon={<TestSampleIcon aria-hidden />}
        disabled={!activeMaterial}
        onClick={() => setIsTestSampleDialogOpen(true)}
      >
        {t(DEFAULT.BURN_PREVIEW_ENTER_TEST_RESULT)}
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
