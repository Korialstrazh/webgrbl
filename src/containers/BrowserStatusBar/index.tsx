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
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectIsOnline, selectIsWebSerialSupported } from '../../utils/states/browser.environment.state';
import styles from './styles.module.scss';

const getStatusClassName = (isPositive: boolean): string =>
  [styles.status, isPositive ? styles.positive : styles.negative].join(' ');

const getOnlineStatusKey = (isOnline: boolean): string =>
  isOnline ? DEFAULT.BROWSER_STATUS_ONLINE : DEFAULT.BROWSER_STATUS_OFFLINE;

const getWebSerialStatusKey = (isWebSerialSupported: boolean): string =>
  isWebSerialSupported ? DEFAULT.BROWSER_STATUS_WEB_SERIAL_SUPPORTED : DEFAULT.BROWSER_STATUS_WEB_SERIAL_UNSUPPORTED;

export const BrowserStatusBar = (): ReactNode => {
  const { t } = useTranslation();
  const isOnline: boolean = useSelector(selectIsOnline);
  const isWebSerialSupported: boolean = useSelector(selectIsWebSerialSupported);

  return (
    <div className={styles.browserStatusBar} role="status">
      <span className={getStatusClassName(isOnline)}>{t(getOnlineStatusKey(isOnline))}</span>
      <span className={getStatusClassName(isWebSerialSupported)}>{t(getWebSerialStatusKey(isWebSerialSupported))}</span>
    </div>
  );
};
