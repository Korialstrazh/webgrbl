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
import { AppUpdatePrompt } from '../../containers/AppUpdatePrompt';
import { BrowserStatusBar } from '../../containers/BrowserStatusBar';
import styles from './styles.module.scss';

const APP_TITLE = 'webgrbl';
const APP_TAGLINE = 'GRBL laser control in your browser - works offline.';

export const AppRoute = (): ReactNode => (
  <div className={styles.appRoute}>
    <header className={styles.header}>
      <h1 className={styles.title}>{APP_TITLE}</h1>
      <BrowserStatusBar />
    </header>
    <main className={styles.workspace}>
      <p>{APP_TAGLINE}</p>
    </main>
    <AppUpdatePrompt />
  </div>
);
