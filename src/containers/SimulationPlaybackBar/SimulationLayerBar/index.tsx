/**
 * The thin layer bar above the simulation slider: one segment per layer of the ready toolpath, as wide as its share
 * of the burn time (travel left out), in the layer colour, with the layer name in a tooltip. The shading layer is
 * mid-grey, as in the By layer view of the bed. The shares are worked out once per toolpath, not per frame.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Tooltip } from 'antd';
import { memo, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';
import { selectPaletteEntries } from '../../../utils/states/palette.state';
import { selectProjectLayers } from '../../../utils/states/project.document.state';
import { selectToolpathMotionTimeline } from '../../../utils/states/toolpath.timeline.selectors';
import { selectToolpath, selectToolpathStatus } from '../../../utils/states/toolpath.state';
import { TOOLPATH_STATUS } from '../../../utils/states/toolpath.status.constants';
import { getToolpathLayerBurnTimes } from '../../../utils/toolpath/get.toolpath.layer.burn.times';
import type { MotionTimeline } from '../../../utils/toolpath/interfaces/MotionTimeline';
import type { Toolpath } from '../../../utils/toolpath/interfaces/Toolpath';
import type { ToolpathLayerBurnTime } from '../../../utils/toolpath/interfaces/ToolpathLayerBurnTime';
import type { SimulationLayerSegment } from '../interfaces/SimulationLayerSegment';
import { SIMULATION_LAYER_SEGMENT_TEST_ID } from '../simulation.playback.constants';
import { getSimulationLayerSegments } from './get.simulation.layer.segments';
import styles from './styles.module.scss';

const renderLayerSegment = (segment: SimulationLayerSegment): ReactNode => (
  <Tooltip key={segment.layerKey} title={segment.layerName}>
    {/* A plain span: the segment is a coloured strip, which no antd component draws. */}
    <span
      className={segment.isShading ? [styles.segment, styles.shadingSegment].join(' ') : styles.segment}
      // The width and the layer colour come from the toolpath at run time.
      // eslint-disable-next-line no-restricted-syntax -- runtime-only width and colour
      style={{ width: `${segment.widthPercent}%`, backgroundColor: segment.isShading ? undefined : segment.layerKey }}
      role="img"
      aria-label={segment.layerName}
      data-testid={SIMULATION_LAYER_SEGMENT_TEST_ID}
    />
  </Tooltip>
);

const SimulationLayerBarContent = (): ReactNode => {
  const { t } = useTranslation();
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

  return (
    <div className={styles.layerBar} role="group" aria-label={t(DEFAULT.SIMULATION_LAYER_BAR_LABEL)}>
      {segments.map(renderLayerSegment)}
    </div>
  );
};

/** Kept apart from the bar's per-frame renders: it does not depend on the time. */
export const SimulationLayerBar = memo(SimulationLayerBarContent);
