/**
 * Tells the user when the app is cached for offline use and offers a reload when a new version is ready. The
 * update never applies on its own, because reloading the page during a job would cut off the laser stream.
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
import { useRegisterSW } from 'virtual:pwa-register/react';
import { DEFAULT } from '../../utils/localization/default.locales';
import styles from './styles.module.scss';

export const AppUpdatePrompt = (): ReactNode => {
  const { t } = useTranslation();
  const {
    offlineReady: [isOfflineReady, setIsOfflineReady],
    needRefresh: [isRefreshNeeded, setIsRefreshNeeded],
    updateServiceWorker,
  } = useRegisterSW();

  const dismissUpdatePrompt = (): void => {
    setIsOfflineReady(false);
    setIsRefreshNeeded(false);
  };

  const reloadWithNewVersion = async (): Promise<void> => {
    await updateServiceWorker(true);
  };

  if (!isOfflineReady && !isRefreshNeeded) {
    return null;
  }

  return (
    <div className={styles.appUpdatePrompt} role="alert">
      <span>{t(isRefreshNeeded ? DEFAULT.APP_UPDATE_NEED_REFRESH : DEFAULT.APP_UPDATE_OFFLINE_READY)}</span>
      {isRefreshNeeded && <button type="button" onClick={reloadWithNewVersion}>{t(DEFAULT.APP_UPDATE_RELOAD)}</button>}
      <button type="button" onClick={dismissUpdatePrompt}>{t(DEFAULT.APP_UPDATE_DISMISS)}</button>
    </div>
  );
};
