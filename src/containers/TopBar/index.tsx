/**
 * The top region: app name, project placeholder, the machine profiles dialog, SVG import, undo and redo, menus that are
 * not built yet, the connection pill and update notice.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Layout } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_LARGE, ANTD_BUTTON_TYPE_TEXT } from '../../utils/antd.constants';
import { REDO_ARROW, UNDO_ARROW } from '../../utils/characters.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { AppDispatch } from '../../utils/states/new.store';
import { ProjectRedoRequested, ProjectUndoRequested, selectCanRedo, selectCanUndo } from '../../utils/states/project.document.state';
import { ComingSoon } from '../../views/ComingSoon';
import { AppUpdatePrompt } from '../AppUpdatePrompt';
import { ConnectionPill } from '../ConnectionPill';
import { MachineProfilesDialog } from '../MachineProfilesDialog';
import { SvgImportButton } from '../SvgImportButton';
import styles from './styles.module.scss';
import { TOP_BAR_MENU_LABEL_KEYS } from './top.bar.constants';

export const TopBar = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const canUndo: boolean = useSelector(selectCanUndo);
  const canRedo: boolean = useSelector(selectCanRedo);
  const [isProfilesDialogOpen, setIsProfilesDialogOpen] = useState<boolean>(false);

  return (
    <Layout.Header className={[styles.topBar, styles.fixedHeightBar].join(' ')}>
      {/* Plain text elements: antd Typography would add its own margins and colours. */}
      <div className={styles.heading}>
        <h1 className={styles.title}>{t(DEFAULT.APP_TITLE)}</h1>
        <p className={styles.project}>{t(DEFAULT.TOP_BAR_PROJECT_PLACEHOLDER)}</p>
      </div>
      <div className={[styles.group, styles.activeMenus].join(' ')}>
        <Button type={ANTD_BUTTON_TYPE_TEXT} onClick={() => setIsProfilesDialogOpen(true)}>
          {t(DEFAULT.TOP_BAR_MENU_MACHINE_PROFILES)}
        </Button>
        <SvgImportButton buttonType={ANTD_BUTTON_TYPE_TEXT} />
      </div>
      <div className={[styles.group, styles.activeMenus].join(' ')}>
        <Button
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_LARGE}
          icon={UNDO_ARROW}
          aria-label={t(DEFAULT.TOP_BAR_UNDO)}
          disabled={!canUndo}
          onClick={() => dispatch(new ProjectUndoRequested())}
        />
        <Button
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_LARGE}
          icon={REDO_ARROW}
          aria-label={t(DEFAULT.TOP_BAR_REDO)}
          disabled={!canRedo}
          onClick={() => dispatch(new ProjectRedoRequested())}
        />
      </div>
      <div className={styles.comingSoonGroups}>
        <ComingSoon description={t(DEFAULT.TOP_BAR_MENUS_DESCRIPTION)}>
          <div className={styles.group}>
            {TOP_BAR_MENU_LABEL_KEYS.map((menuLabelKey: string) => (
              <Button key={menuLabelKey} type={ANTD_BUTTON_TYPE_TEXT}>{t(menuLabelKey)}</Button>
            ))}
          </div>
        </ComingSoon>
        <ComingSoon description={t(DEFAULT.TOP_BAR_AUTOSAVE_DESCRIPTION)}>
          <p className={styles.autosave}>{t(DEFAULT.TOP_BAR_AUTOSAVE_READOUT)}</p>
        </ComingSoon>
      </div>
      <div className={styles.trailing}>
        <AppUpdatePrompt />
        <ConnectionPill />
      </div>
      <MachineProfilesDialog isOpen={isProfilesDialogOpen} onClose={() => setIsProfilesDialogOpen(false)} />
    </Layout.Header>
  );
};
