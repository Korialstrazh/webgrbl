/**
 * The right region with the machine status and controls; STOP sits at its bottom in a wide window.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsWideLayout } from '../../utils/hooks/use.is.wide.layout';
import { DEFAULT } from '../../utils/localization/default.locales';
import { MachineControlButtons } from '../MachineControlButtons';
import { MachineStatusPanel } from '../MachineStatusPanel';
import { StopButton } from '../StopButton';
import styles from './styles.module.scss';

export const MachinePanel = (): ReactNode => {
  const { t } = useTranslation();
  const isWide: boolean = useIsWideLayout();

  return (
    <aside className={styles.machinePanel} aria-label={t(DEFAULT.MACHINE_PANEL_TITLE)}>
      <h2 className={styles.title}>{t(DEFAULT.MACHINE_PANEL_TITLE)}</h2>
      <MachineStatusPanel />
      <MachineControlButtons />
      {isWide && (
        <div className={styles.stopArea}>
          <StopButton />
        </div>
      )}
    </aside>
  );
};
