/**
 * The laser connection in the top bar: the connection state, the firmware, the active machine profile, the port and,
 * when the browser has no Web Serial, a note. While no laser is connected it ends in a Connect verb. Clicking it opens
 * and closes the connection popover, which the Status card can open as well. The browser's network state is not shown
 * here: it is not the laser's state (the status strip shows it while offline).
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ApiOutlined, DownOutlined } from '@ant-design/icons';
import { useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import type { GrblConnectionStatus } from '../../utils/grbl/grbl.constants';
import type { GrblFirmwareIdentity } from '../../utils/grbl/interfaces/GrblFirmwareIdentity';
import type { SerialPortDescriptor } from '../../utils/grbl/interfaces/SerialPortDescriptor';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { selectIsWebSerialSupported } from '../../utils/states/browser.environment.state';
import {
  selectAvailablePorts,
  selectConnectionStatus,
  selectFirmwareIdentity,
  selectIsConnected,
  selectSelectedPortId,
} from '../../utils/states/grbl.connection.state';
import { selectActiveMachineProfile } from '../../utils/states/machine.profile.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { ConnectionPopoverOpenChanged, selectIsConnectionPopoverOpen } from '../../utils/states/ui.overlay.state';
import { ConnectionPopover } from '../ConnectionPopover';
import { CONNECTION_PILL_STATUS_LABEL_KEY } from './connection.pill.constants';
import { getSelectedPortLabel } from './get.selected.port.label';
import styles from './styles.module.scss';

const POPUP_KIND_DIALOG = 'dialog';
const ARIA_LABEL_PART_SEPARATOR = ', ';

/** Whether the pill offers the Connect verb: no laser is connected and no connection is being made. */
const isConnectOffered = (connectionStatus: GrblConnectionStatus): boolean =>
  connectionStatus === GRBL_CONNECTION_STATUS.DISCONNECTED || connectionStatus === GRBL_CONNECTION_STATUS.LOST;

export const ConnectionPill = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isPopoverOpen: boolean = useSelector(selectIsConnectionPopoverOpen);
  const pillRef: RefObject<HTMLButtonElement | null> = useRef<HTMLButtonElement | null>(null);
  const connectionStatus: GrblConnectionStatus = useSelector(selectConnectionStatus);
  const isConnected: boolean = useSelector(selectIsConnected);
  const isWebSerialSupported: boolean = useSelector(selectIsWebSerialSupported);
  const availablePorts: SerialPortDescriptor[] = useSelector(selectAvailablePorts);
  const selectedPortId: string = useSelector(selectSelectedPortId);
  const firmwareIdentity: GrblFirmwareIdentity | undefined = useSelector(selectFirmwareIdentity);
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const statusText: string = t(CONNECTION_PILL_STATUS_LABEL_KEY[connectionStatus]);
  const firmwareText: string | undefined = isConnected && firmwareIdentity
    ? t(DEFAULT.CONNECTION_PILL_FIRMWARE, {
      firmwareName: firmwareIdentity.firmwareName,
      version: firmwareIdentity.version,
    })
    : undefined;
  const portText: string = getSelectedPortLabel(selectedPortId, availablePorts, t);
  const ariaLabelDetails: string = [statusText, firmwareText, activeProfile?.name, portText]
    .filter(Boolean)
    .join(ARIA_LABEL_PART_SEPARATOR);

  const changePopoverOpen = (isOpen: boolean): void => {
    dispatch(new ConnectionPopoverOpenChanged({ isConnectionPopoverOpen: isOpen }));
  };

  return (
    <ConnectionPopover isOpen={isPopoverOpen} onOpenChange={changePopoverOpen} anchorRef={pillRef}>
      {/* A raw button: the pill is a custom status chip and antd Button would restyle its inner parts. */}
      <button
        ref={pillRef}
        type="button"
        className={styles.pill}
        aria-haspopup={POPUP_KIND_DIALOG}
        aria-expanded={isPopoverOpen}
        aria-label={t(DEFAULT.CONNECTION_PILL_LABEL, { details: ariaLabelDetails })}
      >
        <span className={[styles.dot, styles[connectionStatus]].join(' ')} aria-hidden="true" />
        <span className={styles.status}>{statusText}</span>
        {firmwareText && <span className={styles.firmware}>{firmwareText}</span>}
        {activeProfile && <span className={styles.profile}>{activeProfile.name}</span>}
        <span className={styles.port}>{portText}</span>
        {!isWebSerialSupported && (
          <span className={styles.warningNote}>{t(DEFAULT.CONNECTION_PILL_WEB_SERIAL_UNSUPPORTED)}</span>
        )}
        {isConnectOffered(connectionStatus) && (
          <span className={styles.connectVerb}>
            <ApiOutlined aria-hidden="true" />
            {` ${t(DEFAULT.CONNECTION_CONNECT_MENU)}`}
          </span>
        )}
        <DownOutlined className={styles.caret} aria-hidden="true" />
      </button>
    </ConnectionPopover>
  );
};
