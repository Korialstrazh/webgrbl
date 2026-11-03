/**
 * Port, baud rate and connect controls of the laser connection, shown in an antd popover under its anchor (the
 * connection pill). Opening moves focus into the popover; closing it while focus is inside returns focus to the opener.
 * It closes by itself once a connect it started succeeds; a failed connect keeps it open with the reason.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Popover, Select } from 'antd';
import type { SelectProps } from 'antd';
import { useEffect, useId, useRef } from 'react';
import type { ReactElement, ReactNode, RefObject } from 'react';
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
  selectConnectFailureKey,
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
  /** The same control as a ref: focus returns to it when the popover closes with focus inside. */
  anchorRef: RefObject<HTMLElement | null>;
}

// antd Select takes focus on its combobox input.
const FOCUSABLE_CONTROL_SELECTOR = 'button:not([disabled]), input[role="combobox"]:not([disabled])';

const isFocusInsideElement = (element: HTMLElement | null): boolean =>
  !!element && element.contains(document.activeElement);

const focusFirstPopoverControl = (contentElement: HTMLElement | null): void => {
  const firstControl: HTMLElement | null | undefined =
    contentElement?.querySelector<HTMLElement>(FOCUSABLE_CONTROL_SELECTOR);

  // The popover is positioned absolutely in the body, so focusing it must not scroll the fixed workbench.
  (firstControl ?? contentElement)?.focus({ preventScroll: true });
};

/** A laser can always be disconnected; connecting needs a chosen port. */
const canToggleConnection = (isConnected: boolean, selectedPortId: string): boolean =>
  isConnected || Boolean(selectedPortId);

const getConnectButtonKey = (isConnected: boolean, isConnecting: boolean): string => {
  if (isConnecting) {
    return DEFAULT.CONNECTION_POPOVER_CONNECTING;
  }

  return isConnected ? DEFAULT.CONNECTION_POPOVER_DISCONNECT : DEFAULT.CONNECTION_POPOVER_CONNECT;
};

export const ConnectionPopover = ({ isOpen, onOpenChange, children, anchorRef }: ConnectionPopoverProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const connectionStatus: GrblConnectionStatus = useSelector(selectConnectionStatus);
  const isConnected: boolean = useSelector(selectIsConnected);
  const isWebSerialSupported: boolean = useSelector(selectIsWebSerialSupported);
  const availablePorts: SerialPortDescriptor[] = useSelector(selectAvailablePorts);
  const selectedPortId: string = useSelector(selectSelectedPortId);
  const baudRate: number = useSelector(selectBaudRate);
  const connectFailureKey: string | undefined = useSelector(selectConnectFailureKey);
  const isConnecting: boolean = connectionStatus === GRBL_CONNECTION_STATUS.CONNECTING;
  const isLinkLocked: boolean = isConnected || isConnecting;
  const contentRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);
  const wasConnectingRef: RefObject<boolean> = useRef<boolean>(isConnecting);
  const portSelectId: string = useId();
  const baudSelectId: string = useId();
  const portOptions: SelectProps<string>['options'] = [
    { value: SIMULATED_LASER_PORT_ID, label: t(DEFAULT.CONNECTION_POPOVER_SIMULATED_LASER) },
    ...availablePorts.map((port: SerialPortDescriptor) => ({ value: port.portId, label: getPortOptionLabel(port, t) })),
  ];
  const baudOptions: SelectProps<number>['options'] = GRBL_BAUD_RATES.map((rate: number) => ({
    value: rate,
    label: String(rate),
  }));

  useOverlayRegistration(CONNECTION_POPOVER_OVERLAY_ID, isOpen);

  const handleOpenChange = (isNextOpen: boolean): void => {
    // antd hides the popover without moving focus, which would leave keyboard users on the page body.
    if (!isNextOpen && isFocusInsideElement(contentRef.current)) {
      anchorRef.current?.focus();
    }

    onOpenChange(isNextOpen);
  };

  // Only the step from connecting to connected: opened later, while connected, it stays open for Disconnect.
  useEffect(() => {
    const hasJustConnected: boolean = wasConnectingRef.current && isConnected;

    wasConnectingRef.current = isConnecting;

    if (hasJustConnected && isFocusInsideElement(contentRef.current)) {
      anchorRef.current?.focus();
    }

    if (hasJustConnected) {
      onOpenChange(false);
    }
  }, [anchorRef, isConnected, isConnecting, onOpenChange]);

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
      {/* Plain labels: antd has no standalone label component outside Form, which this popover does not use. */}
      <div className={styles.field}>
        <label htmlFor={portSelectId}>{t(DEFAULT.CONNECTION_POPOVER_PORT)}</label>
        <Select<string>
          id={portSelectId}
          className={styles.select}
          value={selectedPortId || undefined}
          placeholder={t(DEFAULT.CONNECTION_NO_PORT_CHOSEN)}
          options={portOptions}
          disabled={isLinkLocked}
          virtual={false}
          onChange={(portId: string) => dispatch(new SerialPortSelected({ portId }))}
        />
      </div>
      <Button
        disabled={!isWebSerialSupported || isLinkLocked}
        onClick={() => dispatch(new SerialPortPickerRequested())}
      >
        {t(DEFAULT.CONNECTION_POPOVER_CHOOSE_PORT)}
      </Button>
      {!isWebSerialSupported && (
        <p className={styles.unsupportedNotice}>{t(DEFAULT.CONNECTION_POPOVER_WEB_SERIAL_UNSUPPORTED)}</p>
      )}
      <div className={styles.field}>
        <label htmlFor={baudSelectId}>{t(DEFAULT.CONNECTION_POPOVER_BAUD)}</label>
        <Select<number>
          id={baudSelectId}
          className={styles.select}
          value={baudRate}
          options={baudOptions}
          disabled={isLinkLocked}
          virtual={false}
          onChange={(nextBaudRate: number) => dispatch(new BaudRateSelected({ baudRate: nextBaudRate }))}
        />
      </div>
      <Button
        type={isConnected ? ANTD_BUTTON_TYPE_DEFAULT : ANTD_BUTTON_TYPE_PRIMARY}
        disabled={isConnecting || !canToggleConnection(isConnected, selectedPortId)}
        onClick={toggleConnection}
      >
        {t(getConnectButtonKey(isConnected, isConnecting))}
      </Button>
      {connectFailureKey && <p className={styles.failureNotice} role="alert">{t(connectFailureKey)}</p>}
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
