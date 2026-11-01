/**
 * The Open project dialog: the stored projects, newest first, with Open file. It opens in the bed region, so STOP
 * stays usable, and its content starts over, and asks for the list again, on every open.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT } from '../../utils/localization/default.locales';
import { BedRegionModal } from '../BedRegionModal';
import type { OpenProjectDialogProps } from './interfaces/OpenProjectDialogProps';
import { OPEN_PROJECT_DIALOG_OVERLAY_ID, OPEN_PROJECT_DIALOG_WIDTH } from './open.project.dialog.constants';
import { ProjectList } from './ProjectList';
import styles from './styles.module.scss';

export const OpenProjectDialog = ({ isOpen, onClose }: OpenProjectDialogProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <BedRegionModal
      isOpen={isOpen}
      overlayIdPrefix={OPEN_PROJECT_DIALOG_OVERLAY_ID}
      title={t(DEFAULT.OPEN_PROJECT_TITLE)}
      footer={<p className={styles.footerNote}>{t(DEFAULT.OPEN_PROJECT_FOOTER)}</p>}
      width={OPEN_PROJECT_DIALOG_WIDTH}
      destroyOnHidden
      onClose={onClose}
    >
      <ProjectList onClose={onClose} />
    </BedRegionModal>
  );
};
