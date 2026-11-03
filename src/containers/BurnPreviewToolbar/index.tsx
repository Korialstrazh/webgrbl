/**
 * The header of the 3D view: the material of the project, with an entry that adds one, and the test sample of the
 * selected material.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Select } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { Material } from '../../utils/materials/interfaces/Material';
import { selectActiveMaterial } from '../../utils/states/material.selectors';
import { selectMaterials } from '../../utils/states/material.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { ProjectMaterialSelected } from '../../utils/states/project.document.state';
import { MaterialDialog } from '../MaterialDialog';
import { TestSampleDialog } from '../TestSampleDialog';
import styles from './styles.module.scss';

// Material ids are random UUIDs, so they never match this.
const ADD_MATERIAL_OPTION_VALUE = 'add-material';

export const BurnPreviewToolbar = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const materials: Material[] = useSelector(selectMaterials);
  const activeMaterial: Material | undefined = useSelector(selectActiveMaterial);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState<boolean>(false);
  const [isTestSampleDialogOpen, setIsTestSampleDialogOpen] = useState<boolean>(false);

  const changeMaterial = (optionValue: string): void => {
    if (optionValue === ADD_MATERIAL_OPTION_VALUE) {
      setIsMaterialDialogOpen(true);
    } else {
      dispatch(new ProjectMaterialSelected({ materialId: optionValue }));
    }
  };

  return (
    <>
      <Select<string>
        className={styles.materialSelect}
        aria-label={t(DEFAULT.BURN_PREVIEW_MATERIAL_LABEL)}
        placeholder={t(DEFAULT.BURN_PREVIEW_MATERIAL_PLACEHOLDER)}
        value={activeMaterial?.id}
        options={[
          ...materials.map(({ id, name }: Material) => ({ value: id, label: name })),
          { value: ADD_MATERIAL_OPTION_VALUE, label: t(DEFAULT.BURN_PREVIEW_ADD_MATERIAL) },
        ]}
        onChange={changeMaterial}
      />
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
      <MaterialDialog isOpen={isMaterialDialogOpen} onClose={() => setIsMaterialDialogOpen(false)} />
    </>
  );
};
