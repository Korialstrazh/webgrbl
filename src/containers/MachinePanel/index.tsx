/**
 * The right region, the main task first: the job, the compact machine status (only while connected), the positions,
 * moving the head and the laser pointer, and, in a wide window, STOP at the bottom. When the cards are cut off above
 * STOP, their bottom edge fades out over a thin shadow from the STOP footer, beside a normal scrollbar, and a small
 * chevron in the footer's top padding scrolls them on, so it reads as a list that scrolls.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DownOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../utils/antd.constants';
import { useIsScrollContentCutOff } from '../../utils/hooks/use.is.scroll.content.cut.off';
import { MACHINE_PANEL_WIDTH } from '../../utils/layout.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { IconActionButton } from '../../views/IconActionButton';
import { StopButton } from '../StopButton';
import { StopSettingsButton } from '../StopSettingsButton';
import { JobCard } from './JobCard';
import { MachineStatusCard } from './MachineStatusCard';
import { MoveCard } from './MoveCard';
import { PositionCard } from './PositionCard';
import type { MachinePanelProps } from './interfaces/MachinePanelProps';
import styles from './styles.module.scss';

/** One click on the "more below" hint scrolls the cards by this share of their visible height. */
const MORE_BELOW_SCROLL_SHARE = 0.8;
const SMOOTH_SCROLL_BEHAVIOR = 'smooth';

export const MachinePanel = ({ isWide }: MachinePanelProps): ReactNode => {
  const { t } = useTranslation();
  const cardsRef = useRef<HTMLDivElement>(null);
  const isCardsCutOff: boolean = useIsScrollContentCutOff(cardsRef);

  const scrollCardsDown = (): void => {
    const cardsElement: HTMLDivElement | null = cardsRef.current;

    cardsElement?.scrollBy({
      top: cardsElement.clientHeight * MORE_BELOW_SCROLL_SHARE,
      behavior: SMOOTH_SCROLL_BEHAVIOR,
    });
  };

  return (
    <Layout.Sider
      className={styles.region}
      classNames={{ body: styles.machinePanel }}
      width={MACHINE_PANEL_WIDTH}
      aria-label={t(DEFAULT.MACHINE_PANEL_TITLE)}
    >
      <div className={styles.cardsArea}>
        <div ref={cardsRef} className={isCardsCutOff ? [styles.cards, styles.cardsCutOff].join(' ') : styles.cards}>
          <JobCard isStartShown={isWide} />
          <MachineStatusCard />
          <PositionCard />
          <MoveCard />
        </div>
      </div>
      {isWide && (
        <div className={isCardsCutOff ? [styles.stopFooter, styles.stopFooterRaised].join(' ') : styles.stopFooter}>
          <StopButton />
          <StopSettingsButton />
          {/* A small chevron in the footer's own top padding, never over a card: it comes and goes without moving
              anything, as the footer keeps its height. */}
          {isCardsCutOff && (
            <IconActionButton
              className={styles.moreBelow}
              type={ANTD_BUTTON_TYPE_TEXT}
              size={ANTD_BUTTON_SIZE_SMALL}
              labelText={t(DEFAULT.MACHINE_PANEL_MORE_BELOW)}
              iconComponent={<DownOutlined />}
              onClick={scrollCardsDown}
            />
          )}
        </div>
      )}
    </Layout.Sider>
  );
};
