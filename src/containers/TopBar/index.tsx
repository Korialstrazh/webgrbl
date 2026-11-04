/**
 * The top region: app name, the project name, the Project menu and autosave readout, the machine profiles and material
 * library dialogs, SVG import, undo and redo, the connection pill and update notice.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ImportOutlined, RedoOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Layout } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_LARGE, ANTD_BUTTON_TYPE_TEXT } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { AppDispatch } from '../../utils/states/new.store';
import { ProjectRedoRequested, ProjectUndoRequested, selectCanRedo, selectCanUndo } from '../../utils/states/project.document.state';
import { AppUpdatePrompt } from '../AppUpdatePrompt';
import { ConnectionPill } from '../ConnectionPill';
import { MachineProfilesDialog } from '../MachineProfilesDialog';
import { MaterialLibraryDialog } from '../MaterialLibraryDialog';
import { SvgImportButton } from '../SvgImportButton';
import { AutosaveReadout } from './AutosaveReadout';
import { ProjectMenu } from './ProjectMenu';
import { ProjectNameButton } from './ProjectNameButton';
import { TopBarOverflowMenu } from './TopBarOverflowMenu';
import styles from './styles.module.scss';

export const TopBar = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const canUndo: boolean = useSelector(selectCanUndo);
  const canRedo: boolean = useSelector(selectCanRedo);
  const [isProfilesDialogOpen, setIsProfilesDialogOpen] = useState<boolean>(false);
  const [isMaterialLibraryOpen, setIsMaterialLibraryOpen] = useState<boolean>(false);

  return (
    <Layout.Header className={[styles.topBar, styles.fixedHeightBar].join(' ')}>
      {/* Plain text elements: antd Typography would add its own margins and colours. */}
      <div className={styles.heading}>
        <h1 className={styles.title}>{t(DEFAULT.APP_TITLE)}</h1>
        <ProjectNameButton />
      </div>
      <div className={[styles.group, styles.activeMenus].join(' ')}>
        <ProjectMenu />
        <AutosaveReadout />
        <Button
          className={styles.secondaryItem}
          type={ANTD_BUTTON_TYPE_TEXT}
          onClick={() => setIsProfilesDialogOpen(true)}
        >
          {t(DEFAULT.TOP_BAR_MENU_MACHINE_PROFILES)}
        </Button>
        <Button
          className={styles.secondaryItem}
          type={ANTD_BUTTON_TYPE_TEXT}
          onClick={() => setIsMaterialLibraryOpen(true)}
        >
          {t(DEFAULT.TOP_BAR_MENU_MATERIALS)}
        </Button>
        <SvgImportButton iconComponent={<ImportOutlined />} labelClassName={styles.compactHiddenLabel} />
      </div>
      <div className={[styles.group, styles.activeMenus].join(' ')}>
        <Button
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_LARGE}
          icon={<UndoOutlined />}
          aria-label={t(DEFAULT.TOP_BAR_UNDO)}
          disabled={!canUndo}
          onClick={() => dispatch(new ProjectUndoRequested())}
        />
        <Button
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_LARGE}
          icon={<RedoOutlined />}
          aria-label={t(DEFAULT.TOP_BAR_REDO)}
          disabled={!canRedo}
          onClick={() => dispatch(new ProjectRedoRequested())}
        />
        <TopBarOverflowMenu
          onOpenMachineProfiles={() => setIsProfilesDialogOpen(true)}
          onOpenMaterials={() => setIsMaterialLibraryOpen(true)}
        />
      </div>
      <div className={styles.trailing}>
        <AppUpdatePrompt />
        <ConnectionPill />
      </div>
      <MachineProfilesDialog isOpen={isProfilesDialogOpen} onClose={() => setIsProfilesDialogOpen(false)} />
      <MaterialLibraryDialog isOpen={isMaterialLibraryOpen} onClose={() => setIsMaterialLibraryOpen(false)} />
    </Layout.Header>
  );
};
