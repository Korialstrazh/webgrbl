/**
 * Imports a material presets file for the active machine and exports the ticked presets. A file that is not valid
 * changes nothing and shows an error toast. The status asks the user to test first, because rescaled power is only a
 * starting point on another laser.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button } from 'antd';
import { useRef, useState } from 'react';
import type { ChangeEvent, ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { downloadTextFile } from '../../../utils/browser/download.text.file';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getImportedMaterialPresets } from '../../../utils/materials/get.imported.material.presets';
import { getMaterialPresetsFileText } from '../../../utils/materials/get.material.presets.file.text';
import type { ImportedMaterialPresets } from '../../../utils/materials/interfaces/ImportedMaterialPresets';
import type { Material } from '../../../utils/materials/interfaces/Material';
import {
  MATERIAL_PRESETS_FILE_ACCEPT,
  MATERIAL_PRESETS_FILE_MIME_TYPE,
  MATERIAL_PRESETS_FILE_NAME,
} from '../../../utils/materials/material.preset.constants';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import { selectActiveMachineProfile, selectMachineProfiles } from '../../../utils/states/machine.profile.state';
import { MaterialPresetSaved } from '../../../utils/states/material.preset.state';
import { MaterialSaved, selectMaterials } from '../../../utils/states/material.state';
import type { AppDispatch, AppStore } from '../../../utils/states/new.store';
import { NO_TOAST_PARAMETERS, TOAST_SEVERITY } from '../../../utils/states/toast.constants';
import { ToastShown } from '../../../utils/states/toast.state';
import { useAppStore } from '../../../utils/states/use.app.store';
import type { PresetFileActionsProps } from '../interfaces/PresetFileActionsProps';
import styles from './styles.module.scss';

/** Clearing the picked file lets the same file be picked again, which would otherwise fire no change. */
const EMPTY_FILE_INPUT_VALUE = '';

export const PresetFileActions = ({ selectedPresets }: PresetFileActionsProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const store: AppStore = useAppStore();
  const fileInputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null);
  const materials: Material[] = useSelector(selectMaterials);
  const profiles: MachineProfile[] = useSelector(selectMachineProfiles);
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const [importedCount, setImportedCount] = useState<number>(0);

  const showImportInvalidToast = (): void => {
    dispatch(new ToastShown({
      severity: TOAST_SEVERITY.ERROR,
      messageKey: DEFAULT.TOAST_MATERIAL_PRESETS_IMPORT_INVALID,
      messageParameters: NO_TOAST_PARAMETERS,
    }));
  };

  const importPresetsFile = async (pickedFile: File, machineProfile: MachineProfile): Promise<void> => {
    try {
      const fileText: string = await pickedFile.text();
      // Read after the file: the materials may have changed while it was being read.
      const imported: ImportedMaterialPresets | undefined =
        getImportedMaterialPresets(fileText, selectMaterials(store.getState()), machineProfile);

      if (!imported) {
        showImportInvalidToast();

        return;
      }

      for (const material of imported.newMaterials) {
        dispatch(new MaterialSaved({ material }));
      }

      for (const preset of imported.presets) {
        dispatch(new MaterialPresetSaved({ preset }));
      }

      setImportedCount(imported.presets.length);
    } catch {
      showImportInvalidToast();
    }
  };

  const handleFileInputChange = (changeEvent: ChangeEvent<HTMLInputElement>): void => {
    const [pickedFile] = changeEvent.target.files ?? [];

    changeEvent.target.value = EMPTY_FILE_INPUT_VALUE;

    if (pickedFile && activeProfile) {
      void importPresetsFile(pickedFile, activeProfile);
    }
  };

  const exportPresets = (): void => {
    downloadTextFile({
      text: getMaterialPresetsFileText(selectedPresets, materials, profiles),
      fileName: MATERIAL_PRESETS_FILE_NAME,
      mimeType: MATERIAL_PRESETS_FILE_MIME_TYPE,
    });
  };

  return (
    <div className={styles.presetFileActions}>
      <Button disabled={!activeProfile} onClick={() => fileInputRef.current?.click()}>
        {t(DEFAULT.MATERIAL_LIBRARY_IMPORT)}
      </Button>
      <Button disabled={!selectedPresets.length} onClick={exportPresets}>
        {t(DEFAULT.MATERIAL_LIBRARY_EXPORT, { count: selectedPresets.length })}
      </Button>
      {/* A raw file input: antd has no file picker without its Upload list; the Import button opens this one. */}
      <input
        ref={fileInputRef}
        type="file"
        accept={MATERIAL_PRESETS_FILE_ACCEPT}
        hidden
        aria-label={t(DEFAULT.MATERIAL_LIBRARY_IMPORT_FILE)}
        onChange={handleFileInputChange}
      />
      <p role="status">
        {Boolean(importedCount) && t(DEFAULT.MATERIAL_LIBRARY_IMPORTED, { count: importedCount })}
      </p>
    </div>
  );
};
