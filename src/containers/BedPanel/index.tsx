/**
 * The central region: a toolbar above the bed drawn to scale; the toasts are anchored to its top right.
 *
 * - Design view: the project objects on the bed, which a click selects and a drag moves.
 * - Toolpath view: the real job at the simulation time instead of the objects (no editing there), with its colour and
 *   travel toggles, the warnings chip in the toolbar row, the job size and estimate, the generation progress or
 *   out-of-date banner, and the simulation playback bar below the bed.
 * - The bed zooms and pans in both views (see BedViewport). Its work surface takes the colour the user chose, and the
 *   marks drawn on it the matching light or dark set.
 * - 3D view: the preview of the finished job in place of the bed, so the bed's zoom and colour controls and the
 *   editing tools leave the header for the material toolbar, with the same generation progress or out-of-date banner.
 * - The other tools are not built yet. SVG files dropped on the bed are imported, but not in 3D, which has no bed.
 *
 * Its element is the host that dialogs and drawers render into.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Layout, Segmented } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { BED_VIEW_MODE } from '../../utils/bed/bed.view.constants';
import type { BedViewMode } from '../../utils/bed/bed.view.constants';
import { getBedOverlayTone } from '../../utils/bed/get.bed.overlay.tone';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import type { GrblResolvedStatus } from '../../utils/grbl/interfaces/GrblResolvedStatus';
import { useBedDimensions } from '../../utils/hooks/use.bed.dimensions';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectBedColour } from '../../utils/states/bed.appearance.state';
import { selectMachineStatus } from '../../utils/states/machine.status.state';
import { DEFAULT_TOOLPATH_DISPLAY_MODE } from '../../utils/toolpath/toolpath.drawing.constants';
import type { ToolpathDisplayMode } from '../../utils/toolpath/toolpath.drawing.constants';
import { BedObjects } from '../BedObjects';
import { BedViewport } from '../BedViewport';
import { BurnPreviewPane } from '../BurnPreviewPane';
import { BurnPreviewToolbar } from '../BurnPreviewToolbar';
import { SimulationPlaybackBar } from '../SimulationPlaybackBar';
import { ToastStack } from '../ToastStack';
import { ToolpathLayer } from '../ToolpathLayer';
import { ToolpathStatusOverlay } from '../ToolpathStatusOverlay';
import { ToolpathToolbar } from '../ToolpathToolbar';
import { ToolpathWarningsPanel } from '../ToolpathWarningsPanel';
import { BedMoreToolsMenu } from './BedMoreToolsMenu';
import { BED_DROP_AREA_TEST_ID, BED_VIEWPORT_KEY_SEPARATOR } from './bed.panel.constants';
import { BED_PLACEHOLDER_LABEL_KEYS } from './bed.placeholder.constants';
import { BED_VIEW_MODE_OPTION_KEYS, BED_VIEW_MODE_SWITCH_NAME } from './bed.toolbar.constants';
import type { BedPanelProps } from './interfaces/BedPanelProps';
import type { BedSurfaceStyle } from './interfaces/BedSurfaceStyle';
import type { BedViewModeControls } from './interfaces/BedViewModeControls';
import type { BedViewModeOption } from './interfaces/BedViewModeOption';
import type { BedViewModeOptionKey } from './interfaces/BedViewModeOptionKey';
import type { SvgFileDropArea } from './interfaces/SvgFileDropArea';
import styles from './styles.module.scss';
import { useBedViewMode } from './use.bed.view.mode';
import { useSvgFileDrop } from './use.svg.file.drop';

export const BedPanel = ({ hostRef, isWide }: BedPanelProps): ReactNode => {
  const { t } = useTranslation();
  const status: GrblResolvedStatus | undefined = useSelector(selectMachineStatus);
  const dimensions: BedDimensions = useBedDimensions();
  const bedColour: string = useSelector(selectBedColour);
  const bedSurfaceStyle: BedSurfaceStyle = { '--color-bed-surface': bedColour };
  const placeholderKey: string | undefined = BED_PLACEHOLDER_LABEL_KEYS[dimensions.placeholderKind];
  const [viewControlsHost, setViewControlsHost] = useState<HTMLDivElement | null>(null);
  const [toolpathDisplayMode, setToolpathDisplayMode] = useState<ToolpathDisplayMode>(DEFAULT_TOOLPATH_DISPLAY_MODE);
  const [isTravelShown, setIsTravelShown] = useState<boolean>(false);
  const { viewMode, changeBedViewMode }: BedViewModeControls = useBedViewMode();
  const isToolpathView: boolean = viewMode === BED_VIEW_MODE.TOOLPATH;
  const isThreeDView: boolean = viewMode === BED_VIEW_MODE.THREE_D;
  const dropArea: SvgFileDropArea = useSvgFileDrop(!isThreeDView);
  const viewModeOptions: BedViewModeOption[] = BED_VIEW_MODE_OPTION_KEYS.map((option: BedViewModeOptionKey) => ({
    value: option.value,
    label: t(option.labelKey),
  }));

  return (
    <Layout.Content className={styles.bedPanel}>
      {/* A plain heading, read by screen readers only: the panel's controls already say what it is. */}
      <h2 className={styles.title}>{t(DEFAULT.BED_PANEL_TITLE)}</h2>
      <div className={styles.header}>
        {isToolpathView && (
          <div className={styles.editingTools}>
            <ToolpathToolbar
              displayMode={toolpathDisplayMode}
              onDisplayModeChange={setToolpathDisplayMode}
              isTravelShown={isTravelShown}
              onTravelShownChange={setIsTravelShown}
            />
            <ToolpathWarningsPanel />
          </div>
        )}
        {isThreeDView && (
          <div className={styles.editingTools}>
            <BurnPreviewToolbar />
          </div>
        )}
        <div className={styles.viewTools}>
          {/* A plain slot: the bed viewport renders its zoom, Fit and bed colour controls in here. */}
          <div ref={setViewControlsHost} className={styles.viewControlsHost} />
          <Segmented<BedViewMode>
            name={BED_VIEW_MODE_SWITCH_NAME}
            aria-label={t(DEFAULT.BED_VIEW_MODE_LABEL)}
            options={viewModeOptions}
            value={viewMode}
            onChange={changeBedViewMode}
          />
          {/* Its entries are about editing, which the 3D view does not do. */}
          {!isThreeDView && <BedMoreToolsMenu />}
        </div>
      </div>
      {/* The region dialogs and drawers open in: everything below the header, so they never cover the toolbar. */}
      <div ref={hostRef} className={styles.bedBody}>
        <div
          className={dropArea.isDropTarget ? [styles.bed, styles.dropTarget].join(' ') : styles.bed}
          data-testid={BED_DROP_AREA_TEST_ID}
          data-drop-target={dropArea.isDropTarget}
          // The chosen bed colour and the set of mark colours that stays legible on it; both change at run time.
          data-bed-tone={getBedOverlayTone(bedColour)}
          // eslint-disable-next-line no-restricted-syntax -- runtime-only colour
          style={bedSurfaceStyle}
          onDragOver={dropArea.handleDragOver}
          onDragLeave={dropArea.handleDragLeave}
          onDrop={dropArea.handleDrop}
        >
          {isThreeDView ? (
            <BurnPreviewPane />
          ) : (
            <BedViewport
            // A new bed size starts a new view, fitted to the new bed.
              key={[dimensions.widthMm, dimensions.heightMm].join(BED_VIEWPORT_KEY_SEPARATOR)}
              dimensions={dimensions}
              isWide={isWide}
              controlsHost={viewControlsHost}
              // The Toolpath view draws the simulated head and the profile's work zero, so the live markers would only
              // add a second crosshair.
              headPosition={isToolpathView ? undefined : status?.machinePosition}
              workOriginPosition={isToolpathView ? undefined : status?.workCoordinateOffset}
              placeholderLabel={placeholderKey && t(placeholderKey)}
            >
              {isToolpathView ? (
                <ToolpathLayer
                  dimensions={dimensions}
                  displayMode={toolpathDisplayMode}
                  isTravelShown={isTravelShown}
                />
              ) : (
                <BedObjects dimensions={dimensions} />
              )}
            </BedViewport>
          )}
          {(isToolpathView || isThreeDView) && <ToolpathStatusOverlay isGeneratingOrFailedOnly={isThreeDView} />}
        </div>
        {isToolpathView && <SimulationPlaybackBar />}
      </div>
      <ToastStack isWide={isWide} />
    </Layout.Content>
  );
};
