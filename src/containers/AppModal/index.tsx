/**
 * An antd Modal over the whole window, for the large editing dialogs (palette, machine profiles, open project): it
 * renders into the page body with a mask over the whole window, is centred, never gets wider than the window, and its
 * body scrolls inside the window height. It registers as an open overlay while shown, so Escape closes it instead of
 * stopping the machine. Small confirmations stay in the bed region through BedRegionModal, so STOP stays usable.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Modal } from 'antd';
import type { ReactNode } from 'react';
import { useOverlayRegistration } from '../../utils/hooks/use.overlay.registration';
import { getAppModalWidth } from './get.app.modal.width';
import type { AppModalProps } from './interfaces/AppModalProps';
import styles from './styles.module.scss';

export const AppModal = (props: AppModalProps): ReactNode => {
  const { isOpen, overlayIdPrefix, maxWidth, onClose, ...modalProps } = props;

  useOverlayRegistration(overlayIdPrefix, isOpen);

  return (
    <Modal
      {...modalProps}
      open={isOpen}
      centered
      width={getAppModalWidth(maxWidth)}
      rootClassName={styles.appModal}
      onCancel={onClose}
    />
  );
};
