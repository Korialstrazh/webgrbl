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
import { JobStartButton } from '../JobStartButton';
import { StopButton } from '../StopButton';
import styles from './styles.module.scss';

export const StickyStopBar = (): ReactNode => (
  <div className={styles.stickyStopBar}>
    <div className={styles.start}><JobStartButton /></div>
    <StopButton />
  </div>
);
