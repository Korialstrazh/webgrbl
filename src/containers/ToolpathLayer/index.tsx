/**
 * The Toolpath view drawing on the bed, inside the bed's children: the real job at the simulation time.
 *
 * - Burn moves the head has passed are solid, coloured by power or by layer; the moves still to come are faint and
 *   dashed. Each layer (or layer and power band) is drawn in chunks of 1 000 moves, and only the chunk the head is in
 *   changes per frame, so 100 000 moves still play smoothly.
 * - The moves that burn nothing are a thin travel path, drawn only when asked for.
 * - The head crosshair sits where the timeline puts the head; the work zero marker sits at the profile's origin
 *   corner.
 * - Only a ready toolpath is drawn. A stale, failed or generating one is hidden, so an old toolpath never shows as
 *   the current job.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { DEFAULT_MACHINE_ORIGIN_CORNER } from '../../utils/profiles/machine.profile.constants';
import { selectActiveMachineProfile } from '../../utils/states/machine.profile.state';
import { selectSimulationTimeS } from '../../utils/states/simulation.state';
import { selectToolpathMotionTimeline } from '../../utils/states/toolpath.timeline.selectors';
import { selectToolpath, selectToolpathStatus } from '../../utils/states/toolpath.state';
import { TOOLPATH_STATUS } from '../../utils/states/toolpath.status.constants';
import type { GeometryPoint } from '../../utils/svg/geometry/interfaces/GeometryPoint';
import { getOriginMappedPoint } from '../../utils/toolpath/get.origin.mapped.point';
import { getTimelinePosition } from '../../utils/toolpath/get.timeline.position';
import { getToolpathDrawing } from '../../utils/toolpath/get.toolpath.drawing';
import { getToolpathStrokePieces } from '../../utils/toolpath/get.toolpath.stroke.pieces';
import type { MotionTimeline } from '../../utils/toolpath/interfaces/MotionTimeline';
import type { TimelinePosition } from '../../utils/toolpath/interfaces/TimelinePosition';
import type { Toolpath } from '../../utils/toolpath/interfaces/Toolpath';
import type { ToolpathDrawing } from '../../utils/toolpath/interfaces/ToolpathDrawing';
import type { ToolpathStrokePath } from '../../utils/toolpath/interfaces/ToolpathStrokePath';
import type { ToolpathStrokePiece } from '../../utils/toolpath/interfaces/ToolpathStrokePiece';
import { TOOLPATH_START_POINT } from '../../utils/toolpath/toolpath.constants';
import { TOOLPATH_BURN_STATE, TOOLPATH_PATH_KEY_SEPARATOR } from '../../utils/toolpath/toolpath.drawing.constants';
import type { ToolpathBurnState } from '../../utils/toolpath/toolpath.drawing.constants';
import { CROSSHAIR_ARM_MM, WORK_ORIGIN_MARKER_RADIUS_MM } from '../../views/BedView/bed.view.constants';
import { getBurnPathColour } from './get.burn.path.colour';
import type { BurnPathColour } from './interfaces/BurnPathColour';
import type { ToolpathLayerProps } from './interfaces/ToolpathLayerProps';
import styles from './styles.module.scss';
import {
  TOOLPATH_BURN_PATH_TEST_ID,
  TOOLPATH_HEAD_TEST_ID,
  TOOLPATH_LAYER_TEST_ID,
  TOOLPATH_ORIGIN_TEST_ID,
  TOOLPATH_TRAVEL_PATH_TEST_ID,
} from './toolpath.layer.constants';

const CROSSHAIR_PATH: string = `M${-CROSSHAIR_ARM_MM} 0H${CROSSHAIR_ARM_MM}M0 ${-CROSSHAIR_ARM_MM}V${CROSSHAIR_ARM_MM}`;
const BURN_STATE_CLASS_NAMES: Readonly<Record<ToolpathBurnState, string | undefined>> = {
  [TOOLPATH_BURN_STATE.BURNT]: styles.burnt,
  [TOOLPATH_BURN_STATE.REMAINING]: styles.remaining,
};

/** Stands in for the head before a position is known; no stroke path is cut then. */
const NO_HEAD_POSITION: TimelinePosition = { point: TOOLPATH_START_POINT, moveIndex: -1, powerPercent: 0 };

const getPointTransform = (point: GeometryPoint): string => `translate(${point.x} ${point.y})`;

