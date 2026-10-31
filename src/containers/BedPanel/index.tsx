/**
 * The central region that will show the work bed.
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
import styles from './styles.module.scss';

export const BedPanel = (): ReactNode => {
  const { t } = useTranslation();

  return (
    <main className={styles.bedPanel}>
      <h2 className={styles.title}>{t(DEFAULT.BED_PANEL_TITLE)}</h2>
    </main>
  );
};
