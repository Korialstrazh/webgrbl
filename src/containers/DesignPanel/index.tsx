/**
 * The left region for the design tools: layers, the material of the project with its library, objects and the Cut
 * check, in the same order and places in every view so Layers never moves. The material is chosen in Design and 3D (it
 * drives the burn look), the test sample is added in the Design view only, objects are not edited in 3D and the Cut
 * check runs in 3D only: a card that does not apply stays as a muted heading line whose info icon says where it
 * applies.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BlockOutlined, EyeInvisibleOutlined, GroupOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
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
import { IconActionButton } from '../../views/IconActionButton';
import { MaterialSheetIcon } from '../../views/MaterialSheetIcon';
import { PaletteIcon } from '../../views/PaletteIcon';
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
  // The material drives the 3D burn look, so its card is live in 3D as well as in Design.
  const isMaterialView: boolean = isDesignView || isThreeDView;

  return (
    <Layout.Sider
      className={styles.region}
      classNames={{ body: styles.designPanel }}
      width={DESIGN_PANEL_WIDTH}
      aria-label={t(DEFAULT.DESIGN_PANEL_TITLE)}
    >
      <div className={styles.cards}>
        <Panel
          iconComponent={<BlockOutlined />}
          title={t(DEFAULT.DESIGN_LAYERS_TITLE)}
          headerActionComponent={
            <span className={styles.layersActions}>
              {isDesignView && <AddTestSampleButton isIconOnly />}
              <IconActionButton
                size={ANTD_BUTTON_SIZE_SMALL}
                labelText={t(DEFAULT.LAYERS_OPEN_PALETTE)}
                iconComponent={<PaletteIcon />}
                onClick={() => setIsPaletteDialogOpen(true)}
              />
            </span>
          }
        >
          <LayersSection onEditPalette={() => setIsPaletteDialogOpen(true)} />
        </Panel>
        <Panel
          iconComponent={<MaterialSheetIcon />}
          title={t(DEFAULT.DESIGN_MATERIAL_TITLE)}
          noteText={isMaterialView ? undefined : t(DEFAULT.DESIGN_MATERIAL_DESIGN_ONLY_NOTE)}
          noteIconComponent={<EyeInvisibleOutlined />}
        >
          <MaterialSection />
        </Panel>
        <Panel
          iconComponent={<GroupOutlined />}
          title={t(DEFAULT.DESIGN_OBJECTS_TITLE)}
          noteText={isThreeDView ? t(DEFAULT.DESIGN_OBJECTS_NOT_IN_3D_NOTE) : undefined}
          noteIconComponent={<EyeInvisibleOutlined />}
        >
          <ObjectsSection />
        </Panel>
        {/* An ordinary card after Objects, so it never covers an object row or its fields. */}
        <CutCheckPanel isActive={isThreeDView} />
      </div>
      <PaletteDialog isOpen={isPaletteDialogOpen} onClose={() => setIsPaletteDialogOpen(false)} />
    </Layout.Sider>
  );
};
