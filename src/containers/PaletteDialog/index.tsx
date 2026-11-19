/**
 * The palette dialog: the colour list, the form that edits one entry, reset to defaults and export for Inkscape. It
 * opens over the whole window, so the form has room, and its content starts over on every open.
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
import type { PaletteDialogProps } from './interfaces/PaletteDialogProps';
import { PALETTE_DIALOG_OVERLAY_ID, PALETTE_DIALOG_WIDTH } from './palette.dialog.constants';
import { PaletteEditor } from './PaletteEditor';

export const PaletteDialog = ({ isOpen, onClose }: PaletteDialogProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <AppModal
      isOpen={isOpen}
      overlayIdPrefix={PALETTE_DIALOG_OVERLAY_ID}
      title={t(DEFAULT.PALETTE_TITLE)}
      footer={null}
      maxWidth={PALETTE_DIALOG_WIDTH}
      destroyOnHidden
      onClose={onClose}
    >
      <PaletteEditor />
    </AppModal>
  );
};
