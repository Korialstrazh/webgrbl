/**
 * An antd Modal rendered into the bed region, with its mask over the bed only, so the machine panel and STOP stay
 * visible and clickable. It registers as an open overlay while shown, so Escape closes it instead of stopping the
 * machine. Features open dialogs only through this wrapper, never through a raw antd Modal.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Modal } from 'antd';
import { useContext } from 'react';
import type { ReactNode } from 'react';
import { BedRegionHostContext } from '../../utils/bed/bed.region.host.context';
import { useOverlayRegistration } from '../../utils/hooks/use.overlay.registration';
import type { BedRegionModalProps } from './interfaces/BedRegionModalProps';
import styles from './styles.module.scss';

export const BedRegionModal = (props: BedRegionModalProps): ReactNode => {
  const { isOpen, overlayIdPrefix, onClose, ...modalProps } = props;
  const bedRegionHost: HTMLElement | null = useContext(BedRegionHostContext);
  // Without the bed region the dialog would fall back to the whole window, over STOP, so it waits for the region.
  const isShown: boolean = isOpen && Boolean(bedRegionHost);

  useOverlayRegistration(overlayIdPrefix, isShown);

  if (!bedRegionHost) {
    return null;
  }

  return (
    <Modal
      {...modalProps}
      open={isShown}
      getContainer={bedRegionHost}
      rootClassName={styles.bedRegionModal}
      onCancel={onClose}
    />
  );
};
