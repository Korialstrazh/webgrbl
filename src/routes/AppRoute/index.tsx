/**
 * Top-level page of the app: the header with the browser status and the connection controls, and the workspace with
 * the machine status, control buttons and console.
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
import { ConnectBar } from '../../containers/ConnectBar';
import { ConsolePanel } from '../../containers/ConsolePanel';
import { LeavePageGuard } from '../../containers/LeavePageGuard';
import { MachineControlButtons } from '../../containers/MachineControlButtons';
import { MachineStatusPanel } from '../../containers/MachineStatusPanel';
import { ToastStack } from '../../containers/ToastStack';
import { DEFAULT } from '../../utils/localization/default.locales';
import styles from './styles.module.scss';

export const AppRoute = (): ReactNode => {
  const { t } = useTranslation();

  return (
    <div className={styles.appRoute}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>{t(DEFAULT.APP_TITLE)}</h1>
          <p className={styles.tagline}>{t(DEFAULT.APP_TAGLINE)}</p>
        </div>
        <BrowserStatusBar />
        <ConnectBar />
      </header>
      <main className={styles.workspace}>
        <MachineStatusPanel />
        <MachineControlButtons />
        <ConsolePanel />
      </main>
      <ToastStack />
      <AppUpdatePrompt />
      <LeavePageGuard />
    </div>
  );
};
