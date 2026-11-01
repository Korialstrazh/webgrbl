/**
 * The Reset to defaults and Export for Inkscape buttons, and the hint on where Inkscape keeps its palettes. Reset
 * asks first, because it replaces every entry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Popconfirm } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { AppDispatch } from '../../../utils/states/new.store';
import { PaletteExportRequested, PaletteResetRequested } from '../../../utils/states/palette.state';
import styles from './styles.module.scss';

export const PaletteFileActions = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();

  return (
    <div className={styles.paletteFileActions}>
      <div className={styles.actions}>
        <Popconfirm
          title={t(DEFAULT.PALETTE_RESET_CONFIRM)}
          okText={t(DEFAULT.PALETTE_RESET_OK)}
          cancelText={t(DEFAULT.PALETTE_RESET_CANCEL)}
          okButtonProps={{ danger: true }}
          onConfirm={() => dispatch(new PaletteResetRequested())}
        >
          <Button>{t(DEFAULT.PALETTE_RESET)}</Button>
        </Popconfirm>
        <Button onClick={() => dispatch(new PaletteExportRequested())}>{t(DEFAULT.PALETTE_EXPORT)}</Button>
      </div>
      <p className={styles.hint}>{t(DEFAULT.PALETTE_INKSCAPE_HINT)}</p>
      <ul className={styles.paths}>
        <li>{t(DEFAULT.PALETTE_INKSCAPE_PATH_LINUX)}</li>
        <li>{t(DEFAULT.PALETTE_INKSCAPE_PATH_WINDOWS)}</li>
      </ul>
    </div>
  );
};
