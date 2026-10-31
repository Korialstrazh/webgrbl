/**
 * Port, baud rate and connect controls of the laser connection, shown in an antd popover under its anchor (the
 * connection pill). Opening moves focus into the popover; closing it while focus is inside returns focus to the opener.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Popover } from 'antd';
import { useRef } from 'react';
import type { ChangeEvent, ReactElement, ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  ANTD_BUTTON_TYPE_DEFAULT,
  ANTD_BUTTON_TYPE_PRIMARY,
  ANTD_POPOVER_PLACEMENT_BOTTOM_RIGHT,
  ANTD_POPOVER_TRIGGER_CLICK,
} from '../../utils/antd.constants';
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
import { SCRIPT_FOCUS_ONLY_TAB_INDEX } from '../../utils/tab.index.constants';
import { CONNECTION_POPOVER_OVERLAY_ID } from './connection.popover.constants';
import { getPortOptionLabel } from './get.port.option.label';
import styles from './styles.module.scss';

interface ConnectionPopoverProps {
  isOpen: boolean;
  /** Called with the next open state when the anchor is clicked, on a click outside, or on Escape. */
  onOpenChange: (isOpen: boolean) => void;
  /** The control the popover opens from; antd attaches the click handling to it. */
  children: ReactElement;
}

const FOCUSABLE_CONTROL_SELECTOR = 'button:not([disabled]), select:not([disabled])';

const getFocusedHtmlElement = (): HTMLElement | undefined =>
  document.activeElement instanceof HTMLElement ? document.activeElement : undefined;

const isFocusInsideElement = (element: HTMLElement | null): boolean =>
  !!element && element.contains(document.activeElement);

const focusFirstPopoverControl = (contentElement: HTMLElement | null): void => {
  const firstControl: HTMLElement | null | undefined =
    contentElement?.querySelector<HTMLElement>(FOCUSABLE_CONTROL_SELECTOR);

  // The popover is positioned absolutely in the body, so focusing it must not scroll the fixed workbench.
  (firstControl ?? contentElement)?.focus({ preventScroll: true });
};

const getConnectButtonKey = (isConnected: boolean, isConnecting: boolean): string => {
  if (isConnecting) {
    return DEFAULT.CONNECTION_POPOVER_CONNECTING;
  }

  return isConnected ? DEFAULT.CONNECTION_POPOVER_DISCONNECT : DEFAULT.CONNECTION_POPOVER_CONNECT;
};

export const ConnectionPopover = ({ isOpen, onOpenChange, children }: ConnectionPopoverProps): ReactNode => {
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
  const contentRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);
  const openerRef: RefObject<HTMLElement | undefined> = useRef<HTMLElement | undefined>(undefined);

  useOverlayRegistration(CONNECTION_POPOVER_OVERLAY_ID, isOpen);

  const handleOpenChange = (isNextOpen: boolean): void => {
    if (isNextOpen) {
      openerRef.current = getFocusedHtmlElement();
    } else if (isFocusInsideElement(contentRef.current)) {
      // antd hides the popover without moving focus, which would leave keyboard users on the page body.
      openerRef.current?.focus();
    }

    onOpenChange(isNextOpen);
  };

  const handleAfterOpenChange = (isNowOpen: boolean): void => {
    if (isNowOpen) {
      focusFirstPopoverControl(contentRef.current);
    }
  };

  const toggleConnection = (): void => {
    dispatch(isConnected ? new DisconnectRequested() : new ConnectRequested());
  };

  const contentComponent: ReactNode = (
    <div
      ref={contentRef}
      className={styles.connectionPopover}
      role="dialog"
      aria-label={t(DEFAULT.CONNECTION_POPOVER_LABEL)}
      tabIndex={SCRIPT_FOCUS_ONLY_TAB_INDEX}
    >
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
        disabled={!isWebSerialSupported || isLinkLocked}
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
        type={isConnected ? ANTD_BUTTON_TYPE_DEFAULT : ANTD_BUTTON_TYPE_PRIMARY}
        disabled={isConnecting}
        onClick={toggleConnection}
      >
        {t(getConnectButtonKey(isConnected, isConnecting))}
      </Button>
    </div>
  );

  return (
    <Popover
      open={isOpen}
      onOpenChange={handleOpenChange}
      afterOpenChange={handleAfterOpenChange}
      trigger={ANTD_POPOVER_TRIGGER_CLICK}
      placement={ANTD_POPOVER_PLACEMENT_BOTTOM_RIGHT}
      content={contentComponent}
      destroyOnHidden
    >
      {children}
    </Popover>
  );
};
