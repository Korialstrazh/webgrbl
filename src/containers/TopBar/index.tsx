/**
 * The top region: app name, the project name, the Project menu and autosave readout, the machine profiles dialog, SVG
 * import, undo and redo, the connection pill and update notice. The material library opens from the Material panel.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ImportOutlined } from '@ant-design/icons';
import { Button, Layout } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_LARGE, ANTD_BUTTON_TYPE_TEXT } from '../../utils/antd.constants';
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

  const changeProfilesDialogOpen = (isMachineProfilesDialogOpen: boolean): void => {
    dispatch(new MachineProfilesDialogOpenChanged({ isMachineProfilesDialogOpen }));
  };

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
        <DismissibleTooltip title={profilesLabel}>
          <Button
            className={styles.profileButton}
            type={ANTD_BUTTON_TYPE_TEXT}
            size={ANTD_BUTTON_SIZE_LARGE}
            icon={<LaserMachineIcon />}
            aria-label={profilesLabel}
            onClick={() => changeProfilesDialogOpen(true)}
          >
            <span className={styles.profileName}>{activeProfile?.name ?? profilesLabel}</span>
          </Button>
        </DismissibleTooltip>
        <SvgImportButton iconComponent={<ImportOutlined />} labelClassName={styles.compactHiddenLabel} />
      </div>
      <div className={[styles.group, styles.activeMenus].join(' ')}>
        <IconActionButton
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_LARGE}
          iconComponent={<UndoArrowIcon />}
          labelText={t(DEFAULT.TOP_BAR_UNDO)}
          isDisabled={!canUndo}
          onClick={() => dispatch(new ProjectUndoRequested())}
        />
        <IconActionButton
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_LARGE}
          iconComponent={<RedoArrowIcon />}
          labelText={t(DEFAULT.TOP_BAR_REDO)}
          isDisabled={!canRedo}
          onClick={() => dispatch(new ProjectRedoRequested())}
        />
      </div>
      <div className={styles.trailing}>
        <AppUpdatePrompt />
        <LaserStateChip />
        <ConnectionPill />
      </div>
      <MachineProfilesDialog isOpen={isProfilesDialogOpen} onClose={() => changeProfilesDialogOpen(false)} />
    </Layout.Header>
  );
};
