/**
 * The Open project dialog: the stored projects, newest first, with Open file. It opens over the whole window, so it
 * is never cut off by a narrow bed, and its content starts over, and asks for the list again, on every open. Where
 * the projects are kept is a storage icon in the footer whose tooltip, focus and screen reader give the note.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { HddOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT } from '../../utils/localization/default.locales';
import { TooltipNoteIcon } from '../../views/TooltipNoteIcon';
import { AppModal } from '../AppModal';
import type { OpenProjectDialogProps } from './interfaces/OpenProjectDialogProps';
import { OPEN_PROJECT_DIALOG_OVERLAY_ID, OPEN_PROJECT_DIALOG_WIDTH } from './open.project.dialog.constants';
import { ProjectList } from './ProjectList';
import styles from './styles.module.scss';

export const OpenProjectDialog = ({ isOpen, onClose }: OpenProjectDialogProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <AppModal
      isOpen={isOpen}
      overlayIdPrefix={OPEN_PROJECT_DIALOG_OVERLAY_ID}
      title={t(DEFAULT.OPEN_PROJECT_TITLE)}
      footer={(
        <span className={styles.footerNote}>
          <TooltipNoteIcon noteText={t(DEFAULT.OPEN_PROJECT_FOOTER)} iconComponent={<HddOutlined />} />
        </span>
      )}
      maxWidth={OPEN_PROJECT_DIALOG_WIDTH}
      destroyOnHidden
      onClose={onClose}
    >
      <ProjectList onClose={onClose} />
    </AppModal>
  );
};
