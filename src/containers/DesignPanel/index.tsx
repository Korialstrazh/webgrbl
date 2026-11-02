/**
 * The left region for the design tools: layers and objects. The material panel is planned and stays off the screen
 * until it is built.
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
import { ANTD_BUTTON_SIZE_SMALL } from '../../utils/antd.constants';
import { DESIGN_PANEL_WIDTH } from '../../utils/layout.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { Panel } from '../../views/Panel';
import { LayersSection } from '../LayersSection';
import { ObjectsSection } from '../ObjectsSection';
import { PaletteDialog } from '../PaletteDialog';
import styles from './styles.module.scss';

export const DesignPanel = (): ReactNode => {
  const { t } = useTranslation();
  const [isPaletteDialogOpen, setIsPaletteDialogOpen] = useState<boolean>(false);

  return (
    <Layout.Sider
      className={styles.region}
      classNames={{ body: styles.designPanel }}
      width={DESIGN_PANEL_WIDTH}
      aria-label={t(DEFAULT.DESIGN_PANEL_TITLE)}
    >
      <Panel
        title={t(DEFAULT.DESIGN_LAYERS_TITLE)}
        headerActionComponent={
          <Button size={ANTD_BUTTON_SIZE_SMALL} onClick={() => setIsPaletteDialogOpen(true)}>
            {t(DEFAULT.LAYERS_OPEN_PALETTE)}
          </Button>
        }
      >
        <LayersSection onEditPalette={() => setIsPaletteDialogOpen(true)} />
      </Panel>
      <Panel title={t(DEFAULT.DESIGN_OBJECTS_TITLE)}>
        <ObjectsSection />
      </Panel>
      <PaletteDialog isOpen={isPaletteDialogOpen} onClose={() => setIsPaletteDialogOpen(false)} />
    </Layout.Sider>
  );
};
