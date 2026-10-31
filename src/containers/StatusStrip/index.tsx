/**
 * The bottom region for the console and job status.
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
import { ConsolePanel } from '../ConsolePanel';
import styles from './styles.module.scss';

export const StatusStrip = (): ReactNode => {
  const { t } = useTranslation();

  return (
    <footer className={styles.statusStrip}>
      <h2 className={styles.title}>{t(DEFAULT.STATUS_STRIP_TITLE)}</h2>
      <ConsolePanel />
    </footer>
  );
};
