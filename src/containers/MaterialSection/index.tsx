/**
 * The Material panel of the design view: the material select with the material library beside it, and a line below
 * that says how many presets the project material has on the active machine. The book button and the line both open
 * the library, so the presets of a material are found where the material is chosen.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BookOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { Material } from '../../utils/materials/interfaces/Material';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { selectActiveMachineProfile } from '../../utils/states/machine.profile.state';
import { selectActiveMaterial, selectActiveMaterialPresetCount } from '../../utils/states/material.selectors';
import { MaterialLibraryDialog } from '../MaterialLibraryDialog';
import { ProjectMaterialSelect } from '../ProjectMaterialSelect';
import styles from './styles.module.scss';

export const MaterialSection = (): ReactNode => {
  const { t } = useTranslation();
  const activeMaterial: Material | undefined = useSelector(selectActiveMaterial);
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const activePresetCount: number = useSelector(selectActiveMaterialPresetCount);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);

  const getPresetSummaryText = (): string => {
    if (!activeProfile) {
      return t(DEFAULT.MATERIAL_SECTION_PRESETS_NO_MACHINE);
    }

    if (!activeMaterial) {
      return t(DEFAULT.MATERIAL_SECTION_PRESETS_NO_MATERIAL);
    }

    return activePresetCount
      ? t(DEFAULT.MATERIAL_SECTION_PRESETS, { count: activePresetCount, machine: activeProfile.name })
      : t(DEFAULT.MATERIAL_SECTION_PRESETS_NONE, { machine: activeProfile.name });
  };

  return (
    <div className={styles.materialSection}>
      <div className={styles.selectRow}>
        <ProjectMaterialSelect />
        <Tooltip title={t(DEFAULT.MATERIAL_SECTION_OPEN_LIBRARY)}>
          <Button
            className={styles.libraryButton}
            icon={<BookOutlined />}
            aria-label={t(DEFAULT.MATERIAL_SECTION_OPEN_LIBRARY)}
            onClick={() => setIsLibraryOpen(true)}
          />
        </Tooltip>
      </div>
      <Button
        className={styles.presetSummary}
        type={ANTD_BUTTON_TYPE_TEXT}
        size={ANTD_BUTTON_SIZE_SMALL}
        onClick={() => setIsLibraryOpen(true)}
      >
        {getPresetSummaryText()}
      </Button>
      <MaterialLibraryDialog isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} />
    </div>
  );
};
