/**
 * The file actions of the machine profiles dialog: import a profiles file, export all profiles as one, and the
 * GRBL settings editor that is not built yet, as a muted note in a Coming soon list. An import adds the file's
 * profiles to the stored ones; a file that is not a valid profiles file changes nothing and shows an error toast.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { ClockCircleOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useRef } from 'react';
import type { ChangeEvent, ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { downloadTextFile } from '../../../utils/browser/download.text.file';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getImportedProfilesDocument } from '../../../utils/profiles/get.imported.profiles.document';
import { getProfilesExportText } from '../../../utils/profiles/get.profiles.export.text';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import type { MachineProfilesDocument } from '../../../utils/profiles/interfaces/MachineProfilesDocument';
import {
  MachineProfilesImported,
  selectMachineProfiles,
  selectMachineProfilesDocument,
} from '../../../utils/states/machine.profile.state';
import type { AppDispatch, AppStore } from '../../../utils/states/new.store';
import { NO_TOAST_PARAMETERS, TOAST_SEVERITY } from '../../../utils/states/toast.constants';
import { ToastShown } from '../../../utils/states/toast.state';
import { useAppStore } from '../../../utils/states/use.app.store';
import { SoonTag } from '../../../views/SoonTag';
import {
  MACHINE_PROFILES_EXPORT_FILE_NAME,
  MACHINE_PROFILES_FILE_ACCEPT,
  MACHINE_PROFILES_FILE_MIME_TYPE,
} from '../machine.profiles.dialog.constants';
import styles from './styles.module.scss';

/** Clearing the picked file lets the same file be picked again, which would otherwise fire no change. */
const EMPTY_FILE_INPUT_VALUE = '';

export const ProfileFileActions = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const store: AppStore = useAppStore();
  const fileInputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null);
  const profiles: MachineProfile[] = useSelector(selectMachineProfiles);

  const showImportInvalidToast = (): void => {
    dispatch(new ToastShown({
      severity: TOAST_SEVERITY.ERROR,
      messageKey: DEFAULT.TOAST_PROFILE_IMPORT_INVALID,
      messageParameters: NO_TOAST_PARAMETERS,
    }));
  };

  const importProfilesFile = async (pickedFile: File): Promise<void> => {
    try {
      const fileText: string = await pickedFile.text();
      // Read after the file: the stored profiles may have changed while it was being read.
      const currentDocument: MachineProfilesDocument = selectMachineProfilesDocument(store.getState());
      const importedDocument: MachineProfilesDocument | undefined =
        getImportedProfilesDocument(currentDocument, fileText);

      if (!importedDocument) {
        showImportInvalidToast();

        return;
      }

      dispatch(new MachineProfilesImported({ document: importedDocument }));
    } catch {
      showImportInvalidToast();
    }
  };

  const handleFileInputChange = (changeEvent: ChangeEvent<HTMLInputElement>): void => {
    const [pickedFile] = changeEvent.target.files ?? [];

    changeEvent.target.value = EMPTY_FILE_INPUT_VALUE;

    if (pickedFile) {
      void importProfilesFile(pickedFile);
    }
  };

  const exportProfiles = (): void => {
    downloadTextFile({
      text: getProfilesExportText(profiles),
      fileName: MACHINE_PROFILES_EXPORT_FILE_NAME,
      mimeType: MACHINE_PROFILES_FILE_MIME_TYPE,
    });
  };

  return (
    <div className={styles.profileFileActions}>
      <div className={styles.transferButtons}>
        {/* Icon and word, as in the material library. */}
        <Button icon={<UploadOutlined aria-hidden />} onClick={() => fileInputRef.current?.click()}>
          {t(DEFAULT.MACHINE_PROFILES_IMPORT)}
        </Button>
        <Button icon={<DownloadOutlined aria-hidden />} disabled={!profiles.length} onClick={exportProfiles}>
          {t(DEFAULT.MACHINE_PROFILES_EXPORT)}
        </Button>
      </div>
      {/* eslint-disable-next-line webgrbl/no-raw-form-elements -- hidden picker; antd Upload adds a list */}
      <input
        ref={fileInputRef}
        type="file"
        accept={MACHINE_PROFILES_FILE_ACCEPT}
        hidden
        aria-label={t(DEFAULT.MACHINE_PROFILES_IMPORT_FILE)}
        onChange={handleFileInputChange}
      />
      {/* Not built yet: a quiet dashed note with a clock and a Soon tag, never a button, a link or a form. */}
      <section className={styles.comingSoonRow} aria-label={t(DEFAULT.COMING_SOON_LIST)}>
        <Tooltip title={t(DEFAULT.MACHINE_PROFILES_GRBL_SETTINGS_DESCRIPTION)}>
          <span className={styles.comingSoonItem}>
            <ClockCircleOutlined aria-hidden />
            {t(DEFAULT.MACHINE_PROFILES_GRBL_SETTINGS)}
          </span>
        </Tooltip>
        <SoonTag description={t(DEFAULT.MACHINE_PROFILES_GRBL_SETTINGS_DESCRIPTION)} />
      </section>
    </div>
  );
};
