/**
 * Shows whether the browser is online and whether it can talk to a laser controller over Web Serial.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { selectIsOnline, selectIsWebSerialSupported } from '../../utils/states/browser.environment.state';
import styles from './styles.module.scss';

const ONLINE_LABEL = 'Online';
const OFFLINE_LABEL = 'Offline';
const WEB_SERIAL_SUPPORTED_LABEL = 'Web Serial ready';
const WEB_SERIAL_UNSUPPORTED_LABEL = 'Web Serial unavailable - use Chrome or Edge on desktop';

const getStatusClassName = (isPositive: boolean): string =>
  [styles.status, isPositive ? styles.positive : styles.negative].join(' ');

export const BrowserStatusBar = (): ReactNode => {
  const isOnline: boolean = useSelector(selectIsOnline);
  const isWebSerialSupported: boolean = useSelector(selectIsWebSerialSupported);

  return (
    <div className={styles.browserStatusBar} role="status">
      <span className={getStatusClassName(isOnline)}>{isOnline ? ONLINE_LABEL : OFFLINE_LABEL}</span>
      <span className={getStatusClassName(isWebSerialSupported)}>
        {isWebSerialSupported ? WEB_SERIAL_SUPPORTED_LABEL : WEB_SERIAL_UNSUPPORTED_LABEL}
      </span>
    </div>
  );
};
