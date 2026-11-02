/**
 * The machine profiles dialog: the list of profiles, the form that edits one, reading values from the connected
 * laser, and import and export of a profiles file. It opens over the whole window, so the form has room, and
 * its content starts over on every open.
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
import { AppModal } from '../AppModal';
import type { MachineProfilesDialogProps } from './interfaces/MachineProfilesDialogProps';
import { MACHINE_PROFILES_DIALOG_OVERLAY_ID, MACHINE_PROFILES_DIALOG_WIDTH } from './machine.profiles.dialog.constants';
import { MachineProfilesEditor } from './MachineProfilesEditor';

export const MachineProfilesDialog = ({ isOpen, onClose }: MachineProfilesDialogProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <AppModal
      isOpen={isOpen}
      overlayIdPrefix={MACHINE_PROFILES_DIALOG_OVERLAY_ID}
      title={t(DEFAULT.MACHINE_PROFILES_TITLE)}
      footer={null}
      maxWidth={MACHINE_PROFILES_DIALOG_WIDTH}
      destroyOnHidden
      onClose={onClose}
    >
      <MachineProfilesEditor />
    </AppModal>
  );
};
