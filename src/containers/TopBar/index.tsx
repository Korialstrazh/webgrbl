/**
 * The top region: app name, project placeholder, menus that are not built yet, the connection pill and update notice.
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
import { REDO_ARROW, UNDO_ARROW } from '../../utils/characters.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { BUTTON_VARIANT } from '../../views/Button/button.constants';
import { Button } from '../../views/Button';
import { ComingSoon } from '../../views/ComingSoon';
import { IconButton } from '../../views/IconButton';
import { AppUpdatePrompt } from '../AppUpdatePrompt';
import { ConnectionPill } from '../ConnectionPill';
import styles from './styles.module.scss';
import { TOP_BAR_MENU_LABEL_KEYS } from './top.bar.constants';

export const TopBar = (): ReactNode => {
  const { t } = useTranslation();

  return (
    <header className={styles.topBar}>
      <div className={styles.heading}>
        <h1 className={styles.title}>{t(DEFAULT.APP_TITLE)}</h1>
        <p className={styles.project}>{t(DEFAULT.TOP_BAR_PROJECT_PLACEHOLDER)}</p>
      </div>
      <ComingSoon description={t(DEFAULT.TOP_BAR_MENUS_DESCRIPTION)}>
        <div className={styles.group}>
          {TOP_BAR_MENU_LABEL_KEYS.map((menuLabelKey: string) => (
            <Button key={menuLabelKey} variant={BUTTON_VARIANT.GHOST}>{t(menuLabelKey)}</Button>
          ))}
        </div>
      </ComingSoon>
      <ComingSoon description={t(DEFAULT.TOP_BAR_HISTORY_DESCRIPTION)}>
        <div className={styles.group}>
          <IconButton label={t(DEFAULT.TOP_BAR_UNDO)} iconComponent={UNDO_ARROW} />
          <IconButton label={t(DEFAULT.TOP_BAR_REDO)} iconComponent={REDO_ARROW} />
        </div>
      </ComingSoon>
      <ComingSoon description={t(DEFAULT.TOP_BAR_AUTOSAVE_DESCRIPTION)}>
        <p className={styles.autosave}>{t(DEFAULT.TOP_BAR_AUTOSAVE_READOUT)}</p>
      </ComingSoon>
      <div className={styles.trailing}>
        <AppUpdatePrompt />
        <ConnectionPill />
      </div>
    </header>
  );
};
