/**
 * The material library dialog: saved laser settings per material and machine.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT } from '../../utils/localization/default.locales';
import { AppModal } from '../AppModal';
import type { MaterialLibraryDialogProps } from './interfaces/MaterialLibraryDialogProps';
import { MATERIAL_LIBRARY_DIALOG_OVERLAY_ID, MATERIAL_LIBRARY_DIALOG_WIDTH } from './material.library.dialog.constants';
import { MaterialLibraryEditor } from './MaterialLibraryEditor';

export const MaterialLibraryDialog = ({ isOpen, onClose }: MaterialLibraryDialogProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <AppModal
      isOpen={isOpen}
      overlayIdPrefix={MATERIAL_LIBRARY_DIALOG_OVERLAY_ID}
      title={t(DEFAULT.MATERIAL_LIBRARY_TITLE)}
      footer={null}
      maxWidth={MATERIAL_LIBRARY_DIALOG_WIDTH}
      destroyOnHidden
      onClose={onClose}
    >
      <MaterialLibraryEditor />
    </AppModal>
  );
};