/** The bed's Y-up millimetres turned into the SVG's Y-down ones, in one transform for the whole drawing. */
const getBedFlipTransform = (heightMm: number): string => `matrix(1 0 0 -1 0 ${heightMm})`;

/** The drawn pieces of every burn path group in one burn state, each with its group's colour. */
const renderBurnPieces = (
  strokePaths: ToolpathStrokePath[],
  piecesOfPaths: ToolpathStrokePiece[][],
  burnState: ToolpathBurnState,
): ReactNode[] => strokePaths.flatMap((strokePath: ToolpathStrokePath, pathIndex: number): ReactNode[] => {
  const { colourClassName, strokeColour }: BurnPathColour = getBurnPathColour(strokePath);
  const className: string = [styles.burnPath, BURN_STATE_CLASS_NAMES[burnState], colourClassName].join(' ');
  const pieces: ToolpathStrokePiece[] = piecesOfPaths[pathIndex] ?? [];

  return pieces
    .filter((piece: ToolpathStrokePiece): boolean => piece.burnState === burnState)
    .map((piece: ToolpathStrokePiece): ReactNode => (
      <path
        key={[strokePath.pathKey, piece.pieceKey].join(TOOLPATH_PATH_KEY_SEPARATOR)}
        className={className}
        stroke={strokeColour}
        d={piece.pathText}
        data-testid={TOOLPATH_BURN_PATH_TEST_ID}
        data-burn-state={burnState}
      />
    ));
});

export const ToolpathLayer = ({ dimensions, displayMode, isTravelShown }: ToolpathLayerProps): ReactNode => {
  const { t } = useTranslation();
  const { widthMm, heightMm } = dimensions;
  const isToolpathCurrent: boolean = useSelector(selectToolpathStatus) === TOOLPATH_STATUS.READY;
  const toolpath: Toolpath | undefined = useSelector(selectToolpath);
  const timeline: MotionTimeline | undefined = useSelector(selectToolpathMotionTimeline);
  const currentTimeS: number = useSelector(selectSimulationTimeS);
  const profile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const currentToolpath: Toolpath | undefined = isToolpathCurrent ? toolpath : undefined;
  const drawing: ToolpathDrawing | undefined = useMemo(
    () => currentToolpath && getToolpathDrawing(currentToolpath, displayMode),
    [currentToolpath, displayMode],
  );
  const position: TimelinePosition | undefined = currentToolpath && timeline
    && getTimelinePosition(currentToolpath, timeline, currentTimeS);
  const strokePaths: ToolpathStrokePath[] = (position && drawing?.strokePaths) || [];
  const piecesOfPaths: ToolpathStrokePiece[][] = strokePaths.map((strokePath: ToolpathStrokePath) =>
    getToolpathStrokePieces(strokePath, currentToolpath?.moves ?? [], position ?? NO_HEAD_POSITION));
  const originPoint: GeometryPoint = getOriginMappedPoint(
    TOOLPATH_START_POINT,
    profile?.originCorner ?? DEFAULT_MACHINE_ORIGIN_CORNER,
    { workAreaXMm: widthMm, workAreaYMm: heightMm },
  );

  return (
    <g
      className={styles.toolpathLayer}
      aria-label={t(DEFAULT.TOOLPATH_LAYER_LABEL)}
      data-testid={TOOLPATH_LAYER_TEST_ID}
    >
      {drawing && position && (
        <g transform={getBedFlipTransform(heightMm)}>
          {isTravelShown && drawing.travelPathText && (
            <path className={styles.travelPath} d={drawing.travelPathText} data-testid={TOOLPATH_TRAVEL_PATH_TEST_ID} />
          )}
          {renderBurnPieces(strokePaths, piecesOfPaths, TOOLPATH_BURN_STATE.REMAINING)}
          {renderBurnPieces(strokePaths, piecesOfPaths, TOOLPATH_BURN_STATE.BURNT)}
          <g className={styles.head} transform={getPointTransform(position.point)} data-testid={TOOLPATH_HEAD_TEST_ID}>
            <path d={CROSSHAIR_PATH} />
          </g>
        </g>
      )}
      <circle
        className={styles.origin}
        transform={getPointTransform({ x: originPoint.x, y: heightMm - originPoint.y })}
        r={WORK_ORIGIN_MARKER_RADIUS_MM}
        data-testid={TOOLPATH_ORIGIN_TEST_ID}
      />
    </g>
  );
};
