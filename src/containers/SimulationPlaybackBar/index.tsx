/**
 * The playback bar below the bed in Toolpath view: Back to start, Play or Pause and To end; the time slider with the
 * layer bar above it; the elapsed and total time; the speed switch; and the readout of the simulated head.
 *
 * - Play runs the time through animation frames at the chosen speed and stops at the end; Play at the end starts
 *   again from 0. Space toggles play while the bar has the focus (there is no global key).
 * - Every control is disabled unless the toolpath may play (ready and taking some time), so a toolpath that is out of
 *   date, generating or failed never plays.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  CaretRightOutlined,
  PauseOutlined,
  ReloadOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
} from '@ant-design/icons';
import { Button, Segmented, Slider } from 'antd';
import type { SegmentedProps } from 'antd';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_SEGMENTED_SIZE_SMALL } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectClampedSimulationTimeS } from '../../utils/states/simulation.clamped.time.selector';
import { SIMULATION_SPEEDS } from '../../utils/states/simulation.speed.constants';
import type { SimulationSpeed } from '../../utils/states/simulation.speed.constants';
import { selectIsSimulationPlaying, selectSimulationSpeed } from '../../utils/states/simulation.state';
import { selectToolpath } from '../../utils/states/toolpath.state';
import {
  selectIsSimulationPlayable,
  selectReadyToolpathTotalTimeS,
  selectToolpathMotionTimeline,
} from '../../utils/states/toolpath.timeline.selectors';
import { getJobSizeText } from '../../utils/toolpath/get.job.size.text';
import { getSimulationClockText } from '../../utils/toolpath/get.simulation.clock.text';
import { getTimelinePosition } from '../../utils/toolpath/get.timeline.position';
import type { MotionTimeline } from '../../utils/toolpath/interfaces/MotionTimeline';
import type { TimelinePosition } from '../../utils/toolpath/interfaces/TimelinePosition';
import type { Toolpath } from '../../utils/toolpath/interfaces/Toolpath';
import type { SimulationTransport } from './interfaces/SimulationTransport';
import { EMPTY_SIMULATION_SLIDER_MAX_S, SIMULATION_SLIDER_STEP_S } from './simulation.playback.constants';
import { SimulationLayerBar } from './SimulationLayerBar';
import { SimulationReadout } from './SimulationReadout';
import styles from './styles.module.scss';
import { useSimulationPlayback } from './use.simulation.playback';
import { useSimulationTransport } from './use.simulation.transport';

/** Whether the simulation stands at the end of a job, so Play starts it again from the beginning. */
const isSimulationAtEnd = (isPlaying: boolean, currentTimeS: number, totalTimeS: number): boolean =>
  !isPlaying && totalTimeS > 0 && currentTimeS >= totalTimeS;

const getPlayLabelKey = (isPlaying: boolean, isAtEnd: boolean): string => {
  if (isPlaying) {
    return DEFAULT.SIMULATION_PAUSE;
  }

  return isAtEnd ? DEFAULT.SIMULATION_REPLAY : DEFAULT.SIMULATION_PLAY;
};

const getPlayIconComponent = (isPlaying: boolean, isAtEnd: boolean): ReactNode => {
  if (isPlaying) {
    return <PauseOutlined />;
  }

  return isAtEnd ? <ReloadOutlined /> : <CaretRightOutlined />;
};

/** The slider tooltip shows the time under the handle as a clock. */
const getSliderTooltipText = (timeS: number | undefined): string => getSimulationClockText(timeS ?? 0);

export const SimulationPlaybackBar = (): ReactNode => {
  const { t } = useTranslation();
  const isPlayable: boolean = useSelector(selectIsSimulationPlayable);
  const isPlaying: boolean = useSelector(selectIsSimulationPlaying);
  const currentTimeS: number = useSelector(selectClampedSimulationTimeS);
  const speed: SimulationSpeed = useSelector(selectSimulationSpeed);
  const totalTimeS: number = useSelector(selectReadyToolpathTotalTimeS) ?? 0;
  const toolpath: Toolpath | undefined = useSelector(selectToolpath);
  const timeline: MotionTimeline | undefined = useSelector(selectToolpathMotionTimeline);
  const transport: SimulationTransport = useSimulationTransport();
  // Only a playable toolpath is ready, so its position never comes from a stale toolpath.
  const position: TimelinePosition | undefined = isPlayable && toolpath && timeline
    ? getTimelinePosition(toolpath, timeline, currentTimeS)
    : undefined;
  const speedOptions: SegmentedProps<SimulationSpeed>['options'] = useMemo(
    () => SIMULATION_SPEEDS.map((speedOption: SimulationSpeed) => ({
      value: speedOption,
      label: t(DEFAULT.SIMULATION_SPEED_OPTION, { speed: speedOption }),
    })),
    [t],
  );
  const isAtEnd: boolean = isSimulationAtEnd(isPlaying, currentTimeS, totalTimeS);
  const playLabel: string = t(getPlayLabelKey(isPlaying, isAtEnd));

  useSimulationPlayback();

  return (
    // A plain group: it takes the focus for the Space key, which no antd layout component offers.
    <div
      className={styles.playbackBar}
      role="group"
      aria-label={t(DEFAULT.SIMULATION_PLAYBACK_LABEL)}
      tabIndex={0}
      onKeyDown={transport.handleBarKeyDown}
    >
      <div className={styles.transport}>
        <Button
          icon={<StepBackwardOutlined />}
          aria-label={t(DEFAULT.SIMULATION_BACK_TO_START)}
          title={t(DEFAULT.SIMULATION_BACK_TO_START)}
          disabled={!isPlayable}
          onClick={transport.goToSimulationStart}
        />
        <Button
          icon={getPlayIconComponent(isPlaying, isAtEnd)}
          aria-label={playLabel}
          title={playLabel}
          disabled={!isPlayable}
          onClick={transport.toggleSimulationPlay}
        />
        <Button
          icon={<StepForwardOutlined />}
          aria-label={t(DEFAULT.SIMULATION_TO_END)}
          title={t(DEFAULT.SIMULATION_TO_END)}
          disabled={!isPlayable}
          onClick={transport.goToSimulationEnd}
        />
      </div>
      <div className={styles.timeline}>
        <SimulationLayerBar />
        <Slider
          className={styles.slider}
          min={0}
          max={totalTimeS || EMPTY_SIMULATION_SLIDER_MAX_S}
          step={SIMULATION_SLIDER_STEP_S}
          value={currentTimeS}
          disabled={!isPlayable}
          tooltip={{ formatter: getSliderTooltipText }}
          ariaLabelForHandle={t(DEFAULT.SIMULATION_TIME_LABEL)}
          onChange={transport.setSimulationTime}
        />
      </div>
      <span className={styles.clock}>
        {t(DEFAULT.SIMULATION_ELAPSED_OF_TOTAL, {
          elapsed: getSimulationClockText(currentTimeS),
          total: getSimulationClockText(totalTimeS),
        })}
      </span>
      <Segmented<SimulationSpeed>
        className={styles.speedSwitch}
        aria-label={t(DEFAULT.SIMULATION_SPEED_LABEL)}
        size={ANTD_SEGMENTED_SIZE_SMALL}
        options={speedOptions}
        value={speed}
        disabled={!isPlayable}
        onChange={transport.setSimulationSpeed}
      />
      <div className={styles.details}>
        {isPlayable && <span className={styles.jobSize}>{getJobSizeText(t, toolpath?.bounds)}</span>}
        <SimulationReadout position={position} />
      </div>
    </div>
  );
};
