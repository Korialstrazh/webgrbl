/**
 * Imports a material presets file for the active machine and exports the ticked presets, from the header of the
 * library drawer. A file that is not valid changes nothing and shows an error toast. A successful import shows a toast
 * that asks the user to test first, because rescaled power is only a starting point on another laser.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useRef } from 'react';
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
      const importedPresets: ImportedMaterialPresets | undefined =
        getImportedMaterialPresets(fileText, selectMaterials(store.getState()), machineProfile);

      if (!importedPresets) {
        showImportInvalidToast();

        return;
      }

      for (const material of importedPresets.newMaterials) {
        dispatch(new MaterialSaved({ material }));
      }

      for (const preset of importedPresets.presets) {
        dispatch(new MaterialPresetSaved({ preset }));
      }

      dispatch(new ToastShown({
        severity: TOAST_SEVERITY.INFO,
        messageKey: DEFAULT.MATERIAL_LIBRARY_IMPORTED,
        messageParameters: { count: importedPresets.presets.length },
      }));
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

  // The count only once there is one: a zero in the label would read as a fault, not as a hint.
  const exportLabel: string = selectedPresets.length
    ? t(DEFAULT.MATERIAL_LIBRARY_EXPORT_COUNT, { count: selectedPresets.length })
    : t(DEFAULT.MATERIAL_LIBRARY_EXPORT);

  const exportPresets = (): void => {
    downloadTextFile({
      text: getMaterialPresetsFileText(selectedPresets, materials, profiles),
      fileName: MATERIAL_PRESETS_FILE_NAME,
      mimeType: MATERIAL_PRESETS_FILE_MIME_TYPE,
    });
  };

  return (
    <div className={styles.presetFileActions}>
      {/* Import takes a file in and Export gives one out, so the icons are the file upload and download arrows. The
          icons carry labels of their own, so each button names itself to keep its name to its text. */}
      <Button
        icon={<UploadOutlined />}
        aria-label={t(DEFAULT.MATERIAL_LIBRARY_IMPORT)}
        disabled={!activeProfile}
        onClick={() => fileInputRef.current?.click()}
      >
        {t(DEFAULT.MATERIAL_LIBRARY_IMPORT)}
      </Button>
      {/* Export waits for ticks, and says so: a disabled button fires no hover events, so a plain wrapper does. */}
      <Tooltip title={selectedPresets.length ? undefined : t(DEFAULT.MATERIAL_LIBRARY_EXPORT_HINT)}>
        <span className={styles.exportButtonWrapper}>
          <Button
            icon={<DownloadOutlined />}
            aria-label={exportLabel}
            disabled={!selectedPresets.length}
            onClick={exportPresets}
          >
            {exportLabel}
          </Button>
        </span>
      </Tooltip>
      {/* A raw file input: antd has no file picker without its Upload list; the Import button opens this one. */}
      <input
        ref={fileInputRef}
        type="file"
        accept={MATERIAL_PRESETS_FILE_ACCEPT}
        hidden
        aria-label={t(DEFAULT.MATERIAL_LIBRARY_IMPORT_FILE)}
        onChange={handleFileInputChange}
      />
    </div>
  );
};
