/**
 * The gear beside STOP: opens a small popover with the app-wide choice whether Escape also stops the laser while a
 * drawer, dialog or popover is open. The choice is off by default and is stored app-wide.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { SafetyOutlined, SettingOutlined } from '@ant-design/icons';
import { Checkbox, Popover } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_LARGE, ANTD_POPOVER_PLACEMENT_TOP_RIGHT, ANTD_POPOVER_TRIGGER_CLICK } from '../../utils/antd.constants';
import { useOverlayRegistration } from '../../utils/hooks/use.overlay.registration';
import { usePopoverCloseOnDialogOpen } from '../../utils/hooks/use.popover.close.on.dialog.open';
import { DEFAULT } from '../../utils/localization/default.locales';
import { EscStopPreferenceChanged, selectIsEscStoppingWithOverlayOpen } from '../../utils/states/app.preferences.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { IconActionButton } from '../../views/IconActionButton';
import { STOP_SETTINGS_POPOVER_OVERLAY_ID } from './stop.settings.button.constants';
import styles from './styles.module.scss';

export const StopSettingsButton = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isEscStopping: boolean = useSelector(selectIsEscStoppingWithOverlayOpen);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useOverlayRegistration(STOP_SETTINGS_POPOVER_OVERLAY_ID, isOpen);
  usePopoverCloseOnDialogOpen(isOpen, () => setIsOpen(false));

  const handlePreferenceChange = (event: CheckboxChangeEvent): void => {
    dispatch(new EscStopPreferenceChanged({ isEscStoppingWithOverlayOpen: event.target.checked }));
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={ANTD_POPOVER_TRIGGER_CLICK}
      placement={ANTD_POPOVER_PLACEMENT_TOP_RIGHT}
      title={t(DEFAULT.STOP_SETTINGS_TITLE)}
      // The arrow points at the gear, so the popover reads as its settings and not as a loose note.
      arrow={{ pointAtCenter: true }}
      rootClassName={styles.stopSettingsPopoverRoot}
      content={(
        <div className={styles.content}>
          <Checkbox className={styles.preference} checked={isEscStopping} onChange={handlePreferenceChange}>
            {t(DEFAULT.STOP_SETTINGS_ESC_STOPS_WITH_PANEL_OPEN)}
          </Checkbox>
          <p className={styles.hint}>
            <SafetyOutlined aria-hidden />
            <span>{t(DEFAULT.STOP_SETTINGS_ESC_HINT)}</span>
          </p>
        </div>
      )}
    >
      <IconActionButton
        className={styles.stopSettingsButton}
        size={ANTD_BUTTON_SIZE_LARGE}
        labelText={t(DEFAULT.STOP_SETTINGS_TITLE)}
        iconComponent={<SettingOutlined aria-hidden />}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      />
    </Popover>
  );
};
