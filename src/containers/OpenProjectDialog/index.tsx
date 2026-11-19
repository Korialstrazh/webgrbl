/**
 * The Open project dialog: the stored projects, newest first, with Open file. It opens over the whole window, so it
 * is never cut off by a narrow bed, and its content starts over, and asks for the list again, on every open. Where
 * the projects are kept is a storage icon in the footer whose tooltip, focus and screen reader give the note.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT } from '../../utils/localization/default.locales';
import { AppModal } from '../AppModal';
import type { OpenProjectDialogProps } from './interfaces/OpenProjectDialogProps';
import { OPEN_PROJECT_DIALOG_OVERLAY_ID, OPEN_PROJECT_DIALOG_WIDTH } from './open.project.dialog.constants';
import { ProjectList } from './ProjectList';

export const OpenProjectDialog = ({ isOpen, onClose }: OpenProjectDialogProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <AppModal
      isOpen={isOpen}
      overlayIdPrefix={OPEN_PROJECT_DIALOG_OVERLAY_ID}
      title={t(DEFAULT.OPEN_PROJECT_TITLE)}
      footer={null}
      maxWidth={OPEN_PROJECT_DIALOG_WIDTH}
      destroyOnHidden
      onClose={onClose}
    >
      <ProjectList onClose={onClose} />
    </AppModal>
  );
};
