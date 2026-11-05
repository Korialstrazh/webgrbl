/**
 * The Reset to defaults and Export for Inkscape icon buttons, and a help popover on where Inkscape keeps its
 * palettes. Reset
 * asks first, because it replaces every entry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DownloadOutlined, QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Popover } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ANTD_BUTTON_TYPE_TEXT, ANTD_POPOVER_TRIGGER_CLICK } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { AppDispatch } from '../../../utils/states/new.store';
import { PaletteExportRequested, PaletteResetRequested } from '../../../utils/states/palette.state';
import { DismissibleTooltip } from '../../../views/DismissibleTooltip';
import { IconActionButton } from '../../../views/IconActionButton';
import type { PaletteFileActionsProps } from '../interfaces/PaletteFileActionsProps';
import styles from './styles.module.scss';

export const PaletteFileActions = ({ onReset }: PaletteFileActionsProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();

  return (
    <div className={styles.paletteFileActions}>
      <div className={styles.actions}>
        <IconActionButton
          labelText={t(DEFAULT.PALETTE_EXPORT_LABEL)}
          iconComponent={<DownloadOutlined aria-hidden />}
          onClick={() => dispatch(new PaletteExportRequested())}
        />
        <DismissibleTooltip title={t(DEFAULT.PALETTE_INKSCAPE_HELP)}>
          <Popover
            trigger={ANTD_POPOVER_TRIGGER_CLICK}
            content={(
              <div className={styles.help}>
                <p className={styles.hint}>{t(DEFAULT.PALETTE_INKSCAPE_HINT)}</p>
                <ul className={styles.paths}>
                  <li>{t(DEFAULT.PALETTE_INKSCAPE_PATH_LINUX)}</li>
                  <li>{t(DEFAULT.PALETTE_INKSCAPE_PATH_WINDOWS)}</li>
                </ul>
              </div>
            )}
          >
            <Button icon={<QuestionCircleOutlined />} aria-label={t(DEFAULT.PALETTE_INKSCAPE_HELP)} />
          </Popover>
        </DismissibleTooltip>
        <span className={styles.resetAction}>
          <DismissibleTooltip title={t(DEFAULT.PALETTE_RESET_LABEL)}>
            <Popconfirm
              title={t(DEFAULT.PALETTE_RESET_CONFIRM)}
              okText={t(DEFAULT.PALETTE_RESET_OK)}
              cancelText={t(DEFAULT.PALETTE_RESET_CANCEL)}
              okButtonProps={{ danger: true }}
              onConfirm={() => {
                dispatch(new PaletteResetRequested());
                onReset();
              }}
            >
              {/* A quiet icon until asked: the confirmation, with its red OK, is where the reset turns loud. */}
              <Button
                type={ANTD_BUTTON_TYPE_TEXT}
                danger
                icon={<ReloadOutlined aria-hidden />}
                aria-label={t(DEFAULT.PALETTE_RESET_LABEL)}
              />
            </Popconfirm>
          </DismissibleTooltip>
        </span>
      </div>
    </div>
  );
};
