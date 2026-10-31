/**
 * The top region: app title, browser status and connection controls.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT } from '../../utils/localization/default.locales';
import { AppUpdatePrompt } from '../AppUpdatePrompt';
import { BrowserStatusBar } from '../BrowserStatusBar';
import { ConnectBar } from '../ConnectBar';
import styles from './styles.module.scss';

export const TopBar = (): ReactNode => {
  const { t } = useTranslation();

  return (
    <header className={styles.topBar}>
      <div className={styles.heading}>
        <h1 className={styles.title}>{t(DEFAULT.APP_TITLE)}</h1>
        <p className={styles.tagline}>{t(DEFAULT.APP_TAGLINE)}</p>
      </div>
      <BrowserStatusBar />
      <ConnectBar />
      <AppUpdatePrompt />
    </header>
  );
};
