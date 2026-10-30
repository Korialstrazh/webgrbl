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
import { useRegisterSW } from 'virtual:pwa-register/react';
import styles from './styles.module.scss';

const OFFLINE_READY_MESSAGE = 'webgrbl is ready to work offline.';
const NEED_REFRESH_MESSAGE = 'A new version of webgrbl is available.';
const RELOAD_LABEL = 'Reload';
const DISMISS_LABEL = 'Dismiss';

export const AppUpdatePrompt = (): ReactNode => {
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
      <span>{isRefreshNeeded ? NEED_REFRESH_MESSAGE : OFFLINE_READY_MESSAGE}</span>
      {isRefreshNeeded && <button type="button" onClick={reloadWithNewVersion}>{RELOAD_LABEL}</button>}
      <button type="button" onClick={dismissUpdatePrompt}>{DISMISS_LABEL}</button>
    </div>
  );
};
