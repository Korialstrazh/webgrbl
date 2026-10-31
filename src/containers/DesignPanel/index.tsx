/**
 * The left region that will hold the design tools.
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

export const DesignPanel = (): ReactNode => {
  const { t } = useTranslation();

  return (
    <aside className={styles.designPanel} aria-label={t(DEFAULT.DESIGN_PANEL_TITLE)}>
      <h2 className={styles.title}>{t(DEFAULT.DESIGN_PANEL_TITLE)}</h2>
    </aside>
  );
};
