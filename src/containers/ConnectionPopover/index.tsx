/**
 * Port, baud rate and connect controls of the laser connection, shown in a popover under the connection pill.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { GRBL_BAUD_RATES, GRBL_CONNECTION_STATUS, SIMULATED_LASER_PORT_ID } from '../../utils/grbl/grbl.constants';
import type { GrblConnectionStatus } from '../../utils/grbl/grbl.constants';
import type { SerialPortDescriptor } from '../../utils/grbl/interfaces/SerialPortDescriptor';
import { useOverlayRegistration } from '../../utils/hooks/use.overlay.registration';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectIsWebSerialSupported } from '../../utils/states/browser.environment.state';
import {
  BaudRateSelected,
  ConnectRequested,
  DisconnectRequested,
  SerialPortPickerRequested,
  SerialPortSelected,
  selectAvailablePorts,
  selectBaudRate,
  selectConnectionStatus,
  selectIsConnected,
  selectSelectedPortId,
} from '../../utils/states/grbl.connection.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { BUTTON_VARIANT } from '../../views/Button/button.constants';
import { Button } from '../../views/Button';
import { Popover } from '../../views/Popover';
import { CONNECTION_POPOVER_OVERLAY_ID } from './connection.popover.constants';
import { getPortOptionLabel } from './get.port.option.label';
import styles from './styles.module.scss';

interface ConnectionPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

const getConnectButtonKey = (isConnected: boolean, isConnecting: boolean): string => {
  if (isConnecting) {
    return DEFAULT.CONNECTION_POPOVER_CONNECTING;
  }

  return isConnected ? DEFAULT.CONNECTION_POPOVER_DISCONNECT : DEFAULT.CONNECTION_POPOVER_CONNECT;
};

export const ConnectionPopover = ({ isOpen, onClose }: ConnectionPopoverProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const connectionStatus: GrblConnectionStatus = useSelector(selectConnectionStatus);
  const isConnected: boolean = useSelector(selectIsConnected);
  const isWebSerialSupported: boolean = useSelector(selectIsWebSerialSupported);
  const availablePorts: SerialPortDescriptor[] = useSelector(selectAvailablePorts);
  const selectedPortId: string = useSelector(selectSelectedPortId);
  const baudRate: number = useSelector(selectBaudRate);
  const isConnecting: boolean = connectionStatus === GRBL_CONNECTION_STATUS.CONNECTING;
  const isLinkLocked: boolean = isConnected || isConnecting;

  useOverlayRegistration(CONNECTION_POPOVER_OVERLAY_ID, isOpen);

  const toggleConnection = (): void => {
    dispatch(isConnected ? new DisconnectRequested() : new ConnectRequested());
  };

  return (
    <Popover isOpen={isOpen} onClose={onClose} anchorLabel={t(DEFAULT.CONNECTION_POPOVER_LABEL)}>
      <div className={styles.connectionPopover}>
        <label className={styles.field}>
          <span>{t(DEFAULT.CONNECTION_POPOVER_PORT)}</span>
          <select
            className={styles.select}
            value={selectedPortId}
            disabled={isLinkLocked}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              dispatch(new SerialPortSelected({ portId: event.target.value }))}
          >
            <option value={SIMULATED_LASER_PORT_ID}>{t(DEFAULT.CONNECTION_POPOVER_SIMULATED_LASER)}</option>
            {availablePorts.map((port: SerialPortDescriptor) => (
              <option key={port.portId} value={port.portId}>{getPortOptionLabel(port, t)}</option>
            ))}
          </select>
        </label>
        <Button
          variant={BUTTON_VARIANT.SECONDARY}
          isDisabled={!isWebSerialSupported || isLinkLocked}
          onClick={() => dispatch(new SerialPortPickerRequested())}
        >
          {t(DEFAULT.CONNECTION_POPOVER_CHOOSE_PORT)}
        </Button>
        {!isWebSerialSupported && (
          <p className={styles.unsupportedNotice}>{t(DEFAULT.CONNECTION_POPOVER_WEB_SERIAL_UNSUPPORTED)}</p>
        )}
        <label className={styles.field}>
          <span>{t(DEFAULT.CONNECTION_POPOVER_BAUD)}</span>
          <select
            className={styles.select}
            value={baudRate}
            disabled={isLinkLocked}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              dispatch(new BaudRateSelected({ baudRate: Number(event.target.value) }))}
          >
            {GRBL_BAUD_RATES.map((rate: number) => (
              <option key={rate} value={rate}>{rate}</option>
            ))}
          </select>
        </label>
        <Button
          variant={isConnected ? BUTTON_VARIANT.SECONDARY : BUTTON_VARIANT.PRIMARY}
          isDisabled={isConnecting}
          onClick={toggleConnection}
        >
          {t(getConnectButtonKey(isConnected, isConnecting))}
        </Button>
      </div>
    </Popover>
  );
};
