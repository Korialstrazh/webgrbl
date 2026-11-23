/**
 * The body of the handbook: the current step with its animation and text, a step list beside it in a wide window, and a
 * Previous / Next pager that ends in Done. It holds the current step, so unmounting it resets the handbook to step 1.
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
