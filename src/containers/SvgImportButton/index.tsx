/**
 * A button that opens the file picker and asks for an import of the picked SVG files. The file input stays hidden,
 * since antd has no file picker that fits a plain button, and is reset after each pick so the same file can be
 * picked again.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_TYPE_DEFAULT } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { SvgImportButtonProps } from './interfaces/SvgImportButtonProps';
import { useSvgFilePicker } from './use.svg.file.picker';

export const SvgImportButton = ({
  buttonType = ANTD_BUTTON_TYPE_DEFAULT,
  iconComponent,
  labelClassName,
  buttonId,
}: SvgImportButtonProps): ReactNode => {
  const { t } = useTranslation();
  const { openSvgFilePicker, fileInputComponent } = useSvgFilePicker();

  return (
    <>
      <Button
        id={buttonId}
        type={buttonType}
        icon={iconComponent}
        aria-label={t(DEFAULT.TOP_BAR_MENU_IMPORT_SVG)}
        onClick={openSvgFilePicker}
      >
        <span className={labelClassName}>{t(DEFAULT.TOP_BAR_MENU_IMPORT_SVG)}</span>
      </Button>
      {fileInputComponent}
    </>
  );
};
