/**
 * Top-level page of the app: the header with the browser status and a workspace placeholder until the UI
 * brainstorm defines the real layout.
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
import { AppUpdatePrompt } from '../../containers/AppUpdatePrompt';
import { BrowserStatusBar } from '../../containers/BrowserStatusBar';
import { DEFAULT } from '../../utils/localization/default.locales';
import styles from './styles.module.scss';

export const AppRoute = (): ReactNode => {
  const { t } = useTranslation();

  return (
    <div className={styles.appRoute}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t(DEFAULT.APP_TITLE)}</h1>
        <BrowserStatusBar />
      </header>
      <main className={styles.workspace}>
        <p>{t(DEFAULT.APP_TAGLINE)}</p>
      </main>
      <AppUpdatePrompt />
    </div>
  );
};
