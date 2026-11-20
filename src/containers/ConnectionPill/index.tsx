/**
 * The laser connection in the top bar: a state icon with a coloured dot, a short state word, the firmware once
 * connected and, when the browser has no Web Serial, a note. The port is never spelled out on the pill; its tooltip,
 * its accessible name and the popover name it. While no laser is connected it ends in a Connect verb: with a port
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
import { ApiOutlined, DisconnectOutlined, DownOutlined, LinkOutlined, SyncOutlined } from '@ant-design/icons';
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
import { DismissibleTooltip } from '../../views/DismissibleTooltip';
import { ConnectionPopover } from '../ConnectionPopover';
import { CONNECTION_PILL_SHORT_STATUS_LABEL_KEY, CONNECTION_PILL_STATUS_LABEL_KEY } from './connection.pill.constants';
import { getSelectedPortLabel } from './get.selected.port.label';
import styles from './styles.module.scss';

const POPUP_KIND_DIALOG = 'dialog';
const ARIA_LABEL_PART_SEPARATOR = ', ';

/** Whether the pill offers the Connect verb: no laser is connected and no connection is being made. */
const isConnectOffered = (connectionStatus: GrblConnectionStatus): boolean =>
  connectionStatus === GRBL_CONNECTION_STATUS.DISCONNECTED || connectionStatus === GRBL_CONNECTION_STATUS.LOST;

/** The state icon the dot sits on, so the state reads without its word at phone width. */
const getConnectionStatusIconComponent = (connectionStatus: GrblConnectionStatus): ReactNode => {
  if (connectionStatus === GRBL_CONNECTION_STATUS.CONNECTED) {
    return <LinkOutlined />;
  }

  return connectionStatus === GRBL_CONNECTION_STATUS.CONNECTING ? <SyncOutlined spin /> : <DisconnectOutlined />;
};

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
  const shortStatusText: string = t(CONNECTION_PILL_SHORT_STATUS_LABEL_KEY[connectionStatus]);
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
      <span className={styles.connectWord}>{t(DEFAULT.CONNECTION_CONNECT_MENU)}</span>
    </>
  );
  const pillClassName: string = [
    styles.pill,
    isConnectVerbShown ? styles.connectOffered : undefined,
    isOneClickConnect ? styles.joined : undefined,
  ].filter(Boolean).join(' ');

  return (
    // The pill already shows the state, so its tooltip names only the port, on one line.
    <DismissibleTooltip title={portText} rootClassName={styles.portTooltip}>
      <span className={styles.pillGroup}>
        <ConnectionPopover isOpen={isPopoverOpen} onOpenChange={changePopoverOpen} anchorRef={pillRef}>
          <Button
            ref={pillRef}
            className={pillClassName}
            aria-haspopup={POPUP_KIND_DIALOG}
            aria-expanded={isPopoverOpen}
            aria-label={t(DEFAULT.CONNECTION_PILL_LABEL, { details: ariaLabelDetails })}
          >
            <span className={[styles.statusIcon, styles[connectionStatus]].join(' ')} aria-hidden="true">
              {getConnectionStatusIconComponent(connectionStatus)}
              <span className={styles.dot} />
            </span>
            {/* The button's label names the state in full; the pill shows the one-word look. */}
            <span className={styles.status} aria-hidden="true">{shortStatusText}</span>
            {firmwareText && <span className={styles.firmware}>{firmwareText}</span>}
            {!isWebSerialSupported && (
              <span className={styles.warningNote}>{t(DEFAULT.CONNECTION_PILL_WEB_SERIAL_UNSUPPORTED)}</span>
            )}
            {/* The status part stays quiet: its chevron shows only under the pointer or the focus. */}
            <DownOutlined className={styles.caret} aria-hidden="true" />
            {isConnectVerbShown && !isOneClickConnect && (
              <span className={styles.connectVerb}>{connectVerbContent}</span>
            )}
          </Button>
        </ConnectionPopover>
        {isOneClickConnect && (
          // The icon prop gives the plug the same gap to the word as every other icon and label button.
          <Button className={styles.connectButton} icon={<ApiOutlined aria-hidden="true" />} onClick={connectLaser}>
            <span className={styles.connectWord}>{t(DEFAULT.CONNECTION_CONNECT_MENU)}</span>
          </Button>
        )}
      </span>
    </DismissibleTooltip>
  );
};
