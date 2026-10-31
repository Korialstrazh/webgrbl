/**
 * The connection status in the top bar: state, firmware, port, and whether the browser is online and can use Web
 * Serial. Clicking it opens and closes the connection popover.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { GrblConnectionStatus } from '../../utils/grbl/grbl.constants';
import type { GrblFirmwareIdentity } from '../../utils/grbl/interfaces/GrblFirmwareIdentity';
import type { SerialPortDescriptor } from '../../utils/grbl/interfaces/SerialPortDescriptor';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectIsOnline, selectIsWebSerialSupported } from '../../utils/states/browser.environment.state';
import {
  selectAvailablePorts,
  selectConnectionStatus,
  selectFirmwareIdentity,
  selectIsConnected,
  selectSelectedPortId,
} from '../../utils/states/grbl.connection.state';
import { ConnectionPopover } from '../ConnectionPopover';
import { CONNECTION_PILL_STATUS_LABEL_KEY } from './connection.pill.constants';
import { getSelectedPortLabel } from './get.selected.port.label';
import styles from './styles.module.scss';

const POPUP_KIND_DIALOG = 'dialog';

const getIndicatorClassName = (isPositive: boolean): string =>
  [styles.indicator, isPositive ? styles.positive : styles.negative].join(' ');

const getOnlineLabelKey = (isOnline: boolean): string =>
  isOnline ? DEFAULT.CONNECTION_PILL_ONLINE : DEFAULT.CONNECTION_PILL_OFFLINE;

export const ConnectionPill = (): ReactNode => {
  const { t } = useTranslation();
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const pillRef: RefObject<HTMLButtonElement | null> = useRef<HTMLButtonElement | null>(null);
  const connectionStatus: GrblConnectionStatus = useSelector(selectConnectionStatus);
  const isConnected: boolean = useSelector(selectIsConnected);
  const isOnline: boolean = useSelector(selectIsOnline);
  const isWebSerialSupported: boolean = useSelector(selectIsWebSerialSupported);
  const availablePorts: SerialPortDescriptor[] = useSelector(selectAvailablePorts);
  const selectedPortId: string = useSelector(selectSelectedPortId);
  const firmwareIdentity: GrblFirmwareIdentity | undefined = useSelector(selectFirmwareIdentity);

  return (
    <ConnectionPopover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen} anchorRef={pillRef}>
      <button
        ref={pillRef}
        type="button"
        className={styles.pill}
        aria-haspopup={POPUP_KIND_DIALOG}
        aria-expanded={isPopoverOpen}
      >
        <span className={[styles.dot, styles[connectionStatus]].join(' ')} aria-hidden="true" />
        <span className={styles.status}>{t(CONNECTION_PILL_STATUS_LABEL_KEY[connectionStatus])}</span>
        {isConnected && firmwareIdentity && (
          <span className={styles.firmware}>
            {t(DEFAULT.CONNECTION_PILL_FIRMWARE, {
              firmwareName: firmwareIdentity.firmwareName,
              version: firmwareIdentity.version,
            })}
          </span>
        )}
        <span className={styles.port}>{getSelectedPortLabel(selectedPortId, availablePorts, t)}</span>
        <span className={getIndicatorClassName(isOnline)}>{t(getOnlineLabelKey(isOnline))}</span>
        {!isWebSerialSupported && (
          <span className={getIndicatorClassName(isWebSerialSupported)}>
            {t(DEFAULT.CONNECTION_PILL_WEB_SERIAL_UNSUPPORTED)}
          </span>
        )}
      </button>
    </ConnectionPopover>
  );
};
