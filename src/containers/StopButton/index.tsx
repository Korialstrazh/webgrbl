/**
 * The one STOP button, an antd solid danger button in the large size: sends the stop request and can be pressed
 * whenever the laser is connected. It shows its Esc shortcut. While disconnected it is a neutral disabled button, no
 * red at all, with a readable label and a short unplugged Not connected cue, so red always means a press stops the
 * laser.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DisconnectOutlined, StopFilled } from '@ant-design/icons';
import { Button } from 'antd';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_LARGE, ANTD_BUTTON_TYPE_DEFAULT, ANTD_BUTTON_TYPE_PRIMARY } from '../../utils/antd.constants';
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
  const notConnectedHintId: string = useId();

  return (
    <>
      <Button
        className={styles.stopButton}
        type={isConnected ? ANTD_BUTTON_TYPE_PRIMARY : ANTD_BUTTON_TYPE_DEFAULT}
        size={ANTD_BUTTON_SIZE_LARGE}
        danger={isConnected}
        icon={<StopFilled aria-hidden />}
        disabled={!isConnected}
        aria-keyshortcuts={ESCAPE_KEY}
        aria-describedby={isConnected ? undefined : notConnectedHintId}
        onClick={() => dispatch(new MachineStopRequested())}
      >
        {t(DEFAULT.MACHINE_CONTROL_STOP)}
        {/* The shortcut is announced through aria-keyshortcuts, so the visible hint stays out of the button name. */}
        <kbd className={styles.shortcutHint} aria-hidden="true">{t(DEFAULT.MACHINE_CONTROL_STOP_SHORTCUT)}</kbd>
        {/* The reason reaches screen readers through aria-describedby, so the visible cue stays out of the name. */}
        {isConnected ? undefined : (
          <span className={styles.notConnectedCue} aria-hidden="true">
            <DisconnectOutlined />
            {t(DEFAULT.MACHINE_CONTROL_STOP_OFFLINE)}
          </span>
        )}
      </Button>
      {/* Outside the button, so the hint describes STOP without joining its name. */}
      {isConnected ? undefined : (
        <span id={notConnectedHintId} className={styles.notConnectedText}>
          {t(DEFAULT.MACHINE_CONTROL_STOP_NOT_CONNECTED)}
        </span>
      )}
    </>
  );
};
