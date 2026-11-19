/**
 * The hidden file input behind every Open file button: a picked project file is sent as an import request, and the
 * input is reset so the same file can be picked again. The owner opens the picker through the ref.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { AppDispatch } from '../../utils/states/new.store';
import { ProjectFileImportRequested } from '../../utils/states/project.state';
import type { ProjectFileInputProps } from './interfaces/ProjectFileInputProps';
import { EMPTY_FILE_INPUT_VALUE, PROJECT_FILE_PICKER_ACCEPT } from './project.file.input.constants';

export const ProjectFileInput = ({ inputRef }: ProjectFileInputProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();

  const handleFilePicked = (changeEvent: ChangeEvent<HTMLInputElement>): void => {
    const [pickedFile] = changeEvent.target.files ?? [];

    changeEvent.target.value = EMPTY_FILE_INPUT_VALUE;

    if (pickedFile) {
      dispatch(new ProjectFileImportRequested({ file: pickedFile }));
    }
  };

  return (
    // eslint-disable-next-line webgrbl/no-raw-form-elements -- hidden picker; antd Upload adds a list
    <input
      ref={inputRef}
      type="file"
      accept={PROJECT_FILE_PICKER_ACCEPT}
      hidden
      aria-label={t(DEFAULT.PROJECT_FILE_INPUT)}
      onChange={handleFilePicked}
    />
  );
};
