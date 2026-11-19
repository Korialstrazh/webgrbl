/**
 * The layer strip under the simulation slider, drawn as its rail so the two read as one track: one segment per layer
 * of the ready toolpath, as wide as its share of the burn time (travel left out), in the layer colour, named for
 * screen readers. With one layer or none it
 * is not shown: a single full-width segment says nothing and reads as a second progress bar. The shading layer is
 * mid-grey, as in the By layer view of the bed. The shares are worked out once per toolpath, not per frame. Only the
 * played part shows the layer colours; the part still to play is a neutral track, so no colour there reads as an error.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { memo, useId, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';
import { PERCENT_DIVISOR } from '../../../utils/percent.constants';
import { selectPaletteEntries } from '../../../utils/states/palette.state';
import { selectProjectLayers } from '../../../utils/states/project.document.state';
import { selectToolpath, selectToolpathStatus } from '../../../utils/states/toolpath.state';
import { TOOLPATH_STATUS } from '../../../utils/states/toolpath.status.constants';
import { selectToolpathMotionTimeline } from '../../../utils/states/toolpath.timeline.selectors';
import { getToolpathLayerBurnTimes } from '../../../utils/toolpath/get.toolpath.layer.burn.times';
import type { MotionTimeline } from '../../../utils/toolpath/interfaces/MotionTimeline';
import type { Toolpath } from '../../../utils/toolpath/interfaces/Toolpath';
import type { ToolpathLayerBurnTime } from '../../../utils/toolpath/interfaces/ToolpathLayerBurnTime';
import type { SimulationLayerSegment } from '../interfaces/SimulationLayerSegment';
import { SIMULATION_LAYER_SEGMENT_TEST_ID } from '../simulation.playback.constants';
import { getSimulationLayerSegments } from './get.simulation.layer.segments';
import styles from './styles.module.scss';

const renderLayerSegment = (segment: SimulationLayerSegment): ReactNode => (
  // A plain span: the segment is a coloured strip, which no antd component draws.
  <span
    key={segment.layerKey}
    className={segment.isShading ? [styles.segment, styles.shadingSegment].join(' ') : styles.segment}
    // The width and the layer colour come from the toolpath at run time.
    // eslint-disable-next-line no-restricted-syntax -- runtime-only width and colour
    style={{ width: `${segment.widthPercent}%`, backgroundColor: segment.isShading ? undefined : segment.layerKey }}
    role="img"
    aria-label={segment.layerName}
    data-testid={SIMULATION_LAYER_SEGMENT_TEST_ID}
  />
);

/** One segment fills the bar and tells nothing, so the bar needs at least two layers. */
const MIN_SEGMENTS_TO_SHOW = 2;

interface SimulationLayerBarProps {
  /** How much of the job has played, from 0 to 100. */
  playedPercent: number;
}

const SimulationLayerBarContent = ({ playedPercent }: SimulationLayerBarProps): ReactNode => {
  const { t } = useTranslation();
  const captionId: string = useId();
  const isToolpathCurrent: boolean = useSelector(selectToolpathStatus) === TOOLPATH_STATUS.READY;
  const toolpath: Toolpath | undefined = useSelector(selectToolpath);
  const timeline: MotionTimeline | undefined = useSelector(selectToolpathMotionTimeline);
  const projectLayers: ProjectLayer[] = useSelector(selectProjectLayers);
  const paletteEntries: PaletteEntry[] = useSelector(selectPaletteEntries);
  const currentToolpath: Toolpath | undefined = isToolpathCurrent ? toolpath : undefined;
  const layerBurnTimes: ToolpathLayerBurnTime[] = useMemo(
    () => (currentToolpath && timeline ? getToolpathLayerBurnTimes(currentToolpath, timeline) : []),
    [currentToolpath, timeline],
  );
  const segments: SimulationLayerSegment[] = useMemo(
    () => getSimulationLayerSegments({ layerBurnTimes, projectLayers, paletteEntries }),
    [layerBurnTimes, projectLayers, paletteEntries],
  );

  if (segments.length < MIN_SEGMENTS_TO_SHOW) {
    return null;
  }

  return (
    <div className={styles.simulationLayerBar}>
      <span className={styles.caption} id={captionId}>{t(DEFAULT.SIMULATION_LAYER_BAR_LABEL)}</span>
      <div className={styles.layerBar} role="group" aria-labelledby={captionId}>
        {/* Clipped at the playhead, which moves at run time, so the unplayed rest shows the neutral track. */}
        <div
          className={styles.playedSegments}
          // eslint-disable-next-line no-restricted-syntax -- runtime-only playhead position
          style={{ clipPath: `inset(0 ${PERCENT_DIVISOR - playedPercent}% 0 0)` }}
        >
          {segments.map(renderLayerSegment)}
        </div>
      </div>
    </div>
  );
};

/** Kept apart from the bar's per-frame renders: it does not depend on the time. */
export const SimulationLayerBar = memo(SimulationLayerBarContent);
