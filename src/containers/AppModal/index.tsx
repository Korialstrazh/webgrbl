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
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Modal } from 'antd';
import { useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import { ANTD_MODAL_CONTENT_SELECTOR, ANTD_MODAL_TITLE_SELECTOR } from '../../utils/antd.constants';
import { useOverlayRegistration } from '../../utils/hooks/use.overlay.registration';
import { OVERLAY_KIND } from '../../utils/states/overlay.kind.constants';
import { getAppModalWidth } from './get.app.modal.width';
import type { AppModalProps } from './interfaces/AppModalProps';
import styles from './styles.module.scss';

// Text and number entries only: a file input is hidden, and a select's search box would open nothing useful.
const MODAL_FIRST_FIELD_SELECTOR =
  'input:not([type=file], [type=checkbox], [type=radio], [type=search], [disabled], [readonly], [role=combobox])';

/** The first field, or else the title, so that the focus ring does not land on the close button when a dialog opens. */
const moveFocusIntoModal = (bodyElement: HTMLElement): void => {
  const firstField: HTMLElement | null = bodyElement.querySelector<HTMLElement>(MODAL_FIRST_FIELD_SELECTOR);
  const titleElement: HTMLElement | null | undefined =
    bodyElement.closest(ANTD_MODAL_CONTENT_SELECTOR)?.querySelector<HTMLElement>(ANTD_MODAL_TITLE_SELECTOR);

  if (firstField) {
    firstField.focus();
  } else if (titleElement) {
    titleElement.tabIndex = -1;
    titleElement.focus();
  }
};

export const AppModal = (props: AppModalProps): ReactNode => {
  const { isOpen, overlayIdPrefix, maxWidth, onClose, afterOpenChange, children, ...modalProps } = props;
  const bodyRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);

  useOverlayRegistration(overlayIdPrefix, isOpen, OVERLAY_KIND.DIALOG);

  return (
    <Modal
      {...modalProps}
      open={isOpen}
      centered
      width={getAppModalWidth(maxWidth)}
      rootClassName={styles.appModal}
      onCancel={onClose}
      afterOpenChange={(isModalOpen: boolean) => {
        if (isModalOpen && bodyRef.current) {
          moveFocusIntoModal(bodyRef.current);
        }

        afterOpenChange?.(isModalOpen);
      }}
    >
      <div ref={bodyRef} className={styles.focusRoot}>{children}</div>
    </Modal>
  );
};
