/**
 * The hidden file input behind every Import SVG control, and the call that opens its picker.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useRef } from 'react';
import type { ChangeEvent, ReactNode, RefObject } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../utils/states/new.store';
import { SvgFilesImportRequested } from '../../utils/states/project.document.state';
import styles from './styles.module.scss';
import { EMPTY_FILE_INPUT_VALUE, SVG_FILE_PICKER_ACCEPT, SVG_IMPORT_INPUT_TEST_ID } from './svg.import.button.constants';

interface SvgFilePicker {
  openSvgFilePicker: () => void;
  fileInputComponent: ReactNode;
}

export const useSvgFilePicker = (): SvgFilePicker => {
  const dispatch: AppDispatch = useDispatch();
  const inputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null);

  const handleFilesPicked = (changeEvent: ChangeEvent<HTMLInputElement>): void => {
    const pickedFiles: File[] = Array.from(changeEvent.target.files ?? []);

    if (pickedFiles.length) {
      dispatch(new SvgFilesImportRequested({ files: pickedFiles }));
    }

    changeEvent.target.value = EMPTY_FILE_INPUT_VALUE;
  };

  return {
    openSvgFilePicker: () => inputRef.current?.click(),
    fileInputComponent: (
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
    ),
  };
};
