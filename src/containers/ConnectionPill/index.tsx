/**
 * The laser connection in the top bar: the connection state, the firmware, the active machine profile, the port and,
 * when the browser has no Web Serial, a note. While no laser is connected it ends in a Connect verb: with a port
 * already chosen that verb is its own button joined to the pill and connects in one click; with none it is part of the
 * pill. Clicking the pill opens and closes the connection popover, which the Status card can open as well. The
 * browser's network state is not shown here: it is not the laser's state (the status strip shows it while offline).
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { ApiOutlined, DownOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import type { GrblConnectionStatus } from '../../utils/grbl/grbl.constants';
import type { GrblFirmwareIdentity } from '../../utils/grbl/interfaces/GrblFirmwareIdentity';
import type { SerialPortDescriptor } from '../../utils/grbl/interfaces/SerialPortDescriptor';
import { useConnectLaser } from '../../utils/hooks/use.connect.laser';
import { usePopoverAutoClose } from '../../utils/hooks/use.popover.auto.close';
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
import { CONNECTION_PILL_SHORT_STATUS_LABEL_KEY, CONNECTION_PILL_STATUS_LABEL_KEY } from './connection.pill.constants';
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
  const connectLaser: () => void = useConnectLaser();
  const isConnectVerbShown: boolean = isConnectOffered(connectionStatus);
  // A chosen port lets the verb connect at once, so it leaves the pill for a button of its own.
  const isOneClickConnect: boolean = isConnectVerbShown && Boolean(selectedPortId);
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

  usePopoverAutoClose(isPopoverOpen, () => changePopoverOpen(false));

  const connectVerbContent: ReactNode = (
    <>
      <ApiOutlined aria-hidden="true" />
      {` ${t(DEFAULT.CONNECTION_CONNECT_MENU)}`}
    </>
  );
  const pillClassName: string = [
    styles.pill,
    isConnectVerbShown ? styles.connectOffered : undefined,
    isOneClickConnect ? styles.joined : undefined,
  ].filter(Boolean).join(' ');

  return (
    <span className={styles.pillGroup}>
      <ConnectionPopover isOpen={isPopoverOpen} onOpenChange={changePopoverOpen} anchorRef={pillRef}>
        <Button
          ref={pillRef}
          className={pillClassName}
          aria-haspopup={POPUP_KIND_DIALOG}
          aria-expanded={isPopoverOpen}
          aria-label={t(DEFAULT.CONNECTION_PILL_LABEL, { details: ariaLabelDetails })}
        >
          <span className={[styles.dot, styles[connectionStatus]].join(' ')} aria-hidden="true" />
          <span className={styles.status}>{statusText}</span>
          {/* The button's label already names the state; this is its one-word look for a narrow window. */}
          {isConnectVerbShown && (
            <span className={styles.shortStatus} aria-hidden="true">
              {/* A plug, so the narrow word never reads like the Laser off chip beside it. */}
              <ApiOutlined />
              {t(CONNECTION_PILL_SHORT_STATUS_LABEL_KEY[connectionStatus])}
            </span>
          )}
          {firmwareText && <span className={styles.firmware}>{firmwareText}</span>}
          {/* The profile has its own top-bar button and the popover names the port, so once connected the pill keeps to
              state and firmware and stays narrow; both are still in its label. "No port chosen" beside "Not connected"
              says nothing new, so only a chosen port is shown. */}
          {selectedPortId && !isConnected && <span className={styles.port}>{portText}</span>}
          {!isWebSerialSupported && (
            <span className={styles.warningNote}>{t(DEFAULT.CONNECTION_PILL_WEB_SERIAL_UNSUPPORTED)}</span>
          )}
          {isConnectVerbShown && !isOneClickConnect && (
            <span className={styles.connectVerb}>{connectVerbContent}</span>
          )}
          <DownOutlined className={styles.caret} aria-hidden="true" />
        </Button>
      </ConnectionPopover>
      {isOneClickConnect && (
        <Button className={styles.connectButton} onClick={connectLaser}>
          {connectVerbContent}
        </Button>
      )}
    </span>
  );
};
