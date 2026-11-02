/**
 * The one STOP button, an antd solid danger button in the large size: sends the stop request and can be pressed
 * whenever the laser is connected. It shows its Esc shortcut. While disconnected it looks disabled, grey with a dark
 * red outline, so it only looks armed when a press can stop the laser.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_LARGE, ANTD_BUTTON_TYPE_PRIMARY } from '../../utils/antd.constants';
import { ESCAPE_KEY } from '../../utils/browser/browser.events.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectIsConnected } from '../../utils/states/grbl.connection.state';
import { MachineStopRequested } from '../../utils/states/machine.status.state';
import type { AppDispatch } from '../../utils/states/new.store';
import styles from './styles.module.scss';

export const StopButton = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isConnected: boolean = useSelector(selectIsConnected);

  return (
    <Button
      className={styles.stopButton}
      type={ANTD_BUTTON_TYPE_PRIMARY}
      size={ANTD_BUTTON_SIZE_LARGE}
      danger
      disabled={!isConnected}
      aria-keyshortcuts={ESCAPE_KEY}
      onClick={() => dispatch(new MachineStopRequested())}
    >
      {t(DEFAULT.MACHINE_CONTROL_STOP)}
      {/* The shortcut is announced through aria-keyshortcuts, so the visible hint stays out of the button name. */}
      <kbd className={styles.shortcutHint} aria-hidden="true">{t(DEFAULT.MACHINE_CONTROL_STOP_SHORTCUT)}</kbd>
    </Button>
  );
};
