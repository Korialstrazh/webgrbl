/**
 * The right region, the main task first: the machine status (one line while not connected), the job, moving the head
 * and the laser pointer, and, in a wide window, STOP at the bottom. When the cards are cut off above STOP, their
 * bottom edge fades out, so it reads as a list that scrolls.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Layout } from 'antd';
import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsScrollContentCutOff } from '../../utils/hooks/use.is.scroll.content.cut.off';
import { MACHINE_PANEL_WIDTH } from '../../utils/layout.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { StopButton } from '../StopButton';
import { StopSettingsButton } from '../StopSettingsButton';
import { JobCard } from './JobCard';
import { LaserCard } from './LaserCard';
import { MachineStatusCard } from './MachineStatusCard';
import { MoveCard } from './MoveCard';
import type { MachinePanelProps } from './interfaces/MachinePanelProps';
import styles from './styles.module.scss';

export const MachinePanel = ({ isWide }: MachinePanelProps): ReactNode => {
  const { t } = useTranslation();
  const cardsRef = useRef<HTMLDivElement>(null);
  const isCardsCutOff: boolean = useIsScrollContentCutOff(cardsRef);

  return (
    <Layout.Sider
      className={styles.region}
      classNames={{ body: styles.machinePanel }}
      width={MACHINE_PANEL_WIDTH}
      aria-label={t(DEFAULT.MACHINE_PANEL_TITLE)}
    >
      <div ref={cardsRef} className={isCardsCutOff ? [styles.cards, styles.cardsCutOff].join(' ') : styles.cards}>
        <MachineStatusCard />
        <JobCard isStartShown={isWide} />
        <MoveCard />
        <LaserCard />
      </div>
      {isWide && (
        <div className={styles.stopFooter}>
          <StopButton />
          <StopSettingsButton />
        </div>
      )}
    </Layout.Sider>
  );
};
