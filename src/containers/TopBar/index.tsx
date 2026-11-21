/**
 * The top region: app name and version, the project name, the Project menu and autosave readout, the machine profiles
 * dialog, SVG import, undo and redo, the connection pill and update notice. The material library opens from the
 * Material panel.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DownOutlined, FileAddOutlined } from '@ant-design/icons';
import { Button, Layout } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { APP_VERSION } from '../../utils/app.version.constants';
import { ANTD_BUTTON_TYPE_TEXT } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { selectActiveMachineProfile } from '../../utils/states/machine.profile.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { ProjectRedoRequested, ProjectUndoRequested, selectCanRedo, selectCanUndo } from '../../utils/states/project.document.state';
import { MachineProfilesDialogOpenChanged, selectIsMachineProfilesDialogOpen } from '../../utils/states/ui.workbench.state';
import { DismissibleTooltip } from '../../views/DismissibleTooltip';
import { IconActionButton } from '../../views/IconActionButton';
import { LaserMachineIcon } from '../../views/LaserMachineIcon';
import { RedoArrowIcon } from '../../views/RedoArrowIcon';
import { UndoArrowIcon } from '../../views/UndoArrowIcon';
import { AppUpdatePrompt } from '../AppUpdatePrompt';
import { ConnectionPill } from '../ConnectionPill';
import { LaserStateChip } from '../LaserStateChip';
import { MachineProfilesDialog } from '../MachineProfilesDialog';
import { SvgImportButton } from '../SvgImportButton';
import { AutosaveReadout } from './AutosaveReadout';
import { ProjectMenu } from './ProjectMenu';
import { TOP_BAR_IMPORT_SVG_BUTTON_ID } from './ProjectMenu/project.menu.constants';
import { ProjectNameButton } from './ProjectNameButton';
import styles from './styles.module.scss';

export const TopBar = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const canUndo: boolean = useSelector(selectCanUndo);
  const canRedo: boolean = useSelector(selectCanRedo);
  const isProfilesDialogOpen: boolean = useSelector(selectIsMachineProfilesDialogOpen);

  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const profilesLabel: string = t(DEFAULT.TOP_BAR_MENU_MACHINE_PROFILES);
  // In a narrow window the button shrinks to its laser icon, so the tooltip names the active profile.
  const profileTooltipText: string = activeProfile
    ? t(DEFAULT.TOP_BAR_PROFILE_TOOLTIP, { name: activeProfile.name })
    : profilesLabel;

  const changeProfilesDialogOpen = (isMachineProfilesDialogOpen: boolean): void => {
    dispatch(new MachineProfilesDialogOpenChanged({ isMachineProfilesDialogOpen }));
  };

  return (
    <Layout.Header className={[styles.topBar, styles.fixedHeightBar].join(' ')}>
      {/* Plain text elements: antd Typography would add its own margins and colours. */}
      <div className={styles.heading}>
        {/* At phone width the brand line makes room for the project name; the Project menu names the version. */}
        <h1 className={styles.title}>
          <span className={styles.appName}>{t(DEFAULT.APP_TITLE)}</span>{' '}
          <span className={styles.version}>v{APP_VERSION}</span>
        </h1>
        <ProjectNameButton />
      </div>
      {/* Three action groups, each set apart from the one before by the same gap and a thin divider. */}
      <div className={[styles.group, styles.activeMenus].join(' ')}>
        <ProjectMenu />
        <AutosaveReadout />
      </div>
      {/* At phone width this group moves into the Project menu, so the project name keeps its room. */}
      <div className={[styles.group, styles.activeMenus, styles.machineGroup].join(' ')}>
        <DismissibleTooltip title={profileTooltipText}>
          <Button
            className={styles.profileButton}
            type={ANTD_BUTTON_TYPE_TEXT}
            icon={<LaserMachineIcon />}
            aria-label={profilesLabel}
            onClick={() => changeProfilesDialogOpen(true)}
          >
            <span className={styles.profileName}>{activeProfile?.name ?? profilesLabel}</span>
            {/* The chevron says the chip opens the profile chooser. */}
            <DownOutlined className={styles.profileCaret} aria-hidden="true" />
          </Button>
        </DismissibleTooltip>
        <DismissibleTooltip title={t(DEFAULT.TOP_BAR_MENU_IMPORT_SVG)}>
          <span className={styles.importSlot}>
            <SvgImportButton
              buttonType={ANTD_BUTTON_TYPE_TEXT}
              buttonId={TOP_BAR_IMPORT_SVG_BUTTON_ID}
              iconComponent={<FileAddOutlined />}
              labelClassName={styles.importLabel}
            />
          </span>
        </DismissibleTooltip>
      </div>
      {/* At phone width Undo and Redo move into the Project menu too, so the project name gets their room. */}
      <div className={[styles.group, styles.activeMenus, styles.historyGroup].join(' ')}>
        <IconActionButton
          type={ANTD_BUTTON_TYPE_TEXT}
          iconComponent={<UndoArrowIcon />}
          labelText={t(DEFAULT.TOP_BAR_UNDO)}
          tooltipText={canUndo ? t(DEFAULT.TOP_BAR_SHORTCUT_TOOLTIP, {
            action: t(DEFAULT.TOP_BAR_UNDO),
            shortcut: t(DEFAULT.TOP_BAR_UNDO_SHORTCUT),
          }) : t(DEFAULT.TOP_BAR_NOTHING_TO_UNDO)}
          isDisabled={!canUndo}
          isFocusableWhenDisabled
          onClick={() => dispatch(new ProjectUndoRequested())}
        />
        <IconActionButton
          type={ANTD_BUTTON_TYPE_TEXT}
          iconComponent={<RedoArrowIcon />}
          labelText={t(DEFAULT.TOP_BAR_REDO)}
          tooltipText={canRedo ? t(DEFAULT.TOP_BAR_SHORTCUT_TOOLTIP, {
            action: t(DEFAULT.TOP_BAR_REDO),
            shortcut: t(DEFAULT.TOP_BAR_REDO_SHORTCUT),
          }) : t(DEFAULT.TOP_BAR_NOTHING_TO_REDO)}
          isDisabled={!canRedo}
          isFocusableWhenDisabled
          onClick={() => dispatch(new ProjectRedoRequested())}
        />
      </div>
      <div className={styles.trailing}>
        <div className={styles.updateSlot}>
          <AppUpdatePrompt />
        </div>
        <LaserStateChip />
        <ConnectionPill />
      </div>
      <MachineProfilesDialog isOpen={isProfilesDialogOpen} onClose={() => changeProfilesDialogOpen(false)} />
    </Layout.Header>
  );
};
