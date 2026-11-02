/**
 * The console in its place below the bed: a surface that holds the console panel and fills the space it gets, the
 * lower splitter panel in a wide window or a block of fixed height in a narrow one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { ConsolePanel } from '../../../containers/ConsolePanel';
import styles from './styles.module.scss';

export const ConsoleDock = (): ReactNode => (
  <div className={styles.consoleDock}>
    <ConsolePanel />
  </div>
);
