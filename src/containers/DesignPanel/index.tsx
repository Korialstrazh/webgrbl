/**
 * The left region for the design tools: the material of the project with its library, layers and objects. The
 * material and the test sample are chosen and added in the Design view only. In the 3D view it shows the Cut check
 * above the layers, and the objects leave, as they cannot be edited there.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Layout } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL } from '../../utils/antd.constants';
import { BED_VIEW_MODE } from '../../utils/bed/bed.view.constants';
import type { BedViewMode } from '../../utils/bed/bed.view.constants';
import { DESIGN_PANEL_WIDTH } from '../../utils/layout.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectBedViewMode } from '../../utils/states/bed.view.state';
import { Panel } from '../../views/Panel';
import { AddTestSampleButton } from '../AddTestSampleButton';
import { CutCheckPanel } from '../CutCheckPanel';
import { LayersSection } from '../LayersSection';
import { ObjectsSection } from '../ObjectsSection';
import { MaterialSection } from '../MaterialSection';
import { PaletteDialog } from '../PaletteDialog';
import styles from './styles.module.scss';

export const DesignPanel = (): ReactNode => {
  const { t } = useTranslation();
  const [isPaletteDialogOpen, setIsPaletteDialogOpen] = useState<boolean>(false);
  const viewMode: BedViewMode = useSelector(selectBedViewMode);
  const isDesignView: boolean = viewMode === BED_VIEW_MODE.DESIGN;
  const isThreeDView: boolean = viewMode === BED_VIEW_MODE.THREE_D;

  return (
    <Layout.Sider
      className={styles.region}
      classNames={{ body: styles.designPanel }}
      width={DESIGN_PANEL_WIDTH}
      aria-label={t(DEFAULT.DESIGN_PANEL_TITLE)}
    >
      {isThreeDView && <CutCheckPanel />}
      {isDesignView && (
        <Panel title={t(DEFAULT.DESIGN_MATERIAL_TITLE)}>
          <MaterialSection />
        </Panel>
      )}
      <Panel
        title={t(DEFAULT.DESIGN_LAYERS_TITLE)}
        headerActionComponent={
          <Button size={ANTD_BUTTON_SIZE_SMALL} onClick={() => setIsPaletteDialogOpen(true)}>
            {t(DEFAULT.LAYERS_OPEN_PALETTE)}
          </Button>
        }
      >
        <div className={styles.layersContent}>
          <LayersSection onEditPalette={() => setIsPaletteDialogOpen(true)} />
          {isDesignView && <AddTestSampleButton />}
        </div>
      </Panel>
      {!isThreeDView && (
        <Panel title={t(DEFAULT.DESIGN_OBJECTS_TITLE)}>
          <ObjectsSection />
        </Panel>
      )}
      <PaletteDialog isOpen={isPaletteDialogOpen} onClose={() => setIsPaletteDialogOpen(false)} />
    </Layout.Sider>
  );
};
