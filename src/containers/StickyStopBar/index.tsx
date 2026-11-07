/**
 * The bar pinned to the bottom of a narrow window so STOP stays within reach.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAnyDialogOpen } from '../../utils/states/ui.overlay.state';
import { JobStartButton } from '../JobStartButton';
import { StopButton } from '../StopButton';
import { StopSettingsButton } from '../StopSettingsButton';
import styles from './styles.module.scss';

export const StickyStopBar = (): ReactNode => {
  // STOP sits above every dialog for safety; the other actions of the bar must not reach past an open dialog.
  const isAnyDialogOpen: boolean = useSelector(selectIsAnyDialogOpen);

  return (
    <div className={styles.stickyStopBar}>
      <div className={styles.start} inert={isAnyDialogOpen}><JobStartButton /></div>
      <StopButton />
      <div className={styles.settings} inert={isAnyDialogOpen}><StopSettingsButton /></div>
    </div>
  );
};
