/**
 * The central region: a toolbar above the bed drawn to scale with the project objects on it; the toasts are anchored to
 * its top right. The toolbar switches between the Select and Move tools; the other tools and the view modes are not
 * built yet. SVG files dropped on the bed are imported.
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
import { BedView } from '../../views/BedView';
import { ComingSoon } from '../../views/ComingSoon';
import { BedObjects } from '../BedObjects';
import { ToastStack } from '../ToastStack';
import { BED_DROP_AREA_TEST_ID } from './bed.panel.constants';
import { BED_PLACEHOLDER_LABEL_KEYS } from './bed.placeholder.constants';
import {
  BED_COMING_SOON_TOOL_LABEL_KEYS,
  BED_TOOL,
  BED_TOOL_OPTION_KEYS,
  BED_VIEW_MODE_DESIGN,
  BED_VIEW_MODE_OPTION_KEYS,
} from './bed.toolbar.constants';
import type { BedTool } from './bed.toolbar.constants';
import type { BedPanelProps } from './interfaces/BedPanelProps';
import type { BedToolOption } from './interfaces/BedToolOption';
import type { BedToolOptionKey } from './interfaces/BedToolOptionKey';
import type { BedViewModeOption } from './interfaces/BedViewModeOption';
import type { BedViewModeOptionKey } from './interfaces/BedViewModeOptionKey';
import type { SvgFileDropArea } from './interfaces/SvgFileDropArea';
import styles from './styles.module.scss';
import { useSvgFileDrop } from './use.svg.file.drop';

export const BedPanel = ({ hostRef, isWide }: BedPanelProps): ReactNode => {
  const { t } = useTranslation();
  const status: GrblResolvedStatus | undefined = useSelector(selectMachineStatus);
  const dimensions: BedDimensions = useBedDimensions();
  const placeholderKey: string | undefined = BED_PLACEHOLDER_LABEL_KEYS[dimensions.placeholderKind];
  const [activeTool, setActiveTool] = useState<BedTool>(BED_TOOL.SELECT);
  const dropArea: SvgFileDropArea = useSvgFileDrop();
  const toolOptions: BedToolOption[] = BED_TOOL_OPTION_KEYS.map((option: BedToolOptionKey) => ({
    value: option.value,
    label: t(option.labelKey),
  }));
  const viewModeOptions: BedViewModeOption[] = BED_VIEW_MODE_OPTION_KEYS.map((option: BedViewModeOptionKey) => ({
    value: option.value,
    label: t(option.labelKey),
  }));

  return (
    <Layout.Content ref={hostRef} className={styles.bedPanel}>
      {/* A plain heading: antd Typography.Title would add its own margins and colours. */}
      <h2 className={styles.title}>{t(DEFAULT.BED_PANEL_TITLE)}</h2>
      <div className={styles.toolbar}>
        <Segmented<BedTool>
          aria-label={t(DEFAULT.BED_TOOL_LABEL)}
          options={toolOptions}
          value={activeTool}
          onChange={setActiveTool}
        />
        <ComingSoon description={t(DEFAULT.BED_TOOLBAR_DESCRIPTION)}>
          <div className={styles.toolbar}>
            {BED_COMING_SOON_TOOL_LABEL_KEYS.map((labelKey: string) => (
              <Button key={labelKey} onClick={doNothing}>
                {t(labelKey)}
              </Button>
            ))}
            <Segmented
              aria-label={t(DEFAULT.BED_VIEW_MODE_LABEL)}
              options={viewModeOptions}
              value={BED_VIEW_MODE_DESIGN}
              onChange={doNothing}
            />
          </div>
        </ComingSoon>
      </div>
      <div
        className={dropArea.isDropTarget ? [styles.bed, styles.dropTarget].join(' ') : styles.bed}
        data-testid={BED_DROP_AREA_TEST_ID}
        data-drop-target={dropArea.isDropTarget}
        onDragOver={dropArea.handleDragOver}
        onDragLeave={dropArea.handleDragLeave}
        onDrop={dropArea.handleDrop}
      >
        <BedView
          dimensions={dimensions}
          headPosition={status?.machinePosition}
          workOriginPosition={status?.workCoordinateOffset}
          placeholderLabel={placeholderKey && t(placeholderKey)}
        >
          <BedObjects dimensions={dimensions} activeTool={activeTool} />
        </BedView>
      </div>
      <ToastStack isWide={isWide} />
    </Layout.Content>
  );
};
