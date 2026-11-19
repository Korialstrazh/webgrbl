/**
 * The console in its place below the bed: a surface that holds the console panel and fills the space it gets, the
 * lower splitter panel in a wide window or a bottom sheet in a narrow one. The bottom sheet counts as an open overlay,
 * so Escape closes it instead of stopping the machine.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { ConsolePanel } from '../../../containers/ConsolePanel';
import { useIsWideLayout } from '../../../utils/hooks/use.is.wide.layout';
import { selectIsConsoleOpen } from '../../../utils/states/panel.layout.state';
import styles from './styles.module.scss';
import { useConsoleSheetEscape } from './use.console.sheet.escape';

export const ConsoleDock = (): ReactNode => {
  const isWide: boolean = useIsWideLayout();
  const isConsoleOpen: boolean = useSelector(selectIsConsoleOpen);

  useConsoleSheetEscape(!isWide && isConsoleOpen);

  return (
    <div className={styles.consoleDock}>
      <ConsolePanel />
    </div>
  );
};
