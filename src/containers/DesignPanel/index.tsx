/**
 * The left region for the design tools: layers, objects and material. Layers and objects work; material is still
 * coming soon.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Layout } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DESIGN_PANEL_WIDTH } from '../../utils/layout.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { ComingSoon } from '../../views/ComingSoon';
import { Panel } from '../../views/Panel';
import { LayersSection } from '../LayersSection';
import { ObjectsSection } from '../ObjectsSection';
import styles from './styles.module.scss';

// The palette dialog is not built yet; until it is, the Edit palette button does nothing.
const openPaletteDialog = (): void => undefined;

export const DesignPanel = (): ReactNode => {
  const { t } = useTranslation();

  return (
    <Layout.Sider
      className={styles.region}
      classNames={{ body: styles.designPanel }}
      width={DESIGN_PANEL_WIDTH}
      aria-label={t(DEFAULT.DESIGN_PANEL_TITLE)}
    >
      <Panel title={t(DEFAULT.DESIGN_LAYERS_TITLE)}>
        <LayersSection onEditPalette={openPaletteDialog} />
      </Panel>
      <Panel title={t(DEFAULT.DESIGN_OBJECTS_TITLE)}>
        <ObjectsSection />
      </Panel>
      <Panel title={t(DEFAULT.DESIGN_MATERIAL_TITLE)}>
        <ComingSoon description={t(DEFAULT.DESIGN_MATERIAL_DESCRIPTION)}>
          <div className={styles.placeholder} />
        </ComingSoon>
      </Panel>
    </Layout.Sider>
  );
};
