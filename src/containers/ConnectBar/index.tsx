/**
 * Port, baud rate and connect controls of the laser connection, with the firmware name once connected.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { GRBL_BAUD_RATES, GRBL_CONNECTION_STATUS, SIMULATED_LASER_PORT_ID } from '../../utils/grbl/grbl.constants';
import type { GrblConnectionStatus } from '../../utils/grbl/grbl.constants';
import type { GrblFirmwareIdentity } from '../../utils/grbl/interfaces/GrblFirmwareIdentity';
import type { SerialPortDescriptor } from '../../utils/grbl/interfaces/SerialPortDescriptor';
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
  selectFirmwareIdentity,
  selectIsConnected,
  selectSelectedPortId,
} from '../../utils/states/grbl.connection.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { getPortOptionLabel } from './get.port.option.label';
import styles from './styles.module.scss';

const getConnectButtonKey = (isConnected: boolean, isConnecting: boolean): string => {
  if (isConnecting) {
    return DEFAULT.CONNECT_BAR_CONNECTING;
  }

  return isConnected ? DEFAULT.CONNECT_BAR_DISCONNECT : DEFAULT.CONNECT_BAR_CONNECT;
};

export const ConnectBar = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const connectionStatus: GrblConnectionStatus = useSelector(selectConnectionStatus);
  const isConnected: boolean = useSelector(selectIsConnected);
  const isWebSerialSupported: boolean = useSelector(selectIsWebSerialSupported);
  const availablePorts: SerialPortDescriptor[] = useSelector(selectAvailablePorts);
  const selectedPortId: string = useSelector(selectSelectedPortId);
  const baudRate: number = useSelector(selectBaudRate);
  const firmwareIdentity: GrblFirmwareIdentity | undefined = useSelector(selectFirmwareIdentity);
  const isConnecting: boolean = connectionStatus === GRBL_CONNECTION_STATUS.CONNECTING;
  const isLinkLocked: boolean = isConnected || isConnecting;

  const toggleConnection = (): void => {
    dispatch(isConnected ? new DisconnectRequested() : new ConnectRequested());
  };

  return (
    <div className={styles.connectBar}>
      <label className={styles.field}>
        <span>{t(DEFAULT.CONNECT_BAR_PORT)}</span>
        <select
          value={selectedPortId}
          disabled={isLinkLocked}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            dispatch(new SerialPortSelected({ portId: event.target.value }))}
        >
          <option value={SIMULATED_LASER_PORT_ID}>{t(DEFAULT.CONNECT_BAR_SIMULATED_LASER)}</option>
          {availablePorts.map((port: SerialPortDescriptor) => (
            <option key={port.portId} value={port.portId}>{getPortOptionLabel(port, t)}</option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className={styles.button}
        disabled={!isWebSerialSupported || isLinkLocked}
        title={isWebSerialSupported ? undefined : t(DEFAULT.BROWSER_STATUS_WEB_SERIAL_UNSUPPORTED)}
        onClick={() => dispatch(new SerialPortPickerRequested())}
      >
        {t(DEFAULT.CONNECT_BAR_CHOOSE_PORT)}
      </button>
      <label className={styles.field}>
        <span>{t(DEFAULT.CONNECT_BAR_BAUD)}</span>
        <select
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
      <button type="button" className={styles.button} disabled={isConnecting} onClick={toggleConnection}>
        {t(getConnectButtonKey(isConnected, isConnecting))}
      </button>
      {isConnected && firmwareIdentity && (
        <span className={styles.firmware}>
          {t(DEFAULT.CONNECT_BAR_FIRMWARE, {
            firmwareName: firmwareIdentity.firmwareName,
            version: firmwareIdentity.version,
          })}
        </span>
      )}
    </div>
  );
};
