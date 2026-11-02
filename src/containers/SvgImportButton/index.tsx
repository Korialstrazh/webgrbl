/**
 * A button that opens the file picker and asks for an import of the picked SVG files. The file input stays hidden,
 * since antd has no file picker that fits a plain button, and is reset after each pick so the same file can be
 * picked again.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button } from 'antd';
import { useRef } from 'react';
import type { ChangeEvent, ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ANTD_BUTTON_TYPE_DEFAULT } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { AppDispatch } from '../../utils/states/new.store';
import { SvgFilesImportRequested } from '../../utils/states/project.document.state';
import type { SvgImportButtonProps } from './interfaces/SvgImportButtonProps';
import styles from './styles.module.scss';
import { EMPTY_FILE_INPUT_VALUE, SVG_FILE_PICKER_ACCEPT, SVG_IMPORT_INPUT_TEST_ID } from './svg.import.button.constants';

export const SvgImportButton = ({
  buttonType = ANTD_BUTTON_TYPE_DEFAULT,
  iconComponent,
  labelClassName,
}: SvgImportButtonProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const inputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null);

  const handleFilesPicked = (changeEvent: ChangeEvent<HTMLInputElement>): void => {
    const pickedFiles: File[] = Array.from(changeEvent.target.files ?? []);

    if (pickedFiles.length) {
      dispatch(new SvgFilesImportRequested({ files: pickedFiles }));
    }

    changeEvent.target.value = EMPTY_FILE_INPUT_VALUE;
  };

  return (
    <>
      <Button
        type={buttonType}
        icon={iconComponent}
        aria-label={t(DEFAULT.TOP_BAR_MENU_IMPORT_SVG)}
        onClick={() => inputRef.current?.click()}
      >
        <span className={labelClassName}>{t(DEFAULT.TOP_BAR_MENU_IMPORT_SVG)}</span>
      </Button>
      <input
        ref={inputRef}
        className={styles.hiddenInput}
        type="file"
        accept={SVG_FILE_PICKER_ACCEPT}
        multiple
        tabIndex={-1}
        aria-hidden
        data-testid={SVG_IMPORT_INPUT_TEST_ID}
        onChange={handleFilesPicked}
      />
    </>
  );
};
