/**
 * The getting-started handbook dialog: a modal around the step pager. It closes on Escape, the close button or Done on
 * the last step, and drops its content when hidden, so the handbook opens on step 1 again.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useTranslation } from 'react-i18next';
import { DEFAULT } from '../../utils/localization/default.locales';
import { AppModal } from '../AppModal';
import { HANDBOOK_DIALOG_OVERLAY_ID, HANDBOOK_DIALOG_WIDTH } from './handbook.dialog.constants';
import { HandbookPager } from './HandbookPager';
import type { HandbookDialogProps } from './interfaces/HandbookDialogProps';
import type { ReactNode } from 'react';

export const HandbookDialog = ({ isOpen, onClose }: HandbookDialogProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <AppModal
      isOpen={isOpen}
      overlayIdPrefix={HANDBOOK_DIALOG_OVERLAY_ID}
      title={t(DEFAULT.HANDBOOK_TITLE)}
      footer={null}
      maxWidth={HANDBOOK_DIALOG_WIDTH}
      destroyOnHidden
      onClose={onClose}
    >
      <HandbookPager onFinish={onClose} />
    </AppModal>
  );
};
