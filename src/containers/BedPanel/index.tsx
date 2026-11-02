/**
 * The central region: a toolbar above the bed drawn to scale; the toasts are anchored to its top right.
 *
 * - Design view: the project objects on the bed, edited with the Select and Move tools.
 * - Toolpath view: the real job at the simulation time instead of the objects (no editing there), with its colour and
 *   travel toggles, the job size and estimate, the generation progress or out-of-date banner, the warnings, and the
 *   simulation playback bar below the bed.
 * - The bed zooms and pans in both views (see BedViewport).
 * - The other tools and the 3D view are not built yet. SVG files dropped on the bed are imported.
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
import { Button, Layout, Segmented } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import { doNothing } from '../../utils/do.nothing';
import type { GrblResolvedStatus } from '../../utils/grbl/interfaces/GrblResolvedStatus';
import { useBedDimensions } from '../../utils/hooks/use.bed.dimensions';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectMachineStatus } from '../../utils/states/machine.status.state';
import { DEFAULT_TOOLPATH_DISPLAY_MODE } from '../../utils/toolpath/toolpath.drawing.constants';
import type { ToolpathDisplayMode } from '../../utils/toolpath/toolpath.drawing.constants';
import { ComingSoon } from '../../views/ComingSoon';
import { BedObjects } from '../BedObjects';
import { BedViewport } from '../BedViewport';
import { SimulationPlaybackBar } from '../SimulationPlaybackBar';
import { ToastStack } from '../ToastStack';
import { ToolpathLayer } from '../ToolpathLayer';
import { ToolpathStatusOverlay } from '../ToolpathStatusOverlay';
import { ToolpathToolbar } from '../ToolpathToolbar';
import { ToolpathWarningsPanel } from '../ToolpathWarningsPanel';
import { BED_DROP_AREA_TEST_ID, BED_VIEWPORT_KEY_SEPARATOR } from './bed.panel.constants';
import { BED_PLACEHOLDER_LABEL_KEYS } from './bed.placeholder.constants';
import {
  BED_COMING_SOON_TOOL_LABEL_KEYS,
  BED_TOOL,
  BED_TOOL_OPTION_KEYS,
  BED_VIEW_MODE,
  BED_VIEW_MODE_OPTION_KEYS,
} from './bed.toolbar.constants';
import type { BedTool, BedViewMode } from './bed.toolbar.constants';
import type { BedPanelProps } from './interfaces/BedPanelProps';
import type { BedToolOption } from './interfaces/BedToolOption';
import type { BedToolOptionKey } from './interfaces/BedToolOptionKey';
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
  const placeholderKey: string | undefined = BED_PLACEHOLDER_LABEL_KEYS[dimensions.placeholderKind];
  const [activeTool, setActiveTool] = useState<BedTool>(BED_TOOL.SELECT);
  const [toolpathDisplayMode, setToolpathDisplayMode] = useState<ToolpathDisplayMode>(DEFAULT_TOOLPATH_DISPLAY_MODE);
  const [isTravelShown, setIsTravelShown] = useState<boolean>(false);
  const { viewMode, changeBedViewMode }: BedViewModeControls = useBedViewMode();
  const isToolpathView: boolean = viewMode === BED_VIEW_MODE.TOOLPATH;
  const dropArea: SvgFileDropArea = useSvgFileDrop();
  const toolOptions: BedToolOption[] = BED_TOOL_OPTION_KEYS.map((option: BedToolOptionKey) => ({
    value: option.value,
    label: t(option.labelKey),
  }));
  const viewModeOptions: BedViewModeOption[] = BED_VIEW_MODE_OPTION_KEYS.map((option: BedViewModeOptionKey) => ({
    value: option.value,
    label: t(option.labelKey),
    disabled: option.isDisabled,
  }));

  return (
    <Layout.Content ref={hostRef} className={styles.bedPanel}>
      {/* A plain heading, read by screen readers only: the panel's controls already say what it is. */}
      <h2 className={styles.title}>{t(DEFAULT.BED_PANEL_TITLE)}</h2>
      <div className={styles.header}>
        {isToolpathView ? (
          <ToolpathToolbar
            displayMode={toolpathDisplayMode}
            onDisplayModeChange={setToolpathDisplayMode}
            isTravelShown={isTravelShown}
            onTravelShownChange={setIsTravelShown}
          />
        ) : (
          <div className={styles.editingTools}>
            <Segmented<BedTool>
              aria-label={t(DEFAULT.BED_TOOL_LABEL)}
              options={toolOptions}
              value={activeTool}
              onChange={setActiveTool}
            />
            <ComingSoon description={t(DEFAULT.BED_TOOLBAR_DESCRIPTION)}>
              <div className={styles.editingTools}>
                {BED_COMING_SOON_TOOL_LABEL_KEYS.map((labelKey: string) => (
                  <Button key={labelKey} onClick={doNothing}>
                    {t(labelKey)}
                  </Button>
                ))}
              </div>
            </ComingSoon>
          </div>
        )}
        <Segmented<BedViewMode>
          className={styles.viewModeSwitch}
          aria-label={t(DEFAULT.BED_VIEW_MODE_LABEL)}
          options={viewModeOptions}
          value={viewMode}
          onChange={changeBedViewMode}
        />
      </div>
      <div
        className={dropArea.isDropTarget ? [styles.bed, styles.dropTarget].join(' ') : styles.bed}
        data-testid={BED_DROP_AREA_TEST_ID}
        data-drop-target={dropArea.isDropTarget}
        onDragOver={dropArea.handleDragOver}
        onDragLeave={dropArea.handleDragLeave}
        onDrop={dropArea.handleDrop}
      >
        <BedViewport
          // A new bed size starts a new view, fitted to the new bed.
          key={[dimensions.widthMm, dimensions.heightMm].join(BED_VIEWPORT_KEY_SEPARATOR)}
          dimensions={dimensions}
          isWide={isWide}
          // The Toolpath view draws the simulated head and the profile's work zero, so the live markers would only
          // add a second crosshair.
          headPosition={isToolpathView ? undefined : status?.machinePosition}
          workOriginPosition={isToolpathView ? undefined : status?.workCoordinateOffset}
          placeholderLabel={placeholderKey && t(placeholderKey)}
        >
          {isToolpathView ? (
            <ToolpathLayer dimensions={dimensions} displayMode={toolpathDisplayMode} isTravelShown={isTravelShown} />
          ) : (
            <BedObjects dimensions={dimensions} activeTool={activeTool} />
          )}
        </BedViewport>
        {isToolpathView && <ToolpathStatusOverlay />}
        {isToolpathView && <ToolpathWarningsPanel />}
      </div>
      {isToolpathView && <SimulationPlaybackBar />}
      <ToastStack isWide={isWide} />
    </Layout.Content>
  );
};
