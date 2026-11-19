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
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BookOutlined, SlidersOutlined } from '@ant-design/icons';
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
import { selectProjectObjects } from '../../utils/states/project.document.state';
import { MachineProfilesDialogOpenChanged } from '../../utils/states/ui.workbench.state';
import { DismissibleTooltip } from '../../views/DismissibleTooltip';
import { IconActionButton } from '../../views/IconActionButton';
import { LaserMachineIcon } from '../../views/LaserMachineIcon';
import { MaterialLibraryDrawer } from '../MaterialLibraryDrawer';
import { ProjectMaterialSelect } from '../ProjectMaterialSelect';
import styles from './styles.module.scss';

export const MaterialSection = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const activeMaterial: Material | undefined = useSelector(selectActiveMaterial);
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const activePresetCount: number = useSelector(selectActiveMaterialPresetCount);
  const hasProjectObjects: boolean = Boolean(useSelector(selectProjectObjects).length);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  // The material the library is filtered to when it opens: the project material from the link, none from the button.
  const [libraryMaterialId, setLibraryMaterialId] = useState<string | undefined>(undefined);

  const isWaitingForMaterial: boolean = Boolean(activeProfile) && !activeMaterial;
  const noMaterialText: string = t(DEFAULT.MATERIAL_SECTION_PRESETS_NO_MATERIAL);

  const getPresetSummaryText = (): string => {
    if (!activeProfile) {
      return t(DEFAULT.MATERIAL_SECTION_PRESETS_NO_MACHINE);
    }

    // Until a material is chosen the entry is one word; why it lists nothing yet is in its tooltip and name.
    if (!activeMaterial) {
      return t(DEFAULT.MATERIAL_SECTION_PRESETS_NONE);
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

    // Sliders for the saved settings, so the entry never looks like the Library book beside it.
    return <SlidersOutlined />;
  };

  const openLibrary = (materialId: string | undefined): void => {
    setLibraryMaterialId(materialId);
    setIsLibraryOpen(true);
  };

  const openProfilesDialog = (): void => {
    dispatch(new MachineProfilesDialogOpenChanged({ isMachineProfilesDialogOpen: true }));
  };

  return (
    // Muted while the bed is empty, like the Layers and Objects placeholders around it; it still works as usual.
    <div
      className={[styles.materialSection, hasProjectObjects ? undefined : styles.idleMaterialSection].join(' ')}
      data-idle={!hasProjectObjects}
    >
      <ProjectMaterialSelect />
      {/* The presets entry and the library sit on one row of small captioned buttons under the full-width select. */}
      <div className={styles.entryRow}>
        <DismissibleTooltip title={isWaitingForMaterial ? noMaterialText : t(DEFAULT.MATERIAL_SECTION_PRESETS_HINT)}>
          <Button
            className={[styles.presetSummary, isWaitingForMaterial ? styles.mutedPresetSummary : undefined].join(' ')}
            aria-label={isWaitingForMaterial ? noMaterialText : undefined}
            size={ANTD_BUTTON_SIZE_SMALL}
            icon={<span className={styles.presetSummaryIcon} aria-hidden>{getPresetSummaryIconComponent()}</span>}
            onClick={activeProfile ? () => openLibrary(activeMaterial?.id) : openProfilesDialog}
          >
            <span className={styles.presetSummaryText}>{getPresetSummaryText()}</span>
          </Button>
        </DismissibleTooltip>
        {/* Its tooltip goes on the click: left open it would cover the drawer and take the drawer's Escape. */}
        <IconActionButton
          size={ANTD_BUTTON_SIZE_SMALL}
          labelText={t(DEFAULT.MATERIAL_SECTION_OPEN_LIBRARY)}
          iconComponent={<BookOutlined />}
          captionText={t(DEFAULT.MATERIAL_SECTION_LIBRARY_CAPTION)}
          onClick={() => openLibrary(undefined)}
        />
      </div>
      <MaterialLibraryDrawer
        isOpen={isLibraryOpen}
        initialMaterialId={libraryMaterialId}
        onClose={() => setIsLibraryOpen(false)}
      />
    </div>
  );
};
