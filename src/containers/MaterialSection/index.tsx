/**
 * The Material panel of the design view: the material select with the Library button beside it, and a link below
 * that says how many presets the project material has on the active machine. The button opens the whole library;
 * the link opens it filtered to the project material, so the presets of a material are found where the material is
 * chosen. With no laser profile the link is a small chip that opens the profiles instead.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { UnorderedListOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { Material } from '../../utils/materials/interfaces/Material';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { selectActiveMachineProfile } from '../../utils/states/machine.profile.state';
import { selectActiveMaterial, selectActiveMaterialPresetCount } from '../../utils/states/material.selectors';
import type { AppDispatch } from '../../utils/states/new.store';
import { MachineProfilesDialogOpenChanged } from '../../utils/states/ui.workbench.state';
import { IconActionButton } from '../../views/IconActionButton';
import { LaserMachineIcon } from '../../views/LaserMachineIcon';
import { MaterialSheetIcon } from '../../views/MaterialSheetIcon';
import { MaterialLibraryDrawer } from '../MaterialLibraryDrawer';
import { ProjectMaterialSelect } from '../ProjectMaterialSelect';
import styles from './styles.module.scss';

export const MaterialSection = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const activeMaterial: Material | undefined = useSelector(selectActiveMaterial);
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const activePresetCount: number = useSelector(selectActiveMaterialPresetCount);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  // The material the library is filtered to when it opens: the project material from the link, none from the button.
  const [libraryMaterialId, setLibraryMaterialId] = useState<string | undefined>(undefined);

  const getPresetSummaryText = (): string => {
    if (!activeProfile) {
      return t(DEFAULT.MATERIAL_SECTION_PRESETS_NO_MACHINE);
    }

    if (!activeMaterial) {
      return t(DEFAULT.MATERIAL_SECTION_PRESETS_NO_MATERIAL);
    }

    return t(
      activePresetCount ? DEFAULT.MATERIAL_SECTION_PRESETS : DEFAULT.MATERIAL_SECTION_PRESETS_NONE,
      {
        count: activePresetCount,
        name: activeMaterial.name,
        thickness: activeMaterial.thicknessMm,
        machine: activeProfile.name,
      },
    );
  };

  const getPresetSummaryIconComponent = (): ReactNode => {
    if (!activeProfile) {
      return <LaserMachineIcon />;
    }

    if (!activeMaterial) {
      return <MaterialSheetIcon />;
    }

    // The button opens the library either way, so it shows the list, never an add sign.
    return <UnorderedListOutlined />;
  };

  const openLibrary = (materialId: string | undefined): void => {
    setLibraryMaterialId(materialId);
    setIsLibraryOpen(true);
  };

  const openProfilesDialog = (): void => {
    dispatch(new MachineProfilesDialogOpenChanged({ isMachineProfilesDialogOpen: true }));
  };

  return (
    <div className={styles.materialSection}>
      <div className={styles.selectRow}>
        <ProjectMaterialSelect />
        {/* Its tooltip goes on the click: left open it would cover the drawer and take the drawer's Escape. */}
        <IconActionButton
          labelText={t(DEFAULT.MATERIAL_SECTION_OPEN_LIBRARY)}
          iconComponent={<MaterialSheetIcon />}
          onClick={() => openLibrary(undefined)}
        />
      </div>
      {/* A small icon button with its label, like the other controls of the panel. */}
      <Button
        className={styles.presetSummary}
        size={ANTD_BUTTON_SIZE_SMALL}
        icon={<span className={styles.presetSummaryIcon} aria-hidden>{getPresetSummaryIconComponent()}</span>}
        onClick={activeProfile ? () => openLibrary(activeMaterial?.id) : openProfilesDialog}
      >
        <span className={styles.presetSummaryText}>{getPresetSummaryText()}</span>
      </Button>
      <MaterialLibraryDrawer
        isOpen={isLibraryOpen}
        initialMaterialId={libraryMaterialId}
        onClose={() => setIsLibraryOpen(false)}
      />
    </div>
  );
};
